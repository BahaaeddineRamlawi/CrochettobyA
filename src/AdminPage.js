import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import AddData from "./AddData";
import bcrypt from "bcryptjs";
import "./style/AdminPage.css";

const AdminPage = () => {
  const [items, setItems] = useState({
    link: "",
    caption: "",
    price: "",
  });
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const fetchitems = async () => {
    const itemsCollection = collection(db, "items");
    const itemsSnapshot = await getDocs(itemsCollection);
    const itemsList = itemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const categorizedItems = itemsList.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    setItems(categorizedItems);
  };

  const checkPassword = async (passwordInput) => {
    try {
      passwordInput = passwordInput.replace(/\s+/g, "");
      const passwordDocRef = doc(db, "admin", "password");
      const passwordDoc = await getDoc(passwordDocRef);

      if (passwordDoc.exists()) {
        const hashedPassword = passwordDoc.data().password;
        const isMatch = await bcrypt.compare(passwordInput, hashedPassword);

        if (isMatch) {
          setIsAuthenticated(true);
        } else {
          alert("Incorrect password!");
        }
      } else {
        console.error("No password document found!");
      }
    } catch (error) {
      console.error("Error checking password: ", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      checkPassword(password);
    }
  };

  useEffect(() => {
    fetchitems();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="admin-page">
      <h1>Admin Page</h1>

      {!isAuthenticated ? (
        <div className="password-section">
          <div className="password-input-container">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span
              className="eye-icon"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? "👁️" : "👁️‍🗨️"}
            </span>
          </div>
          <button
            onClick={() => checkPassword(password)}
            disabled={password === ""}
          >
            Submit
          </button>
        </div>
      ) : (
        <div>
          <h2>Edit Images</h2>
          <AddData item={items} setItem={setItems} onAddComplete={fetchitems} />
        </div>
      )}
    </div>
  );
};

export default AdminPage;
