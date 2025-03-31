'use client';

import { useEffect, useState } from 'react';

interface ManifestEditorProps {
  refreshKey: number;
  onError: (message: string, type: "success" | "error") => void;
}

const ManifestEditor: React.FC<ManifestEditorProps> = ({ refreshKey, onError }) => {
  const [manifestContent, setManifestContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // Fetch the current manifest file content when the component mounts
  useEffect(() => {
    const fetchManifest = async () => {
      const response = await fetch('/api/manifest');
      const data = await response.json();
      if (data.content) {
        setManifestContent(data.content);
        setNewContent(data.content);
      } else {
        if (onError) onError('Failed to load manifest.', "error");
      }
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
      if (onError) onError('Manifest updated successfully.', "success");
      setManifestContent(newContent); // Update the displayed content
      setIsEditing(false);
    } else {
      if (onError) onError('Failed to update manifest.', "error");
    }
  };

  return (
    <div>
      <h1>Manifest File Editor</h1>
      <p>manifest.txt</p>
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
	  {message && <div>{message}</div>}
    </div>
  );
};

export default ManifestEditor;
