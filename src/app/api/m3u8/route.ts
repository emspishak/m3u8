import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const m3u8Url = request.nextUrl.searchParams.get('m3u8');
  if (!m3u8Url) {
    throw new Error('missing m3u8 param');
  }

  const referer = request.nextUrl.searchParams.get('referer');
  const m3u8 = await fetch(m3u8Url, {
    headers: referer ? { Referer: referer } : {},
  });
  const m3u8Text = await m3u8.text();

  return new Response(processM3u8(m3u8Url, m3u8Text), {
    headers: { 'Content-Type': 'application/vnd.apple.mpegurl' },
  });
}

function processM3u8(m3u8Url: string, m3u8: string): string {
  const lines = m3u8.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.endsWith('.ts')) {
      line = new URL(line, m3u8Url).toString();
    }
    lines[i] = line;
  }
  return lines.join('\n');
}
