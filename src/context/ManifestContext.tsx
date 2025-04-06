'use client';

import { manifestPath } from '@/config/const';
import { useEffect, useState } from 'react';
import { MsgContext } from './MessageContext';

// interface ManifestEditorProps {
//   refreshKey: number;
//   onError: (message: string, type: "success" | "error") => void;
// }

const ManifestEditor: React.FC<MsgContext> = ({ refreshKey, onError, onSuccess }) => {
  const [manifestContent, setManifestContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch the current manifest file content when the component mounts
  useEffect(() => {
    const fetchManifest = async () => {
      setLoading(true);
      const response = await fetch('/api/manifest');
      const data = await response.json();

      if (response.status == 404)
      {
        return onError("Failed to load manifest.");
      }

      if (response.status == 400)
      {
        onError("Manifest file is empty");
      }

      if (data.content) {
        setManifestContent(data.content);
        setNewContent(data.content);
      }
      setLoading(false);
    };
    fetchManifest();
  }, [refreshKey]);

  // Handle saving the updated manifest content
  const handleSave = async () => {
    const response = await fetch('/api/manifest', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newContent }),
    });

    const data = await response.json();
    if (data.message) {
      onError('Manifest updated successfully.');
      setManifestContent(newContent); // Update the displayed content
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
