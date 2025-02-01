import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchResults from "./SearchResults";
import AdminPage from "./AdminPage";
import HomePage from "./HomePage";
import "./style/App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/search" element={<SearchResults />} /> */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
