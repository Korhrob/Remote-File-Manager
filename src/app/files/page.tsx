'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { patchesPath } from "@/config/const";
import { useMessage } from '@/context/MessageContext'; // Make sure this path is correct
import ManifestEditor from '@/context/ManifestContext'; // Adjust path if needed

const FilesPage = () => {

    const { showMessage } = useMessage(); // Access the context here
    const { data: session, status } = useSession();
    const router = useRouter();

    const [trackedFiles, setTrackedFiles] = useState<string[]>([]); // List of patch filenames
    const [untrackedFiles, setUntrackedFiles] = useState<string[]>([]); // List of untracked files
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to the file input
    const [uploadProgress, setUploadProgress] = useState(0);

    // Fetch list of files from the API
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login"); // Redirect to the login page if the user is not authenticated
        }
        const fetchFiles = async () => {
            try {
                const res = await fetch("/api/patches/list");
                if (!res.ok) {
                    throw new Error("Failed to fetch files");
                }
                const data = await res.json();
                setTrackedFiles(data.tracked);
                setUntrackedFiles(data.untracked); 
            } catch (error) {
                showMessage("Could not fetch patch files.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchFiles();
    }, [status, router]);

    // Handle tracking a file
    const handleTrack = async (file: string) => {
        try {
        const response = await fetch('/api/patches/track', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: file }),
        });

        const data = await response.json();
        if (data.message) {
            setUntrackedFiles((prev) => prev.filter((f) => f !== file));
            setTrackedFiles((prev) => [...prev, file]); // Add file to the tracked list
            setRefreshKey(prevKey => prevKey + 1);
            showMessage(`File ${file} has been tracked.`, "success");
        } else {
            showMessage('Failed to track file.', "error");
        }
        } catch (error) {
            showMessage('Error tracking file.',"error");
        }
    };

    // Handle file deletion with confirmation
    const handleDelete = async (filename: string) => {
        // Show a confirmation dialog before proceeding with deletion
        const confirmDelete = window.confirm(`Are you sure you want to delete the file: ${filename}?`);

        if (!confirmDelete) {
            return; // If the user cancels, don't proceed with deletion
        }

        try {
            const res = await fetch(`/api/patches/delete?filename=${filename}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (res.ok) {
                setTrackedFiles((prevFiles) => prevFiles.filter((file) => file !== filename)); // Remove deleted file from the list
                setUntrackedFiles((prevFiles) => prevFiles.filter((file) => file !== filename));
                showMessage(`File deleted successfully: ${filename}`, "success");
            } else {
                showMessage(`Error: ${data.error}`, "error");
            }
        } catch (error) {
            showMessage("An error occurred during deletion.", "error");
        }
    };

    const handleRename = async (oldFilename: string) => {
        const newFilename = prompt(`Rename "${oldFilename}" to:`);
        if (!newFilename || newFilename.trim() === oldFilename) return;
    
        try {
            const res = await fetch("/api/patches/rename", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldFilename, newFilename }),
            });
    
            const data = await res.json();
            if (res.ok) {
                setTrackedFiles(prev => prev.map(f => (f === oldFilename ? newFilename : f)));
                setUntrackedFiles(prev => prev.map(f => (f === oldFilename ? newFilename : f)));
                showMessage(`Renamed "${oldFilename}" to "${newFilename}"`, "success");
            } else {
                showMessage(`Error: ${data.error}`, "error");
            }
        } catch (error) {
            showMessage("An error occurred during renaming.", "error");
        }
    };
    

    const triggerFileInput = () => {
        if (fileInputRef.current) {
          fileInputRef.current.click(); // This simulates a click on the file input
        }
    };

    // Handle file upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            showMessage("No file selected.", "error");
            return;
        }

        // const maxSize = 100 * 1024 * 1024; // 30MB limit
        // if (file.size > maxSize) {
        //     showMessage("File is too large. Maximum allowed size is 30MB.", "error");
        //     return;
        // }

        const formData = new FormData();
        formData.append("patch", file);

        const res = await fetch(`/api/patches/upload?filename=${encodeURIComponent(file.name)}`);
        const uploadData = await res.json();
        if (uploadData.exists) {
            showMessage(`Error: File already exists`, "error");
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
                if (xhr.status === 200) {
                    showMessage(`File uploaded successfully: ${file.name}`, "success");
                    setUntrackedFiles((prevFiles) => [...prevFiles, file.name]);
                    setUploadProgress(0); // Reset progress after upload
                } else {
                    showMessage(`Error: ${JSON.parse(xhr.response).error}`, "error");
                }
            };
    
            xhr.onerror = () => {
                showMessage(`Error: ${JSON.parse(xhr.response).error}`, "error");
            };
    
            xhr.open("POST", "/api/patches/upload", true);
            xhr.send(formData);
        } catch (error) {
            showMessage("An error occurred during file upload.", "error");
        } finally {
            setUploadProgress(0);
        }

        // try {
        //     const res = await fetch("/api/patches/upload", {
        //         method: "POST",
        //         body: formData,
        //     });

        //     const data = await res.json();
        //     if (res.ok) {
        //         setUntrackedFiles((prevFiles) => [...prevFiles, file.name]);
        //         showMessage(`File uploaded successfully: ${file.name}`, "success");
        //     } else {
        //         showMessage(`Error: ${data.error}`, "error");
        //     }
        // } catch (error) {
        //     showMessage("An error occurred during file upload.", "error");
        // }
    };

    return (


        <div className="page">

            {session ? (
            <>
            <h1>Patch Files</h1>
            <p>{patchesPath}</p>
            
            {/* List files */}
            <ul className="file-list">
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
                <p>Uploading: {uploadProgress}%</p> 
                : 
                <div style={{ textAlign: "center", marginTop: "30px" }}>
                    {/* Trigger file input when the button is clicked */}
                    <button onClick={triggerFileInput}>Upload New File</button>
                    {/* Hidden file input */}
                    <input
                    type="file"
                    ref={fileInputRef} // Attach the ref here
                    onChange={handleFileChange}
                    className="upload-input"  // Use the same class for styling
                    />
                </div>
            }

            <ManifestEditor refreshKey={refreshKey} onError={showMessage}/>

            </>) : (
            <>
                Unauthorized
            </>)}
        </div>
      );
}

export default FilesPage;