'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMessage } from '@/context/MessageContext';
import ManifestEditor from '@/context/ManifestContext';
import FileManager from '@/context/FileListContext';

const FilesPage = () => {

    const { showError, showSuccess, showNotice } = useMessage();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [refreshKey, setRefreshKey] = useState(0); // Not used
    const [updateProgress, setUpdateProgress] = useState<boolean>(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const updateServer = async () => {
        setUpdateProgress(true);
        showNotice("Fetching and pulling server...");
        try {
            const res = await fetch("/api/server/update");
            if (!res.ok) {
                throw new Error("Failed to update server");
            }
            const data = await res.json();
            showSuccess("Server up to date");
        } catch (error) {
            showError("Could not fetch patch files.");
        }
        setUpdateProgress(false);
    };

    return (

        <div className="page">

            {session ? (
            <>
            <FileManager refreshKey={refreshKey} onError={(msg) => showError(msg)} onSuccess={(msg) => showSuccess(msg)}/>
            <ManifestEditor refreshKey={refreshKey} onError={(msg) => showError(msg)} onSuccess={(msg) => showSuccess(msg)}/>
            <div style={{ textAlign: "center", marginTop: "30px" }}>
                <p>Server Control</p>
                <button onClick={updateServer} disabled={updateProgress}>Update Server</button>
            </div>
            </>
            ) : (
            <>
                <p style={{ textAlign: "center", marginTop: "30px" }}>Loading...</p>
            </>
            )}

        </div>
      );
}

export default FilesPage;