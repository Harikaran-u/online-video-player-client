import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Hourglass } from "react-loader-spinner";

import "../styles/access.css";

const Register = () => {
  const [username, setUserName] = useState("");
  const [password, setUserPwd] = useState("");
  const [isPresent, setPresent] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [isApiFail, setApiFail] = useState(false);
  const [isLoading, setLoader] = useState(false);
  const navigate = useNavigate();

  const authUser = async () => {
    const path = isPresent ? "login" : "register";
    const apiUrl = `http://localhost:3000/${path}`;

    const userData = {
      username,
      password,
    };
    const optionConfigs = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    };

    try {
      const response = await fetch(apiUrl, optionConfigs);
      const data = await response.json();

      if (response.ok) {
        const isUserId = data.userId;
        const authToken = data.AuthToken;
        Cookies.set("authToken", authToken, { expires: 7 });
        Cookies.set("userId", data.userId, { expires: 7 });
        isUserId && setPresent(true);
        setLoader(false);
        authToken && navigate("/", { replace: true });
        console.log("present sir");
      } else {
        setLoader(false);
        setErrMsg(data.message);
      }

      console.log(data);
    } catch (error) {
      setApiFail(true);
    }
  };

  const submitUserData = (e) => {
    e.preventDefault();
    setLoader(true);
    authUser();
    setUserName("");
    setUserPwd("");
  };

  const updateUserName = (e) => {
    setUserName(e.target.value);
    setErrMsg("");
  };

  const updateUserPwd = (e) => {
    setUserPwd(e.target.value);
    setErrMsg("");
  };

  const Loader = (
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

  return (
    <div className="register-main-container">
      <h1 className="app-head">Online Video Player</h1>
      {isLoading ? (
        Loader
      ) : (
        <form onSubmit={submitUserData} className="form-container">
          <label className="custom-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Create your username..."
            className="custom-input"
            onChange={updateUserName}
            value={username}
            title="length should be min,max(4, 16)"
            required
          />
          <label className="custom-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Create your password..."
            className="custom-input"
            onChange={updateUserPwd}
            value={password}
            title="length should be min,max(6, 16)"
            required
          />
          {errMsg && <p className="custom-err-msg">{errMsg}</p>}
          <div className="control-container">
            <button type="submit" className="cutom-submit-btn">
              {isPresent ? "Login" : "Register"}
            </button>
            <p className="already-user-info">
              {isPresent ? "New to this app?" : "Already a user?"}
              <br />
              <a
                className="nav-link"
                onClick={() => setPresent((prev) => !prev)}
              >
                {isPresent ? "Register" : "Login"}
              </a>
            </p>
          </div>
        </form>
      )}

      {isApiFail && (
        <h1 className="service-err-head">
          Currently facing issues with the server. Please kindly try after
          sometime.
        </h1>
      )}
    </div>
  );
};

export default Register;
