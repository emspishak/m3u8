import { NextRequest } from 'next/server';

const PROXY_MEDIA_HOSTS = new Set([
  's-c2.aistrem.net',
  's-c3.aistrem.net',
  's-c4.aistrem.net',
  'tv-fst.mlb.com',
]);

export async function GET(request: NextRequest) {
  const m3u8Url = request.nextUrl.searchParams.get('m3u8');
  if (!m3u8Url) {
    throw new Error('missing m3u8 param');
  }

  const referer = request.nextUrl.searchParams.get('referer');
  const key = request.nextUrl.searchParams.get('key');
  const token = request.nextUrl.searchParams.get('token');

  const m3u8 = await fetch(m3u8Url, {
    headers: referer ? { Referer: referer } : {},
  });
  const m3u8Text = await m3u8.text();

  return new Response(processM3u8(m3u8Url, m3u8Text, key, referer, token), {
    headers: { 'Content-Type': 'application/vnd.apple.mpegurl' },
  });
}

function processM3u8(
  m3u8Url: string,
  m3u8: string,
  key: string | null,
  referer: string | null,
  token: string | null
): string {
  const lines = m3u8.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (key && line.startsWith('#EXT-X-KEY:')) {
      line = handleKeyLine(line, key);
    } else if (line.startsWith('#EXT-X-MEDIA:')) {
      line = handleMediaLine(line, token);
    } else if (line && !line.startsWith('#')) {
      line = handleEntryLine(line, m3u8Url, referer, token);
    }
    lines[i] = line;
  }
  return lines.join('\n');
}

function handleExtendedLine(
  line: string,
  updater: (component: string) => string
): string {
  const firstColon = line.indexOf(':');
  const parts = [line.substring(0, firstColon), line.substring(firstColon + 1)];
  const components = parts[1].split(',');

  for (let i = 0; i < components.length; i++) {
    components[i] = updater(components[i]);
  }
  return [parts[0], components.join(',')].join(':');
}

function handleKeyLine(line: string, key: string): string {
  return handleExtendedLine(line, function (component: string): string {
    if (component.startsWith('URI=')) {
      return `URI="/api/key?key=${key}"`;
    }
    return component;
  });
}

function handleMediaLine(line: string, token: string | null): string {
  return handleExtendedLine(line, function (component: string): string {
    if (component.startsWith('URI=')) {
      const parts = component.split('=');
      const m3u8Url = parts[1].slice(1, -1);
      const params = new URLSearchParams({ m3u8: m3u8Url });
      if (token) {
        params.set('token', token);
      }
      return `URI="/api/m3u8?${params}"`;
    }
    return component;
  });
}

function handleEntryLine(
  line: string,
  m3u8Url: string,
  referer: string | null,
  token: string | null
): string {
  const mediaUrl = new URL(line, m3u8Url);

  if (line.endsWith('.m3u8')) {
    const params = new URLSearchParams({ m3u8: mediaUrl.toString() });
    if (token) {
      params.set('token', token);
    }
    return `/api/m3u8?${params}`;
  }

  if (PROXY_MEDIA_HOSTS.has(mediaUrl.host)) {
    const params = new URLSearchParams({ url: mediaUrl.toString() });
    if (referer) {
      params.set('referer', referer);
    }
    if (token) {
      params.set('token', token);
    }
    return `/api/media?${params}`;
  }
  return mediaUrl.toString();
}
