'use client';

import { useState } from 'react';

export default function Home() {
  const [curl, setCurl] = useState('');
  const [m3u8, setM3u8] = useState('');

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

  return (
    <>
      <h1>m3u8</h1>
      {m3u8 ? (
        <div>
          <video src={m3u8} controls autoPlay></video>
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
