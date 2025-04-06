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

    return (

        <div className="page">

            {session ? (
            <>
            <FileManager refreshKey={refreshKey} onError={(msg) => showMessage(msg, "error")} onSuccess={(msg) => showMessage(msg, "success")}/>
            <ManifestEditor refreshKey={refreshKey} onError={showMessage}/>
            </>
            ) : (
            <>
                <p>Loading...</p>
            </>
            )}

        </div>
      );
}

export default FilesPage;