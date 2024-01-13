import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "./Navbar";
import { FaUpload } from "react-icons/fa";
import { Hourglass } from "react-loader-spinner";
import ReactPlayer from "react-player";

import "../styles/player.css";

const Player = () => {
  const [isLoading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState({});
  const fileInputRef = useRef(null);
  const authToken = Cookies.get("authToken");
  const userId = Cookies.get("userId");
  const navigate = useNavigate();

  const uploadUrl = `http://localhost:3000/upload/${userId}`;

  if (!authToken) {
    navigate("/access", { replace: true });
  }

  const handleFileChange = async () => {
    const selectedFile = fileInputRef.current.files[0];
    setLoading(true);
    const type = selectedFile.type;
    const isVideoFile = type.includes("video");

    if (!isVideoFile) {
      setFileError(true);
    } else {
      const formData = new FormData();

      formData.append("video", selectedFile);
      formData.append("userId", userId);

      const configObj = {
        method: "POST",
        body: formData,
      };
      try {
        const response = await fetch(uploadUrl, configObj);

        if (response.ok) {
          setLoading(false);
          const data = await response.json();
          setVideoData(data.data);
          console.log(data.data);
        }
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const loader = (
    <Hourglass
      visible={true}
      height="80"
      width="80"
      ariaLabel="hourglass-loading"
      wrapperStyle={{ marginTop: "25px" }}
      wrapperClass=""
      colors={["#306cce", "#72a1ed"]}
    />
  );

  const player = (
    <div className="main-player-control">
      <ReactPlayer url={videoData.secure_url} controls />
    </div>
  );

  return (
    <div className="player-main-container">
      <Navbar />
      <div className="player-container">
        <div className="upload-file-container">
          <p className="upload-info">Upload video file only...</p>
          <input
            type="file"
            id="fileInput"
            ref={fileInputRef}
            className="input-file"
            accept="video/*"
            onChange={handleFileChange}
          />
          <button
            className="upload-btn"
            onClick={() => fileInputRef.current.click()}
          >
            <FaUpload className="upload-icon" /> Upload
          </button>
        </div>
        {isLoading ? loader : player}
      </div>
    </div>
  );
};

export default Player;
