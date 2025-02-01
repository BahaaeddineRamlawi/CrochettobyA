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
  const [shoes, setShoes] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedQuery, setDisplayedQuery] = useState("");
  const queryParam = new URLSearchParams(location.search).get("q") || "";

  const fetchShoes = async () => {
    setIsLoading(true);
    const shoesCollection = collection(db, "shoes");
    const shoesSnapshot = await getDocs(shoesCollection);
    const shoesList = shoesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setShoes(shoesList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchShoes();
  }, []);

  useEffect(() => {
    if (shoes.length > 0) {
      const normalizedQuery = queryParam
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
      let results = shoes;
      let updatedQuery = normalizedQuery;

      if (["men", "man"].includes(normalizedQuery)) {
        results = shoes.filter((shoe) => shoe.gender.toLowerCase() === "men");
      } else if (["women", "woman"].includes(normalizedQuery)) {
        results = shoes.filter((shoe) => shoe.gender.toLowerCase() === "women");
      } else if (
        ["kids", "kid", "child", "children"].includes(normalizedQuery)
      ) {
        results = shoes.filter(
          (shoe) =>
            shoe.gender.toLowerCase() === "boys" ||
            shoe.gender.toLowerCase() === "girls" ||
            shoe.gender.toLowerCase() === "boys & girls"
        );
      } else {
        results = shoes.filter(
          (shoe) =>
            shoe.caption.toLowerCase().includes(normalizedQuery) ||
            shoe.description.toLowerCase().includes(normalizedQuery) ||
            shoe.category.toLowerCase().includes(normalizedQuery) ||
            shoe.gender.toLowerCase().includes(normalizedQuery)
        );
      }

      results.sort((a, b) => {
        const genderOrder = ["Men", "Women", "Boys", "Girls", "Boys & Girls"];
        const genderA = genderOrder.indexOf(a.gender);
        const genderB = genderOrder.indexOf(b.gender);

        if (genderA === genderB) {
          return b.timestamp - a.timestamp;
        }

        return genderA - genderB;
      });

      setFilteredResults(results);
      setDisplayedQuery(updatedQuery);
    }
  }, [queryParam, shoes]);

  if (isLoading) {
    return (
      <div className="App">
        <SearchBar />
        <header className="header">
          <div className="logo-container">
            <a href="/">
              <img src={logo} alt="Darazi Shoes Logo" className="logo" />
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
              <img src={logo} alt="Darazi Shoes Logo" className="logo" />
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
            <img src={logo} alt="Darazi Shoes Logo" className="logo" />
          </a>
        </div>
      </header>
      <div className="result-page">
        <h2>
          Search Results for <br /> "{displayedQuery}"
        </h2>
        <div className="results-container">
          {filteredResults.map((result) => (
            <div key={result.id} className="shoe-card">
              <img src={result.link} alt={result.caption} />
              <h3>{result.caption}</h3>
              <p>{result.category}</p>
              <p>{result.description}</p>
              <p id="genderp">{result.gender}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;
