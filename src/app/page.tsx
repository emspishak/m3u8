'use client';

import { useRef, useState } from 'react';
import styles from './styles.module.css';

export default function Home() {
  const [curl, setCurl] = useState('');
  const [m3u8, setM3u8] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  async function play() {
    const response = await fetch('/api/parse-curl', {
      method: 'POST',
      body: curl,
    });
    const json = await response.json();
    const m3u8Url = new URL('/api/m3u8', document.baseURI);
    m3u8Url.searchParams.set('m3u8', json.raw_url);
    setM3u8(m3u8Url.toString());
  }

  function skipToLive() {
    if (videoRef.current) {
      videoRef.current.currentTime = 999999999;
    }
  }

  return (
    <div className="m-2">
      <h1 className="text-3xl">m3u8</h1>
      {m3u8 ? (
        <div>
          <video src={m3u8} controls autoPlay ref={videoRef}></video>
          <button className={`${styles.btn} my-1`} onClick={skipToLive}>
            Skip to live
          </button>
        </div>
      ) : (
        <div>
          <label>
            Copy as curl:
            <textarea
              className="border-2 block w-100 h-50"
              value={curl}
              onChange={(e) => setCurl(e.target.value)}
            ></textarea>
          </label>
          <div>
            <button className={`${styles.btn} my-1`} onClick={play}>
              Play
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
