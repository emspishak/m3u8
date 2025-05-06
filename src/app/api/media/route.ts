import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    throw new Error('url param missing');
  }

  const referer = request.nextUrl.searchParams.get('referer');
  const token = request.nextUrl.searchParams.get('token');

  return fetch(url, {
    headers: {
      ...(referer ? { Referer: referer } : {}),
      ...(token ? { 'x-cdn-token': token } : {}),
    },
  });
}
