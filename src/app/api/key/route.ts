import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new Response(
    Buffer.from(request.nextUrl.searchParams.get('key') || '', 'base64'),
    {
      headers: { 'Content-Type': 'application/octet-stream' },
    }
  );
}
