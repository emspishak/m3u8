import M3u8Player from './m3u8-player';
import { toJsonObject } from 'curlconverter';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  let m3u8Url = undefined;
  const curlParam = atob((await searchParams).c ?? '');
  if (curlParam) {
    const json = toJsonObject(curlParam);
    m3u8Url = json.raw_url;
  }

  return <M3u8Player m3u8Url={m3u8Url}></M3u8Player>;
}
