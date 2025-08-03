import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DocEditor from "./pages/DocEditor";
import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer";
import { useState } from "react";
import GoogleRedirect from "./pages/GoogleRedirect";

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
  return (
    <BrowserRouter >
    
      <Navbar isAuth={isAuth} setIsAuth={setIsAuth} />
      <Routes>
        <Route path="/" element={<Landing isAuth={isAuth}/>} />
        <Route path="/login" element={<Login setIsAuth ={setIsAuth} />} />
        <Route path="/register" element={<Register setIsAuth ={setIsAuth} />} />
        <Route path="/google-auth" element={<GoogleRedirect setIsAuth={setIsAuth} />} />
        <Route path="/dashboard/:username" element={<Dashboard />} />
        <Route path="/editor/:docId" element={<DocEditor />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
