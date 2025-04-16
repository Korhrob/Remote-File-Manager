'use client';

import { manifestPath } from '@/config/const';
import { useEffect, useState } from 'react';
import { MsgContext } from './MessageContext';

const ManifestEditor: React.FC<MsgContext> = ({ refreshKey, onError, onSuccess }) => {
    const [manifestContent, setManifestContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      const fetchManifest = async () => {
        setLoading(true);
        const res = await fetch("/api/proxy/manifest", {
          method: "GET",
          headers: { 
              "Content-Type": "application/json", 
          },
        });
        const data = await res.json();

        if (res.status == 404)
        {
          return onError("Failed to load manifest.");
        }

        if (res.status == 400)
        {
          onError("Manifest file is empty");
          // Don't have to return on empty file
        }

        if (data.content) {
          setManifestContent(data.content);
          setNewContent(data.content);
        }
        setLoading(false);
      };
      fetchManifest();
    }, [refreshKey]);

    const handleSave = async () => {
      const response = await fetch('/api/proxy/manifest', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          "x-api-key": process.env.NEXT_API_KEY || ""
        },
        body: JSON.stringify({ content: newContent }),
      });

      const data = await response.json();
      if (data.message) {
        onSuccess('Manifest updated successfully.');
        setManifestContent(newContent);
        setIsEditing(false);
      } else {
        onError('Failed to update manifest.');
      }
    };

  return (
    <div>
      <h1>Manifest File Editor</h1>
      <p>{manifestPath}</p>
      {loading && <p>Loading...</p>}
      {!isEditing ? (
        <div>
          <pre>{manifestContent}</pre>
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      ) : (
        <div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={10}
            cols={50}
          />
          <br />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ManifestEditor;
