import React from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const logOutSession = () => {
    const result = confirm("Do you really want to logout?");
    if (result) {
      Cookies.remove("authToken");
      Cookies.remove("userId");
      navigate("/access", { replace: true });
    }
  };
  return (
    <nav className="home-nav-bar">
      <h1 className="app-head-nav">Online Video Player</h1>
      <button className="nav-log-out-btn" onClick={logOutSession}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
