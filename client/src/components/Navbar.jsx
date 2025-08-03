import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar({ isAuth, setIsAuth }) {
  const [isOpen, setIsOpen] = useState(false);
  const username = localStorage.getItem("username") || "";
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuth(false);
    navigate("/login");
  };

  const renderLinks = () => {
    if (isAuth) {
      return (
        <>
          <Link to={`/dashboard/${username}`} onClick={toggleMenu} className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="text-left hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </>
      );
    } else {
      return (
        <>
          <Link to="/login" onClick={toggleMenu} className="hover:text-blue-600 transition-colors">
            Login
          </Link>
          <Link to="/register" onClick={toggleMenu} className="hover:text-blue-600 transition-colors">
            Register
          </Link>
        </>
      );
    }
  };

  return (
    <nav className="shadow-md fixed w-full z-10 top-0 navbar">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">

          <button className="sm:hidden text-gray-700" onClick={toggleMenu}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden sm:flex gap-4 sm:gap-6 text-sm sm:text-base text-gray-700 font-medium">
            <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            {renderLinks()}
          </div>
        </div>
  
        <Link to="/" onClick={() => setIsOpen(false)}>
          <h1 className="text-lg sm:text-xl font-bold text-blue-600">Doc-Sync</h1>
        </Link>
      </div>

      {isOpen && (
        <div className="sm:hidden bg-white fixed top-[44px] left-0 w-[40%] h-full border-r border-gray-200 shadow-lg z-20 px-4 py-6">
          <div className="flex flex-col gap-4 text-blue-900 font-medium">
            <Link to="/" onClick={toggleMenu} className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            {renderLinks()}
          </div>
        </div>
      )}
    </nav>
  );
  
  
}
