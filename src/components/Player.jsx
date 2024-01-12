import React, { useRef, useState } from "react";
import Navbar from "./Navbar";
import { FaUpload } from "react-icons/fa";
import "../styles/player.css";

const Player = () => {
  const fileInputRef = useRef(null);
  //   const [fileError, setFileError] = useState(false);

  const handleFileChange = () => {
    const selectedFile = fileInputRef.current.files[0];
    // const type = selectedFile.type;
    // const isVideoFile = type.includes("video");
    // if (!isVideoFile) {
    //   setFileError(true);
    // }
    console.log(selectedFile);
    console.log(selectedFile.type);
  };

  return (
    <div className="player-main-container">
      <Navbar />
      <div className="player-container">
        <div className="upload-file-container">
          <p className="upload-info">Upload only video file...</p>
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
          {/* {fileError && (
            <p className="file-err-msg">Please upload video file only...</p>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Player;
