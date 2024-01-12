import React from "react";

const Navbar = () => {
  return (
    <nav className="home-nav-bar">
      <h1 className="app-head-nav">Online Video Player</h1>
      <div className="links-container">
        <ul className="nav-links-container">
          <li className="nav-link">About us</li>
          <li className="nav-link">Contact us</li>
        </ul>
        <button className="nav-log-out-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
