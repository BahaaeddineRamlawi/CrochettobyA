import React, { useState } from "react";
import { API_KEYS, category } from "./CommonComponent";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const AddData = ({ item, setItem, onAddComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inputRefs = {
    caption: React.createRef(),
    price: React.createRef(),
    category: React.createRef(),
    submit: React.createRef(),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({ ...prevItem, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const apiKeyDocRef = doc(db, "config", "apiKeyIndex");
      const apiKeyDocSnap = await getDoc(apiKeyDocRef);

      let currentApiKeyIndex = 0;

      if (apiKeyDocSnap.exists()) {
        currentApiKeyIndex = apiKeyDocSnap.data().currentIndex || 0;
      }

      const apiKey = API_KEYS[currentApiKeyIndex];

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setImageUrl(result.data.url);
        setItem((prevItem) => ({ ...prevItem, link: result.data.url }));

        const nextApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;

        await setDoc(apiKeyDocRef, { currentIndex: nextApiKeyIndex });
      } else {
        console.error("Image upload failed:", result);
        alert("Failed to upload image. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("An error occurred while uploading the image.");
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = () => {
    return item.link && item.caption && item.price && item.category;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      console.error("Form is not valid");
      return;
    }

    setSubmitting(true);
    try {
      const itemsCollection = collection(db, "items");
      await addDoc(itemsCollection, {
        link: item.link,
        caption: item.caption,
        price: item.price,
        category: item.category,
        timestamp: serverTimestamp(),
      });

      setItem({
        link: "",
        caption: "",
        price: "",
        category: "",
      });

      alert("Item added to Firestore successfully!");
      if (onAddComplete) {
        onAddComplete();
      }
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextField && nextField.current && nextField.current.focus();
    }
  };

  const handleDelete = async (id, category) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "items", id));

        setItem((prevItem) => {
          const updatedCategory = prevItem[category].filter(
            (item) => item.id !== id
          );

          return {
            ...prevItem,
            [category]: updatedCategory,
          };
        });

        alert("Item deleted successfully!");
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete item.");
      }
    }
  };

  return (
    <div>
      <div className="preview">
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            required
            onKeyDown={(e) => handleKeyDown(e, inputRefs.caption)}
          />
          <input
            type="text"
            name="caption"
            value={item.caption}
            onChange={handleChange}
            placeholder="Image Caption"
            ref={inputRefs.caption}
            onKeyDown={(e) => handleKeyDown(e, inputRefs.price)}
          />
          <select
            name="category"
            value={item.category || ""}
            onChange={handleChange}
            required
            ref={inputRefs.category}
            onKeyDown={(e) => handleKeyDown(e, inputRefs.submit)}
          >
            <option value="" disabled>
              Select Category
            </option>
            {category.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="price"
            value={item.price}
            onChange={handleChange}
            placeholder="Price"
            required
            ref={inputRefs.price}
            onKeyDown={(e) => handleKeyDown(e, inputRefs.category)}
          />
          <button
            id="additem"
            type="submit"
            ref={inputRefs.submit}
            disabled={!isFormValid() || submitting}
          >
            {submitting ? "Adding..." : "Add Item"}
          </button>
        </form>
        <div className="item-card">
          <img src={item.link} alt="" title={item.caption}></img>
          <div className="item-info">
            <h3>{item.caption}</h3>
            <p>{item.category}</p>
            <p>${item.price}</p>
          </div>
        </div>
      </div>

      {category.map((cat) => {
        const itemsByCategory = item[cat]?.sort(
          (a, b) => b.timestamp - a.timestamp
        );

        return itemsByCategory?.length > 0 ? (
          <div key={cat} className="Categories-admin">
            <h2 class="category-title">{cat}</h2>
            <div className="admin-gallery">
              {itemsByCategory.map((item) => (
                <div
                  key={item.id}
                  className="admin-card"
                  onClick={() => handleDelete(item.id, cat)}
                >
                  <img
                    src={item.link}
                    alt={item.caption}
                    title={item.caption}
                  ></img>
                  <div className="hover-overlay">
                    <div className="delete-icon">X</div>
                  </div>
                  <h3>{item.caption}</h3>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
};

export default AddData;
