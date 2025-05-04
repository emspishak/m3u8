import { NextRequest } from 'next/server';

const PROXY_MEDIA_HOSTS = new Set([
  's-c2.aistrem.net',
  's-c3.aistrem.net',
  's-c4.aistrem.net',
]);

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

  return new Response(processM3u8(m3u8Url, m3u8Text, key, referer), {
    headers: { 'Content-Type': 'application/vnd.apple.mpegurl' },
  });
}

function processM3u8(
  m3u8Url: string,
  m3u8: string,
  key: string | null,
  referer: string | null
): string {
  const lines = m3u8.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (key && line.startsWith('#EXT-X-KEY:')) {
      line = handleKeyLine(line, key);
    }
    if (line.endsWith('.ts')) {
      line = handleMediaLine(line, m3u8Url, referer);
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

function handleMediaLine(
  line: string,
  m3u8Url: string,
  referer: string | null
): string {
  const mediaUrl = new URL(line, m3u8Url);
  if (PROXY_MEDIA_HOSTS.has(mediaUrl.host)) {
    const params = new URLSearchParams({ url: mediaUrl.toString() });
    if (referer) {
      params.set('referer', referer);
    }
    return `/api/media?${params}`;
  }
  return mediaUrl.toString();
}
