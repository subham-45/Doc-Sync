import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileSection from "../components/ProfileSection";
import OwnedDocs from "../components/OwnedDocs";
import SharedDocs from "../components/SharedDocs";
import axios from "axios";

function Dashboard() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isCurrentUser = localStorage.getItem("username") === username;
  // const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      try {
        const token = localStorage.getItem("token");

        const [profileRes, ownedRes, sharedRes] = await Promise.all([
          axios.get(`${apiUrl}/api/user/${username}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${apiUrl}/api/user/${username}/owned-docs`),
          axios.get(`${apiUrl}/api/user/${username}/shared-docs`),
        ]);

        setProfile(profileRes.data);
        setOwnedDocs(ownedRes.data.ownedDocs);
        setSharedDocs(sharedRes.data.sharedDocs);
        setLoading(false);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (err.response?.status === 401) navigate("/login");
        else navigate("/");
      }
    };
    fetchData();
  }, [username, navigate]);

  if (!profile || loading) return <div className="p-6 pt-24">Loading...</div>;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="flex-1 overflow-y-auto w-full flex justify-center px-4 sm:px-6 pt-24">
        <div className="w-full max-w-5xl pb-28 space-y-6">
          <ProfileSection 
            profile={profile} 
            isCurrentUser={isCurrentUser}
          />
          <OwnedDocs 
            documents={ownedDocs} 
            isOwner={isCurrentUser}
            username={username}
          />
          <SharedDocs documents={sharedDocs} />
        </div>
      </div>
    </div>
  );
  
}

export default Dashboard;