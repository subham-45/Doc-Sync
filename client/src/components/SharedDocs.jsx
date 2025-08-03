import { useEffect } from "react";
import { Link } from "react-router-dom";
import socket from "../socket";

export default function SharedDocs({ sharedDocs, setSharedDocs }) {
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return;
    socket.on("document-shared", (data)=>{
      if(data.addedUser===username){
        const doc = {
          docId:data.docId,
          owner:data.owner,
          title:data.title
        }
        setSharedDocs((prev)=>[doc,...prev]);
      }
    });
    socket.on("document-unshared", (data)=>{
      if(data.removedUser===username){
        setSharedDocs((prev) => prev.filter((d) => d.docId !== data.docId));
      }
    });
    socket.on("document-deleted",(docId)=>{
      setSharedDocs((prev) => prev.filter((d) => d.docId !== docId));
    });

    return () => {
      socket.off("document-shared");
      socket.off("document-unshared");
      socket.off("document-deleted");
    };
  }, [setSharedDocs]);

  return (
    <section className="rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Shared With You ({sharedDocs.length})
      </h2>
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {sharedDocs.length === 0 ? (
          <p className="text-gray-500">No shared documents</p>
        ) : (
          <ul className="space-y-3">
            {sharedDocs.map((doc) => (
              <li key={doc.docId} className="p-3 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <Link
                      to={`/editor/${doc.docId}`}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      {doc.title}
                    </Link>
                    <p className="text-sm text-gray-500">Owner: @{doc.owner}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
