import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import logo from "./assets/images/logo.png";
import SearchBar from "./SearchBar";
import { category } from "./CommonComponent";
import Footer from "./Footer";
import "./style/HomePage.css";

function Homepage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsCollection = collection(db, "items");
        const itemsSnapshot = await getDocs(itemsCollection);

        const fetchedItems = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setItems(fetchedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchData();
  }, []);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="home-page">
      <SearchBar />
      <div className="App">
        <header className="header">
          <div className="logo-container">
            <a href="/">
              <div className="logo-wrapper">
                <img
                  src={logo}
                  alt="Crochetto by A Logo"
                  className="logo-home"
                />
              </div>
            </a>
            <h1 className="title">Crochetto by A</h1>
          </div>
        </header>

        <main className="homepage-main">
          <div className="categoriespics">
            {category.map(
              (cat) =>
                groupedItems[cat] && (
                  <div key={cat}>
                    <h2 className="category-title">
                      {cat}{" "}
                      {cat === "Key Chains"
                        ? "(price per piece)"
                        : ""}
                    </h2>
                    <div className="category-row">
                      {groupedItems[cat].map((item) => (
                        <div key={item.id} className="item-card">
                          <img
                            src={item.link}
                            alt={item.caption}
                            title={item.caption}
                            className="category-image"
                          />
                          <div className="item-info">
                            <h3>{item.caption}</h3>
                            <p>{item.category}</p>
                            <p>${item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Homepage;
