import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const m3u8Url = request.nextUrl.searchParams.get('m3u8');
  if (!m3u8Url) {
    throw new Error('missing m3u8 param');
  }

  const referer = request.nextUrl.searchParams.get('referer');
  const key = request.nextUrl.searchParams.get('key');
  const m3u8 = await fetch(m3u8Url, {
    headers: referer ? { Referer: referer } : {},
  });
  const m3u8Text = await m3u8.text();

  return new Response(processM3u8(m3u8Url, m3u8Text, key), {
    headers: { 'Content-Type': 'application/vnd.apple.mpegurl' },
  });
}

function processM3u8(
  m3u8Url: string,
  m3u8: string,
  key: string | null
): string {
  const lines = m3u8.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (key && line.startsWith('#EXT-X-KEY:')) {
      line = handleKeyLine(line, key);
    }
    if (line.endsWith('.ts')) {
      line = new URL(line, m3u8Url).toString();
    }
    lines[i] = line;
  }
  return lines.join('\n');
}

function handleKeyLine(line: string, key: string): string {
  const firstColon = line.indexOf(':');
  const parts = [line.substring(0, firstColon), line.substring(firstColon + 1)];
  const components = parts[1].split(',');

  for (let i = 0; i < components.length; i++) {
    let component = components[i];
    if (component.startsWith('URI=')) {
      component = `URI="/api/key?key=${key}"`;
    }
    components[i] = component;
  }
  return [parts[0], components.join(',')].join(':');
}
