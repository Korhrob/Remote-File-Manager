'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMessage } from '@/context/MessageContext';
import ManifestEditor from '@/context/ManifestContext';
import FileManager from '@/context/FileListContext';

const FilesPage = () => {

    const { showMessage } = useMessage();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [refreshKey, setRefreshKey] = useState(0); // Not used

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const updateServer = async () => {
        showMessage("Fetching and pulling server...", "notice");
        try {
            const res = await fetch("/api/server/update");
            if (!res.ok) {
                throw new Error("Failed to update server");
            }
            const data = await res.json();
            showMessage("Server up to date", "success");
        } catch (error) {
            showMessage("Could not fetch patch files.", "error");
        }
    };

    return (

        <div className="page">

            {session ? (
            <>
            <FileManager refreshKey={refreshKey} onError={(msg) => showMessage(msg, "error")} onSuccess={(msg) => showMessage(msg, "success")}/>
            <ManifestEditor refreshKey={refreshKey} onError={showMessage}/>
            <div style={{ textAlign: "center", marginTop: "30px" }}>
                <button onClick={updateServer}>Update Server</button>
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