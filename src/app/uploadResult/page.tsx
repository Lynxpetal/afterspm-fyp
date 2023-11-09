'use client';

import { FileInput, Label } from 'flowbite-react';
import React, { useState, useEffect } from 'react';

export default function uploadResult() {
  const [message, setMessage] = useState('');

  const handleResultImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resultFileInput = e.target.files?.[0];

    //FormData - set a new value for existing key inside object, or add the key/value if it does not exist
    const formData = new FormData()
    formData.append("file", resultFileInput)
    
    fetch("http://localhost:5000/uploadResult", {
      method: "POST",
      body: formData,
    })
    .then((response) => response.json())
    .catch((error) => console.error("Error:", error))
  }

  useEffect(() => {

  }, []);

  return (
    <div>
      <p>{message}</p>
      <div id="fileUpload" className="max-w-md">
        <div className="mb-2 block">
          <Label htmlFor="file" value="Upload file" />
        </div>
        <FileInput
          id="file"
          onChange={(e) => { handleResultImageUpload(e) }}
        />
      </div>
    </div>
  );
}