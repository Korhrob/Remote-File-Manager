'use client';

import { maxFileSize, dbPath } from '@/config/const';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useMessage } from '@/context/MessageContext';
import ManifestEditor from '@/context/ManifestContext';
import FileManager from '@/context/FileManagerContext';

const DBManagerPage = () => {

    const { showError, showSuccess, showNotice } = useMessage();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [refreshKey, setRefreshKey] = useState(0); // Not used
	const [uploadProgress, setUploadProgress] = useState(0);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);


	const triggerFileInput = () => {
		if (fileInputRef.current) {
		  fileInputRef.current.click();
		}
	};

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

		try {
			const file = e.target.files?.[0];
			if (!file) {
				showError("No file selected.");
				return;
			}
	
			const res = await fetch(`/api/file/exist`, {
				method: "POST",
				headers: { 
					"Content-Type": "application/json",  
					"x-api-key": process.env.NEXT_API_KEY || ""
				},
				body: JSON.stringify({ path: "db", filename: file.name }),
			});
	
			const uploadData = await res.json();
			if (uploadData.exists) {
				showError("Error: File already exists");
				return;
			}
	
			if (file.size > maxFileSize) {
				showError(`File size is too large! Maximum allowed size is ${maxFileSize} MB.`);
				return;
			}

			const xhr = new XMLHttpRequest();
			const formData = new FormData();
			formData.append("db", file);
			xhr.open("POST", "/api/file/upload", true);
			xhr.setRequestHeader("x-api-key", process.env.NEXT_API_KEY || "");

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
					showSuccess(`File uploaded successfully: ${file.name}`);
					
					setUploadProgress(0);
				} else {
					console.error(`Something wrong: ${response.message}, ${response.status}`);
					showError(`Error: ${response.message}`);
				}
			};
			
			xhr.onerror = () => {
				showError(`Error: ${JSON.parse(xhr.response).message}`);
			};
			
			xhr.send(formData);

		} catch (error) {
			showError("An error occurred during file upload.");
			
		}

	};

    return (

        <div className="page">

            {session ? (
            <>
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
            ) : (
            <>
                <p style={{ textAlign: "center", marginTop: "30px" }}>Loading...</p>
            </>
            )}

        </div>
      );
}

export default DBManagerPage;