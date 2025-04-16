'use client';

import { rootPath, maxFileSize } from '@/config/const';
import { useEffect, useState, useRef } from 'react';
import { MsgContext } from './MessageContext';
import type { FileItem } from '@/types/filetype';

const FileManager: React.FC<MsgContext> = ({ refreshKey, onError, onSuccess }) => {

    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState(0);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);
            try {
                if (process.env.NEXT_PUBLIC_API_KEY != "")
                    console.log(`API KEY is set to: '${process.env.NEXT_PUBLIC_API_KEY}'`);

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

                const data: FileItem[] = await res.json();
                setFiles(data);

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

    useEffect(() => {
        setTimeout(() => {
            const allFileItems = document.querySelectorAll('.file-item');
            allFileItems.forEach(item => {
                item.classList.add("show");
            });
        }, 50);
    }, [files]);

    const toggleTracked = (name: string) => {
        setFiles(prev => prev.map(file => file.name === name ? { ...file, tracked: !file.tracked } : file ));
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

            toggleTracked(file);
            //setRefreshKey(prevKey => prevKey + 1); // fetches list again
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
                body: JSON.stringify({ target: "patch", filename }),
            });
            
            const data = await res.json();

            if (res.ok) {
                onSuccess(`File deleted successfully: ${filename}`);
                await new Promise(resolve => setTimeout(resolve, 300));
                setFiles(prevFiles => prevFiles.filter(file => file.name !== filename));

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

            const res = await fetch("/api/file/rename", {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",  
                    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || ""
                },
                body: JSON.stringify({ target: "patch", oldFilename, newFilename }),
            });
    
            const data = await res.json();
            if (res.ok) {
                onSuccess(`Renamed "${oldFilename}" to "${newFilename}"`);
                setFiles((prevFiles) => prevFiles.map(file => file.name === oldFilename ? { ...file, name: newFilename } : file ));
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
                body: JSON.stringify({ target: "patch", filename: file.name }),
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
            const formData = new FormData();
            formData.append("data", file);
            xhr.open("POST", "/api/file/upload", true);
            xhr.setRequestHeader("x-api-key", process.env.NEXT_PUBLIC_API_KEY || "");
            xhr.setRequestHeader("x-target", "patch");

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
                    setFiles(prevFiles => [...prevFiles, { name: file.name, tracked: false } ]);
                    setUploadProgress(0);
                } else {
                    console.error(`Something wrong: ${response.message}, ${response.status}`);
                    onError(`Error: ${response.message}`);
                }
            };
            
            xhr.onerror = () => {
                onError(`Error: ${JSON.parse(xhr.response).message}`);
            };
            
            xhr.send(formData);

        } catch (error) {
            onError("An error occurred during file upload.");
            
        }

    };

	return (
		<>
			<h1>Patch Files</h1>
			<p>{rootPath + "/patch"}</p>
			
			<ul className="file-list">
                {loading && <p>Loading...</p> }

				{files && files.filter(f => f.tracked).map(file => (
					<li key={file.name} className="file-item tracked" data-file={file.name}>
						<span>{file.name}</span>
						<div className="file-actions">
							<button onClick={() => handleRename(file.name)}>Rename</button>
							<button className="delete-button" onClick={() => handleDelete(file.name)}>Delete</button>
						</div>
					</li>
				))}
				{files && files.filter(f => !f.tracked).map(file => (
					<li key={file.name} className="file-item untracked" data-file={file.name}>
						<span>{file.name}</span>
						<div className="file-actions">
							<button onClick={() => handleTrack(file.name)}>Track</button>
							<button onClick={() => handleRename(file.name)}>Rename</button>
							<button className="delete-button" onClick={() => handleDelete(file.name)}>Delete</button>
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