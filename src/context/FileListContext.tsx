'use client';

import { patchesPath, maxFileSize } from '@/config/const';
import { useEffect, useState, useRef } from 'react';
import { MsgContext } from './MessageContext';

const FileManager: React.FC<MsgContext> = ({ refreshKey, onError, onSuccess }) => {

    const [trackedFiles, setTrackedFiles] = useState<string[]>([]);
    const [untrackedFiles, setUntrackedFiles] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);
            try {
                console.log(`PUBLIC_API_KEY:\n${process.env.NEXT_PUBLIC_API_KEY}`);
                
                const res = await fetch("/api/file/list", {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json", 
                        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || ""
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch files");
                }

                const data = await res.json();
                setTrackedFiles(data.tracked || []);
                setUntrackedFiles(data.untracked || []); 
                const allFileItems = document.querySelectorAll('.file-item');
                allFileItems.forEach(item => {
                    item.classList.add("show");
                });

            } catch (error) {
				onError("Could not fetch patch files.");

            }
            setLoading(false);

        };
        fetchFiles();

    }, [refreshKey]);

    const triggerFileClass = (newFiles: string[], prevFiles: string[]) => {
        setTimeout(() => {
            newFiles.forEach((file) => {
                const fileItem = document.querySelector(`.file-item[data-file="${file}"]`);
                if (fileItem) {
                    fileItem.classList.add("show");
                }
            });
        }, 50);
    };

    const handleTrack = async (file: string) => {
        try {
        const response = await fetch('/api/file/track', {
            method: 'POST',
            headers: { 
                "Content-Type": "application/json",  
                "x-api-key": process.env.NEXT_PUBLIC_API_KEY || ""
            },
            body: JSON.stringify({ filename: file }),
        });

        const data = await response.json();
        if (data.message) {
            setUntrackedFiles((prev) => prev.filter((f) => f !== file));
            setTrackedFiles((prev) => [...prev, file]);
            //triggerFileClass([...trackedFiles, file], trackedFiles, 'tracked');
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
            const fileItem = document.querySelector(`.file-item[data-file="${filename}"]`);
            if (fileItem) {
                fileItem.classList.remove('show');
            }

            const res = await fetch(`/api/file/delete`, {
                method: "DELETE",
                headers: { 
                    "Content-Type": "application/json",  
                    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || ""
                },
                body: JSON.stringify({ filename }),
            });
            
            const data = await res.json();

            if (res.ok) {
                onSuccess(`File deleted successfully: ${filename}`);
                await new Promise(resolve => setTimeout(resolve, 300));
                setTrackedFiles((prevFiles) => prevFiles.filter((file) => file !== filename));
                setUntrackedFiles((prevFiles) => prevFiles.filter((file) => file !== filename));
            } else {
                onError(`Error: ${data.message}`);
            }
        } catch (error) {
            onError("An error occurred during deletion.");
        }
    };

    const handleRename = async (oldFilename: string) => {
        
        try {
            const newFilename = prompt(`Rename "${oldFilename}" to:`);
            if (!newFilename || newFilename.trim() === oldFilename) return;

            const check = await fetch(`/api/file/exist`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",  
                    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || ""
                },
                body: JSON.stringify({ filename: newFilename }),
            });
    
            const checkData = await check.json();
            if (checkData.exists) {
                onError("Error: File already exists");
                return;
            }

            const res = await fetch("/api/file/rename", {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",  
                    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || ""
                },
                body: JSON.stringify({ oldFilename, newFilename }),
            });
    
            const data = await res.json();
            if (res.ok) {
                setTrackedFiles(prev => prev.map(f => (f === oldFilename ? newFilename : f)));
                setUntrackedFiles(prev => prev.map(f => (f === oldFilename ? newFilename : f)));
                triggerFileClass([newFilename], []);
                onSuccess(`Renamed "${oldFilename}" to "${newFilename}"`);
            } else {
                onError(`Error: ${data.message}`);
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

        try {
            const file = e.target.files?.[0];
            if (!file) {
                onError("No file selected.");
                return;
            }
    
            const res = await fetch(`/api/file/exist`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",  
                    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || ""
                },
                body: JSON.stringify({ filename: file.name }),
            });
    
            const uploadData = await res.json();
            if (uploadData.exists) {
                onError("Error: File already exists");
                return;
            }
    
            if (file.size > maxFileSize) {
                onError(`File size is too large! Maximum allowed size is ${maxFileSize} MB.`);
                return;
            }

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
                    triggerFileClass([file.name], []);
                    setUploadProgress(0);
                } else {
                    console.error(`Something wrong: ${response.message}, ${response.status}`);
                    onError(`Error: ${response.message}`);
                }
            };
    
            xhr.onerror = () => {
                onError(`Error: ${JSON.parse(xhr.response).message}`);
            };

            const formData = new FormData();
            formData.append("patch", file);
            xhr.open("POST", "/api/file/upload", true);
            xhr.setRequestHeader("x-api-key", process.env.NEXT_PUBLIC_API_KEY || "");
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
                {loading && <p>Loading...</p> }

				{trackedFiles && trackedFiles.map((file) => (
					<li key={file} className="tracked file-item" data-file={file}>
						<span>{file}</span>
						<div className="file-actions">
							<button onClick={() => handleRename(file)}>Rename</button>
							<button className="delete-button" onClick={() => handleDelete(file)}>Delete</button>
						</div>
					</li>
				))}
				{untrackedFiles && untrackedFiles.map((file) => (
					<li key={file} className="untracked file-item" data-file={file}>
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