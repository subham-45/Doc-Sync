import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
export default function OwnedDocs({ ownedDocs, setOwnedDocs, isOwner }) {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const handleRemove = async (docId, collaborator) => {
    try {
      await axios.delete(`${apiUrl}/api/docs/${docId}/collab`, {
        data: { username: collaborator },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOwnedDocs(prev =>
        prev.map(doc =>
          doc._id === docId
            ? {
                ...doc,
                collaborators: doc.collaborators.filter(
                  c => c.username !== collaborator
                ),
              }
            : doc
        )
      );
      const removedDoc = ownedDocs.find(doc => doc._id === docId);
      const removedUser = removedDoc?.collaborators.find(c => c.username === collaborator);
      if (removedUser) {
        socket.emit("collaborator-removed", {
          docId,
          removedUser: removedUser.username,
          owner: localStorage.getItem("username") 
        });
      }
    } catch (err) {
      console.error("Failed to remove collaborator", err);
    }
  };
  const handleAdd = (docId) => {
    const username = prompt("Enter username to add:");
    if (!username) return;
    axios
      .post(
        `${apiUrl}/api/docs/${docId}/collab`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(res => {
        const updatedDoc = ownedDocs.find(doc => doc._id === docId);
        setOwnedDocs(prev =>
          prev.map(doc =>
            doc._id === docId
              ? { ...doc, collaborators: res.data.collaborators }
              : doc
          )
        );
        socket.emit("collaborator-added", {
          docId,
          collaborators: res.data.collaborators,
          addedUser: username,
          title: updatedDoc?.title || "Untitled Document",
          owner: localStorage.getItem("username"),
        });
      })
      .catch(err => {
        alert(err.response?.data?.error || "Failed to add");
      });
  };
  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await axios.delete(`${apiUrl}/api/docs/${docId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      socket.emit("document-deleted", docId);
      setOwnedDocs(prev => prev.filter(doc => doc._id !== docId));
    } catch (err) {
      alert("Failed to delete document");
      console.error(err);
    }
  };
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return;
    socket.on("document-shared", (data)=>{
      if(data.owner===username){
        setOwnedDocs(prev =>
          prev.map(doc =>
            doc._id === data.docId
              ? { ...doc, collaborators: data.collaborators }
              : doc
          )
        );
      }
    });
    socket.on("document-unshared", (data)=>{
      if(data.owner===username){
        setOwnedDocs(prev =>
          prev.map(doc =>
            doc._id === data.docId
              ? {
                  ...doc,
                  collaborators: doc.collaborators.filter(
                    c => c.username !== data.removedUser
                  ),
                }
              : doc
          )
        );;
      }
    });
    socket.on("document-deleted",(docId)=>{
      setOwnedDocs(prev => prev.filter(doc => doc._id !== docId));
    });
    socket.on("document-created", (data) => {
      setOwnedDocs((prev) => {
        const exists = prev.some((doc) => doc._id === data._id);
        if (exists) return prev;
        return [...prev,data];
      });
    });    
    return () => {
      socket.off("document-shared");
      socket.off("document-unshared");
      socket.off("document-deleted");
      socket.off("document-created")
    };
  }, [setOwnedDocs]);
  return (
    <section className="rounded-lg shadow p-4 sm:p-6 mb-6 bg-white">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">
        Your Documents ({ownedDocs.length})
      </h2>
      <div className="max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
        {ownedDocs.length === 0 ? (
          <p className="text-gray-500">No documents yet</p>
        ) : (
          <ul className="space-y-3">
            {ownedDocs.map((doc) => (
              <li key={doc._id} className="p-3 rounded bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <Link
                    to={`/editor/${doc._id}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    {doc.title}
                  </Link>
                  {isOwner && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleAdd(doc._id)}
                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Add Collaborator
                      </button>
                      <button
                        onClick={() =>
                          setDropdownOpen(dropdownOpen === doc._id ? null : doc._id)
                        }
                        className="text-sm bg-gray-200 px-2 py-1 rounded"
                      >
                        {dropdownOpen === doc._id ? "Hide" : "Show"} Collaborators
                      </button>
                    </div>
                  )}
                </div>
  
                {dropdownOpen === doc._id && (
                  <ul className="ml-4 mt-2 border rounded shadow p-2 bg-white">
                    {doc.collaborators.map((c) => (
                      <li
                        key={c._id}
                        className="flex justify-between items-center py-1"
                      >
                        <span>@{c.username}</span>
                        <button
                          onClick={() => handleRemove(doc._id, c.username)}
                          className="text-red-500 ml-2"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  ); 
}
