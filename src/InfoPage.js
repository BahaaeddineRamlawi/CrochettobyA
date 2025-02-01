import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import logo from "./assets/images/logo.png";
import SearchBar from "./SearchBar";
import "./style/InfoPage.css";

function InfoPage() {
  const [boxesData, setBoxesData] = useState([]);

  useEffect(() => {
    const fetchBoxesData = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, "paragraphs"));

      const paragraphs = querySnapshot.docs.map((doc) => {
        let textWithNewlines = doc.data().text.replace(/__NEWLINE__/g, "\n");
        textWithNewlines = textWithNewlines.replace(/-\)/g, "•");
        return textWithNewlines.split("\n");
      });

      console.log("Fetched paragraphs:", paragraphs);
      setBoxesData(paragraphs);
    };

    fetchBoxesData();
  }, []);

  return (
    <div className="home-page">
      <SearchBar />
      <div className="App">
        <header className="header">
          <div className="logo-container">
            <a href="/">
              <div className="logo-background"></div>
              <img src={logo} alt="Darazi Shoes Logo" className="logo" />
            </a>
            <h1 className="title">Darazi Shoes</h1>
          </div>
        </header>
        <div className="boxes-page">
          {boxesData.length === 0 ? (
            <p>Loading...</p>
          ) : (
            boxesData.map((lines, index) => (
              <div key={index} className="box">
                <p>
                  {lines.map((line, lineIndex) => (
                    <span key={lineIndex}>
                      {line}
                      {lineIndex !== lines.length - 1 && <br />}{" "}
                    </span>
                  ))}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
