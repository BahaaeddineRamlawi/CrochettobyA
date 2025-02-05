import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
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
        const q = query(itemsCollection, orderBy("timestamp", "desc"));
        const itemsSnapshot = await getDocs(q);

        const fetchedItems = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        }));

        setItems(fetchedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchData();
  }, []);

  const groupedItems = {};

  items.forEach((item) => {
    if (Array.isArray(item.category)) {
      item.category.forEach((cat) => {
        if (!groupedItems[cat]) {
          groupedItems[cat] = [];
        }
        groupedItems[cat].push(item);
      });
    }
  });

  return (
    <div className="home-page">
      <SearchBar />
      <div className="App">
        <header className="header">
          <div className="logo-container">
            <a href="/">
              <div className="logo-wrapper">
                <img src={logo} alt="CrochettobyA Logo" className="logo-home" />
              </div>
            </a>
            <h1 className="title">Crochetto by A</h1>
          </div>
        </header>

        <main className="homepage-main">
          <div className="categoriespics">
            {category.map((cat) =>
              groupedItems[cat]?.length > 0 ? (
                <div key={cat}>
                  <h2 className="category-title">
                    {cat} {cat === "Key Chains" ? "(price per piece)" : ""}
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
                          <p>${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Homepage;
