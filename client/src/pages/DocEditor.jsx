import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { io } from "socket.io-client";
import axios from "axios";

const SAVE_INTERVAL_MS = 2000;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  [{ font: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["blockquote", "code-block"],
  ["link", "image", "video"],
  ["clean"],
];

function DocEditor() {
  const { docId } = useParams();
  const [title, setTitle] = useState("Untitled Document");
  const [saved, setSaved] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editingUsers, setEditingUsers] = useState({});
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const fetchTitle = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/docs/${docId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.data.title) setTitle(res.data.title);
      } catch (err) {
        console.error("Failed to load title:", err.message);
      }
    };
    fetchTitle();
  }, [docId]);

  // 1. Connect to socket server
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const socket = io(`${apiUrl}`);
    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  // 2. Join room and load document
  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;
    if (!socket || !quill) return;

    const quillInstance = quill.getEditor();

    socket.emit("joinDoc", docId);

    socket.once("load-document", (document) => {
      quillInstance.setContents(document);
      quillInstance.enable();
    });

    socket.emit("get-document", docId);
    quillInstance.disable();
    quillInstance.setText("Loading...");
  }, [docId]);

  // 3. Auto-save every 2 seconds
  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;
    if (!socket || !quill) return;

    const quillInstance = quill.getEditor();
    const interval = setInterval(() => {
      socket.emit("save-document", {
        docId,
        data: quillInstance.getContents(),
      });
      setSaved(true);
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [docId]);

  // 4. Receive changes from others
  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;
    if (!socket || !quill) return;

    const quillInstance = quill.getEditor();

    const handler = (delta) => {
      quillInstance.updateContents(delta);
    };

    socket.on("receiveChanges", handler);
    return () => socket.off("receiveChanges", handler);
  }, []);

  // 5. Send changes made by this user
  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;
    if (!socket || !quill) return;

    const quillInstance = quill.getEditor();

    const handler = (delta, _, source) => {
      if (source !== "user") return;

      socket.emit("sendChanges", { docId, delta });
      socket.emit("user-editing", { docId, username: localStorage.getItem("username") });

      setSaved(false);
    };

    quillInstance.on("text-change", handler);
    return () => quillInstance.off("text-change", handler);
  }, [docId]);

  // 6. Presence tracking
  useEffect(() => {
    const socket = socketRef.current;
    const username = localStorage.getItem("username");

    if (!socket || !username) return;

    socket.emit("joinDoc", { docId, username });

    const handlePresence = (userList) => setOnlineUsers(userList);
    socket.on("user-presence", handlePresence);

    return () => socket.off("user-presence", handlePresence);
  }, [docId]);

  // 7. Editing indicators
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = ({ username }) => {
      setEditingUsers((prev) => ({
        ...prev,
        [username]: Date.now(),
      }));
    };

    socket.on("user-editing", handler);

    const interval = setInterval(() => {
      const now = Date.now();
      setEditingUsers((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([_, time]) => now - time < 2000)
        )
      );
    }, 1000);

    return () => {
      socket.off("user-editing", handler);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="h-screen pt-16 px-6 bg-gray-100 overflow-y-auto bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="max-w-5xl mx-auto mb-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-semibold w-full outline-none bg-transparent"
        />
        <span className="text-sm text-gray-500">
          {saved ? "Saved" : "Saving..."}
        </span>
      </div>

      {/* Live Users */}
      <div className="max-w-5xl mx-auto mb-2 text-sm text-blue-700">
        {onlineUsers.length > 0 && (
          <p className="text-xs text-gray-600 mb-1">Active Collaborators:</p>
        )}
        <div className="flex gap-2 flex-wrap">
          {onlineUsers.map((u) => (
            <span key={u} className="px-2 py-1 bg-blue-100 rounded-full text-xs">
              @{u}
            </span>
          ))}
        </div>
        {Object.keys(editingUsers).length > 0 && (
          <p className="text-xs text-green-600 mt-1">
            {Object.keys(editingUsers).join(", ")}{" "}
            {Object.keys(editingUsers).length === 1 ? "is" : "are"} editing...
          </p>
        )}
      </div>

      {/* Editor */}
      <div className="max-w-5xl mx-auto bg-white rounded shadow hide-scrollbar">
        <div className="h-[calc(100vh-220px)] overflow-y-auto">
          <ReactQuill
            theme="snow"
            ref={quillRef}
            modules={{ toolbar: TOOLBAR_OPTIONS }}
            readOnly={false}
          />
        </div>
      </div>
    </div>
  );
}

export default DocEditor;
