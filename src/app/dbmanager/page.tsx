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

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    return (

        <div className="page">

            {session ? (
            <>
				<FileManager refreshKey={0} target={dbPath} onError={(msg) => showError(msg)} onSuccess={(msg) => {showSuccess(msg); setRefreshKey(prev => prev + 1);}}/>
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