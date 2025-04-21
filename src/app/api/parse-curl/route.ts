import { toJsonObject } from 'curlconverter';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const curlCommand = await request.text()
  return Response.json(toJsonObject(curlCommand));
}
