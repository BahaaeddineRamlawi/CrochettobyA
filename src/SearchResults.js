import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { db } from "./firebaseConfig";
import logo from "./assets/images/logo.png";
import SearchBar from "./SearchBar";
import Footer from "./Footer";
import "./style/SearchResults.css";

const SearchResults = () => {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedQuery, setDisplayedQuery] = useState("");
  const queryParam = new URLSearchParams(location.search).get("q") || "";

  const fetchItems = async () => {
    setIsLoading(true);
    const itemsCollection = collection(db, "items");
    const itemsSnapshot = await getDocs(itemsCollection);
    const itemsList = itemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setItems(itemsList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      const normalizedQuery = queryParam
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
      let results = items;
      let updatedQuery = normalizedQuery;

      results = items.filter(
        (item) =>
          item.caption.toLowerCase().includes(normalizedQuery) ||
          item.category.some((cat) =>
            cat.toLowerCase().includes(normalizedQuery)
          )
      );

      setFilteredResults(results);
      setDisplayedQuery(updatedQuery);
    }
  }, [queryParam, items]);

  if (isLoading) {
    return (
      <div className="App">
        <SearchBar />
        <header className="header">
          <div className="logo-container">
            <a href="/">
              <div className="logo-wrapper-noanimation">
                <img src={logo} alt="CrochettobyA Logo" className="logo" />
              </div>
            </a>
          </div>
        </header>
        <div className="result-page">
          <h2>Loading...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (filteredResults.length === 0) {
    return (
      <div className="App">
        <SearchBar />
        <header className="header">
          <div className="logo-container">
            <a href="/">
              <div className="logo-wrapper-noanimation">
                <img src={logo} alt="CrochettobyA Logo" className="logo" />
              </div>
            </a>
          </div>
        </header>
        <div className="result-page">
          <h2>No results found for "{displayedQuery}". Please try again.</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App">
      <SearchBar />
      <header className="header">
        <div className="logo-container">
          <a href="/">
            <div className="logo-wrapper-noanimation">
              <img src={logo} alt="CrochettobyA Logo" className="logo" />
            </div>
          </a>
        </div>
      </header>
      <div className="result-page">
        <h2>
          Search Results for <br /> "{displayedQuery}"
        </h2>
        <div className="results-container">
          {filteredResults.map((result) => (
            <div key={result.id} className="item-card">
              <img src={result.link} alt={result.caption} />
              <h3>{result.caption}</h3>
              <p>
                {Array.isArray(result.category)
                  ? result.category.join(", ")
                  : result.category}
              </p>
              <p>${result.price}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;
