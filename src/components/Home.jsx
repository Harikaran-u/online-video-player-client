import React from "react";
import { Link } from "react-router-dom";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import Navbar from "./Navbar";

import "../styles/home.css";

const Home = () => {
  return (
    <div className="home-main-container">
      <Navbar />
      <h1 className="home-head">
        Play your favorite <span className="special-head">Video</span>
      </h1>
      <div className="player-welcome-container">
        <div className="player-info-container">
          <h1 className="player-info">
            Play your favorite video online with your subtitles. Enjoy hassle
            free video streaming experience...
          </h1>
          <Link to="/player">
            <button className="explore-btn">
              <MdOutlineSlowMotionVideo className="video-icon" />
              Explore
            </button>
          </Link>
        </div>
        <img
          src="playerthumb.png"
          alt="player-thumbnail"
          className="player-thumbnail"
        />
      </div>
    </div>
  );
};

export default Home;
