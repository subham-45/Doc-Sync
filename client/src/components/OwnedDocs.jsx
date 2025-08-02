import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function OwnedDocs({ documents, isOwner, username }) {
  const [docsState, setDocsState] = useState(documents);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const handleRemove = async (docId, collaboratorUsername) => {
    try {
      await axios.delete(`${apiUrl}/api/docs/${docId}/collab`, {
        data: { username: collaboratorUsername },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setDocsState(prev =>
        prev.map(doc =>
          doc._id === docId
            ? {
                ...doc,
                collaborators: doc.collaborators.filter(
                  c => c.username !== collaboratorUsername
                )
              }
            : doc
        )
      );
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
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      )
      .then(res => {
        setDocsState(prev =>
          prev.map(doc =>
            doc._id === docId
              ? { ...doc, collaborators: res.data.collaborators }
              : doc
          )
        );
      })
      .catch(err => {
        alert(err.response?.data?.error || "Failed to add");
      });
  };
  return (
    <section className="rounded-lg shadow p-4 sm:p-6 mb-6 bg-white">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">
        Your Documents ({docsState.length})
      </h2>
      <div className="max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
        {docsState.length === 0 ? (
          <p className="text-gray-500">No documents yet</p>
        ) : (
          <ul className="space-y-3">
            {docsState.map((doc) => (
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
