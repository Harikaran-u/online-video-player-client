import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "./Navbar";
import { FaUpload } from "react-icons/fa";
import { Hourglass } from "react-loader-spinner";
import ReactPlayer from "react-player";

import "../styles/player.css";

const sampleUrl =
  "https://res.cloudinary.com/diuvnny8c/video/upload/v1705150131/d3xj5tiwgita3giuvtat.mp4";

const Player = () => {
  const [isLoading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState({});
  const [startTime, setStartTime] = useState("00:00:00,000");
  const [endTime, setEndTime] = useState("00:00:00,000");
  const [srtText, setSrtText] = useState("");
  const [subtitles, setSubtitles] = useState([]);
  const [srtContent, setSrtContent] = useState("");
  const fileInputRef = useRef(null);
  const authToken = Cookies.get("authToken");
  const userId = Cookies.get("userId");
  const navigate = useNavigate();

  const uploadVideoUrl = `http://localhost:3000/upload/${userId}`;

  if (!authToken) {
    navigate("/access", { replace: true });
  }

  const submitVideoFile = async () => {
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
        const response = await fetch(uploadVideoUrl, configObj);

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

  const timeStringToMilliseconds = (timeString) => {
    const [hh, mm, ss, SSS] = timeString.split(/[:,]/);
    return (
      parseInt(hh) * 3600000 +
      parseInt(mm) * 60000 +
      parseInt(ss) * 1000 +
      parseInt(SSS)
    );
  };

  const mergeSubtitles = (subtitles) => {
    // Sort subtitles based on start time
    const sortedSubtitles = subtitles.sort((a, b) => {
      const timeA = timeStringToMilliseconds(a.start);
      const timeB = timeStringToMilliseconds(b.start);
      return timeA - timeB;
    });

    // Merge overlapping subtitles
    const mergedSubtitles = [];
    let currentSubtitle = sortedSubtitles[0];

    for (let i = 1; i < sortedSubtitles.length; i++) {
      const nextSubtitle = sortedSubtitles[i];

      if (
        timeStringToMilliseconds(nextSubtitle.start) <=
        timeStringToMilliseconds(currentSubtitle.end)
      ) {
        // Overlapping subtitles, merge them
        currentSubtitle.end = nextSubtitle.end;
        currentSubtitle.text += `\n${nextSubtitle.text}`;
      } else {
        // Non-overlapping subtitles, add the current one to the result
        mergedSubtitles.push(currentSubtitle);
        currentSubtitle = nextSubtitle;
      }
    }

    // Add the last subtitle to the result
    mergedSubtitles.push(currentSubtitle);

    return mergedSubtitles;
  };

  const addSubtitles = (e) => {
    e.preventDefault();
    setSubtitles((prevSubtitles) => {
      const updatedSubtitles = [...prevSubtitles];
      const lastSubtitle = updatedSubtitles[updatedSubtitles.length - 1];

      if (lastSubtitle) {
        // Merge if the new subtitle starts immediately after the last one
        if (
          e.target.name === "startTime" &&
          e.target.value === lastSubtitle.end
        ) {
          lastSubtitle.end = endTime;
          lastSubtitle.text += `\n${srtText}`;
        } else {
          // Otherwise, add the new subtitle
          updatedSubtitles.push({
            start: startTime,
            end: endTime,
            text: srtText,
          });
        }
      } else {
        // Add the first subtitle
        updatedSubtitles.push({
          start: startTime,
          end: endTime,
          text: srtText,
        });
      }

      // Merge and set the subtitles
      return mergeSubtitles(updatedSubtitles);
    });
    setStartTime("00:00:00,000");
    setEndTime("00:00:00,000");
    setSrtText("");
  };
  // console.log(subtitles);

  const submitSubtitlesData = async () => {
    const videoId = videoData.videoId;
    const uploadSubtitleUrl = `http://localhost:3000/subtitles/${videoId}`;
    const configObj = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subtitlesArray: subtitles,
      }),
    };

    try {
      const response = await fetch(uploadSubtitleUrl, configObj);
      if (response.ok) {
        const data = await response.json();
        const srtFile = data.srtFile;
        console.log(srtFile);
        setSrtContent(srtFile);
        console.log(data);
      } else {
        console.log(await response.json());
      }
    } catch (error) {
      console.log("upload-subtitle", error);
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
      <ReactPlayer url={videoData.secure_url} controls subtitle={srtContent} />
    </div>
  );
  console.log(srtContent, typeof srtContent);
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
            onChange={submitVideoFile}
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
      {videoData.secure_url && (
        <div className="wrap-subtile-container">
          <form className="subtitle-form-container" onSubmit={addSubtitles}>
            <label className="subtitle-label" htmlFor="start-time">
              Start time -<span className="spl-srt-label">"HH:MM:SS,MS"</span> :
            </label>
            <input
              type="text"
              id="start-time"
              placeholder="00:00:00,000"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="time-input"
              title="Hour:Minute:Seconds:MilliSeconds"
              required
            />
            <label className="subtitle-label" htmlFor="end-time">
              End time -<span className="spl-srt-label">"HH:MM:SS,MS"</span> :
            </label>
            <input
              type="text"
              id="end-time"
              placeholder="00:00:00,000"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="time-input"
              title="Hour:Minute:Seconds:MilliSeconds"
              required
            />
            <textarea
              rows="4"
              cols="50"
              placeholder="Enter subtitle text..."
              value={srtText}
              onChange={(e) => setSrtText(e.target.value)}
              className="subtitle-text"
              required
            />
            <div className="subtitle-btn-containers">
              <button
                className="subtitle-sbt-btn"
                type="button"
                onClick={submitSubtitlesData}
              >
                Submit
              </button>
              <button className="subtitle-sbt-btn" type="submit">
                Add
              </button>
            </div>

            <p className="subtitle-note">
              Note:- Please kindly provide the data as per the format.
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default Player;
