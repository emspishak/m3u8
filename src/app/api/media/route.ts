import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    throw new Error('url param missing');
  }

  const referer = request.nextUrl.searchParams.get('referer');
  return fetch(url, { headers: referer ? { Referer: referer } : {} });
}
