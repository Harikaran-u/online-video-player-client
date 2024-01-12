import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Access from "./components/Access";
import Home from "./components/Home";
import Player from "./components/Player";

import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/access" element={<Access />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </Router>
  );
};

export default App;
