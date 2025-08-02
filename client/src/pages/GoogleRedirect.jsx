import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleRedirect({ setIsAuth }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const username = params.get("username");

    if (token && username) {
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      setIsAuth(true);
      navigate(`/dashboard/${username}`);
    } else {
      navigate("/login");
    }
  }, [navigate, params, setIsAuth]);

  return <p className="p-6 pt-24">Redirecting...</p>;
}
