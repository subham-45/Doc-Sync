import { useState } from "react";
import axios from "axios";
import socket from "../socket";

export default function ProfileSection({ profile,isCurrentUser,setOwnedDocs }) {
  const [newDocTitle, setNewDocTitle] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;
  const createDoc = async () => {
    try {
      const res = await axios.post(
        `${apiUrl}/api/docs`,
        { title: newDocTitle || "Untitled Document" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setOwnedDocs((prev)=>[res.data,...prev]);
      setNewDocTitle("");
      socket.emit('document-created',res.data);
    } catch (err) {
      console.log(err.message);
      alert("Failed to create document");
    }
  };
  return (
    <section className="rounded-lg shadow p-4 sm:p-6 mb-6 bg-white">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl">
          Name: <span className="font-bold">{profile.fullName}</span>
        </h1>
        <h3 className="text-lg sm:text-xl">Username: {profile.username}</h3>
        {isCurrentUser && (
          <p className="text-gray-600 mt-1 break-all">Email: {profile.email}</p>
        )}
      </div>
  
      {isCurrentUser ? (
        <div className="border-t pt-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Create New Document</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="border p-2 flex-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Document Title"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createDoc()}
            />
            <button
              onClick={createDoc}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Create
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t pt-6 text-center">
          <p className="text-gray-600">Viewing public profile</p>
        </div>
      )}
    </section>
  );
  
}