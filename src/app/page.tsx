'use client';

import { useState } from 'react';

export default function Home() {
  const [curl, setCurl] = useState('');

  async function play() {
    const response = await fetch('/api/parse-curl', {
      method: 'POST',
      body: curl,
    });
    const json = await response.json();
    console.log(json);
  }

  return (
    <>
      <h1>m3u8</h1>
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
    </>
  );
}
