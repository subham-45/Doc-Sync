import { useState } from "react";
import axios from "axios";

export default function CollaboratorManager({ docId, collaborators, socket }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const apiUrl = process.env.REACT_APP_API_URL;
  const addCollaborator = async () => {
    if (!email) return;
    const apiUrl = process.env.REACT_APP_API_URL;
    setLoading(true);
    setError("");
    try {
      const res = await axios.put(
        `${apiUrl}/api/docs/${docId}/collaborators`,
        { email },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      socket.emit("updateCollaborators", docId);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add collaborator");
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async (userId) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    try {
      await axios.delete(
        `${apiUrl}/api/docs/${docId}/collaborators/${userId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      socket.emit("updateCollaborators", docId);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove collaborator");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg sticky top-4">
      <h3 className="font-bold text-lg mb-4 border-b pb-2">Collaborators</h3>
      
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Add by email"
            className="flex-1 border p-2 rounded text-sm"
            onKeyDown={(e) => e.key === "Enter" && addCollaborator()}
          />
          <button
            onClick={addCollaborator}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm disabled:bg-gray-400"
          >
            {loading ? "..." : "Add"}
          </button>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {collaborators.length === 0 ? (
          <p className="text-gray-500 text-sm">No collaborators yet</p>
        ) : (
          collaborators.map(user => (
            <div key={user._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => removeCollaborator(user._id)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}