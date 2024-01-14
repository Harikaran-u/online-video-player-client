import React, { useRef, useState, useEffect } from "react";
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
  const [startTime, setStartTime] = useState("00:00:00.000");
  const [endTime, setEndTime] = useState("00:00:00.000");
  const [srtText, setSrtText] = useState("");
  const [subtitles, setSubtitles] = useState([]);
  const [vttUrl, setVttUrl] = useState("");

  const fileInputRef = useRef(null);
  const authToken = Cookies.get("authToken");
  const userId = Cookies.get("userId");
  const navigate = useNavigate();

  const uploadVideoUrl = `https://online-video-server.onrender.com/upload/${userId}`;

  useEffect(() => {
    if (!authToken) {
      navigate("/access", { replace: true });
    }
  }, [vttUrl, authToken]);

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
        }
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const timeStringToMilliseconds = (timeString) => {
    const [hh, mm, ss, SSS] = timeString.split(/[:.]/);
    return (
      parseInt(hh) * 3600000 +
      parseInt(mm) * 60000 +
      parseInt(ss) * 1000 +
      parseInt(SSS)
    );
  };

  const mergeSubtitles = (subtitles) => {
    const sortedSubtitles = subtitles.sort((a, b) => {
      const timeA = timeStringToMilliseconds(a.start);
      const timeB = timeStringToMilliseconds(b.start);
      return timeA - timeB;
    });

    const mergedSubtitles = [];
    let currentSubtitle = sortedSubtitles[0];

    for (let i = 1; i < sortedSubtitles.length; i++) {
      const nextSubtitle = sortedSubtitles[i];

      if (
        timeStringToMilliseconds(nextSubtitle.start) <=
        timeStringToMilliseconds(currentSubtitle.end)
      ) {
        currentSubtitle.end = nextSubtitle.end;
        currentSubtitle.text += `\n${nextSubtitle.text}`;
      } else {
        mergedSubtitles.push(currentSubtitle);
        currentSubtitle = nextSubtitle;
      }
    }

    mergedSubtitles.push(currentSubtitle);

    return mergedSubtitles;
  };

  const addSubtitles = (e) => {
    e.preventDefault();
    setSubtitles((prevSubtitles) => {
      const updatedSubtitles = [...prevSubtitles];
      const lastSubtitle = updatedSubtitles[updatedSubtitles.length - 1];

      if (lastSubtitle) {
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
    setStartTime("00:00:00.000");
    setEndTime("00:00:00.000");
    setSrtText("");
  };

  const submitSubtitlesData = async () => {
    const videoId = videoData.videoId;

    const uploadSubtitleUrl = `https://online-video-server.onrender.com/subtitles/${videoId}`;
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
        const subtitleUrl = data.vttUrl;
        setVttUrl(subtitleUrl);

        console.log("subtitle-data", data);
      } else {
        console.log(error);
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
    <div className="main-player-control" key={vttUrl}>
      <ReactPlayer
        url={videoData.secure_url}
        width="100%"
        controls
        config={{
          file: {
            attributes: { crossOrigin: "true" },
            tracks: [
              {
                kind: "subtitles",
                src: `${vttUrl}`,
                default: true,
              },
            ],
          },
        }}
        onError={() => console.log(error)}
      />
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
              Start time -<span className="spl-srt-label">"HH:MM:SS.MS"</span> :
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
              End time -<span className="spl-srt-label">"HH:MM:SS.MS"</span> :
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
