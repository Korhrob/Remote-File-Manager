'use client';

import { patchesPath, maxFileSize } from '@/config/const';
import { useEffect, useState, useRef } from 'react';

interface FileManagerProps {
	refreshKey: number;
	onError: (message: string) => void;
	onSuccess: (message: string)  => void;
}

const FileManager: React.FC<FileManagerProps> = ({ refreshKey, onError, onSuccess}) => {

    const [trackedFiles, setTrackedFiles] = useState<string[]>([]);
    const [untrackedFiles, setUntrackedFiles] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/file/list");
                if (!res.ok) {
                    throw new Error("Failed to fetch files");
                }
                const data = await res.json();
                setTrackedFiles(data.tracked);
                setUntrackedFiles(data.untracked); 
            } catch (error) {
				onError("Could not fetch patch files.");
            }
            setLoading(false);
        };
        fetchFiles();
    }, [refreshKey]);

    const handleTrack = async (file: string) => {
        try {
        const response = await fetch('/api/file/track', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: file }),
        });

        const data = await response.json();
        if (data.message) {
            setUntrackedFiles((prev) => prev.filter((f) => f !== file));
            setTrackedFiles((prev) => [...prev, file]);
            //setRefreshKey(prevKey => prevKey + 1); // Should be used in page
            onSuccess(`File ${file} has been tracked.`);
        } else {
            onError("Failed to track file.");
        }
        } catch (error) {
            onError("Error tracking file.");
        }
    };

    const handleDelete = async (filename: string) => {

        const confirmDelete = window.confirm(`Are you sure you want to delete the file: ${filename}?`);

        if (!confirmDelete) {
            return;
        }

        try {
            const res = await fetch(`/api/file/delete?filename=${filename}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (res.ok) {
                setTrackedFiles((prevFiles) => prevFiles.filter((file) => file !== filename));
                setUntrackedFiles((prevFiles) => prevFiles.filter((file) => file !== filename));
                onSuccess(`File deleted successfully: ${filename}`);
            } else {
                onError(`Error: ${data.error}`);
            }
        } catch (error) {
            onError("An error occurred during deletion.");
        }
    };

    const handleRename = async (oldFilename: string) => {
        const newFilename = prompt(`Rename "${oldFilename}" to:`);
        if (!newFilename || newFilename.trim() === oldFilename) return;
    
        try {
            const res = await fetch("/api/file/rename", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldFilename, newFilename }),
            });
    
            const data = await res.json();
            if (res.ok) {
                setTrackedFiles(prev => prev.map(f => (f === oldFilename ? newFilename : f)));
                setUntrackedFiles(prev => prev.map(f => (f === oldFilename ? newFilename : f)));
                onSuccess(`Renamed "${oldFilename}" to "${newFilename}"`);
            } else {
                onError(`Error: ${data.error}`);
            }
        } catch (error) {
            onError("An error occurred during renaming.");
        }
    };


    const triggerFileInput = () => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            onError("No file selected.");
            return;
        }

        const res = await fetch(`/api/file/upload?filename=${encodeURIComponent(file.name)}`);
        const uploadData = await res.json();
        if (uploadData.exists) {
            onError("Error: File already exists");
            return;
        }

		if (file.size > maxFileSize) {
			onError(`File size is too large! Maximum allowed size is ${process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE} MB.`);
			return;
		}

        try {
            const xhr = new XMLHttpRequest();
    
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percentComplete);
                }
            };
    
            xhr.onload = () => {
                console.log("onload trigger");
                const response = JSON.parse(xhr.response);
                if (xhr.status === 200) {
                    onSuccess(`File uploaded successfully: ${file.name}`);
                    setUntrackedFiles((prevFiles) => [...prevFiles, file.name]);
                    setUploadProgress(0);
                } else {
                    console.error(`Something wrong: ${response.error}, ${response.status}`);
                    onError(`Error: ${response.error}`);
                }
            };
    
            xhr.onerror = () => {
                onError(`Error: ${JSON.parse(xhr.response).error}`);
            };

            const formData = new FormData();
            formData.append("patch", file);
            xhr.open("POST", "/api/file/upload", true);
            xhr.send(formData);
        } catch (error) {
            onError("An error occurred during file upload.");
        }

    };

	return (
		<>
			<h1>Patch Files</h1>
			<p>{patchesPath}</p>
			
			<ul className="file-list">
                {loading && <p>"Loading..."</p> }

				{trackedFiles.map((file) => (
					<li key={file} className="tracked file-item">
						<span>{file}</span>
						<div className="file-actions">
							<button onClick={() => handleRename(file)}>Rename</button>
							<button className="delete-button" onClick={() => handleDelete(file)}>Delete</button>
						</div>
					</li>
				))}
				{untrackedFiles.map((file) => (
					<li key={file} className="untracked file-item">
						<span>{file}</span>
						<div className="file-actions">
							<button onClick={() => handleTrack(file)}>Track</button>
							<button onClick={() => handleRename(file)}>Rename</button>
							<button className="delete-button" onClick={() => handleDelete(file)}>Delete</button>
						</div>
					</li>
				))}
			</ul>

            {uploadProgress > 0 ? 
				<div className="bar-container">
					<div className="bar-fill" style={{width: `${uploadProgress}%`}}></div>
					<p className="bar-text">Uploading: {uploadProgress}%</p> 
				</div>
                : 
                <div style={{ textAlign: "center", marginTop: "30px" }}>
                    <button onClick={triggerFileInput}>Upload New File</button>
                    <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    className="upload-input"
                    />
                </div>
            }
		</>
	);

};

export default FileManager;