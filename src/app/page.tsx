'use client';

import { useRef, useState } from 'react';

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
    <>
      <h1>m3u8</h1>
      {m3u8 ? (
        <div>
          <video src={m3u8} controls autoPlay ref={videoRef}></video>
          <button onClick={skipToLive}>Skip to live</button>
        </div>
      ) : (
        <div>
          <label>
            Copy as curl
            <textarea
              value={curl}
              onChange={(e) => setCurl(e.target.value)}
            ></textarea>
          </label>
          <button onClick={play}>Play</button>
        </div>
      )}
    </>
  );
}
