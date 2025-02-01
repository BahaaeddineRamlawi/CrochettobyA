import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/SearchBar.css";

const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for Items..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyPress}
        className="search-input"
      />
      <button
        className="search-button"
        onClick={handleSearch}
        disabled={!searchInput.trim()}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
