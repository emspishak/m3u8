'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import { useRouter, useSearchParams } from 'next/navigation';

export default function M3u8Player({
  m3u8Url,
  referer,
  encryptionKey,
  cdnToken,
}: {
  m3u8Url: string | undefined;
  referer: string | undefined;
  encryptionKey: string | undefined;
  cdnToken: string | undefined;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [editMode, setEditMode] = useState(false);

  async function play(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const curlElement = form.elements.namedItem(
      'curl'
    ) as HTMLTextAreaElement | null;
    const curl = curlElement?.value;

    const keyElement = form.elements.namedItem(
      'key'
    ) as HTMLInputElement | null;
    const key = keyElement?.value;

    const cdnTokenElement = form.elements.namedItem(
      'cdn-token'
    ) as HTMLInputElement | null;
    const token = cdnTokenElement?.value;

    let newUrl = '/';

    const params = new URLSearchParams();
    if (curl) {
      params.set('c', btoa(curl));
    }
    if (key) {
      params.set('k', key);
    }
    if (token) {
      params.set('t', token);
    }

    if (params.size > 0) {
      newUrl = `${newUrl}?${params}`;
    }

    setEditMode(false);
    router.push(newUrl);
  }

  function skipToLive() {
    if (videoRef.current) {
      videoRef.current.currentTime = 999999999;
    }
  }

  function enterEditMode() {
    setEditMode(true);
  }

  let newM3u8Url: string | undefined;
  if (m3u8Url) {
    const params = new URLSearchParams({ m3u8: m3u8Url });
    if (referer) {
      params.set('referer', referer);
    }
    if (encryptionKey) {
      params.set('key', encryptionKey);
    }
    if (cdnToken) {
      params.set('token', cdnToken);
    }
    newM3u8Url = `/api/m3u8?${params}`;
  }

  useEffect(() => {
    async function polyfillHls() {
      if (
        newM3u8Url &&
        videoRef.current &&
        !videoRef.current.canPlayType('application/vnd.apple.mpegurl')
      ) {
        const Hls = (await import('hls.js')).default;
        const hls = new Hls();
        hls.loadSource(newM3u8Url);
        hls.attachMedia(videoRef.current);
      }
    }
    polyfillHls();
  });

  return (
    <div className="m-2">
      <h1 className="text-3xl">m3u8</h1>
      {newM3u8Url && !editMode ? (
        <div>
          <video src={newM3u8Url} controls autoPlay ref={videoRef}></video>
          <button className={`${styles.btn} m-2`} onClick={skipToLive}>
            Skip to live
          </button>
          <button className={styles.btn} onClick={enterEditMode}>
            Edit command
          </button>
        </div>
      ) : (
        <form onSubmit={play}>
          <label>
            Copy as curl:
            <textarea
              className="border-2 block w-100 h-50"
              name="curl"
              defaultValue={atob(searchParams.get('c') || '')}
            ></textarea>
          </label>
          <label>
            Key:
            <input
              className="border-2"
              type="text"
              name="key"
              defaultValue={searchParams.get('k') || ''}
            ></input>
          </label>
          <label>
            CDN Token:
            <input
              className="border-2"
              type="text"
              name="cdn-token"
              defaultValue={searchParams.get('t') || ''}
            ></input>
          </label>
          <div>
            <button className={`${styles.btn} my-1`} type="submit">
              Play
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
