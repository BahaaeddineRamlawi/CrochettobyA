import React, { useState, useEffect } from "react";
import { API_KEYS, category } from "./CommonComponent";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const AddData = ({ item, setItem, onAddComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [itemsByCategory, setItemsByCategory] = useState({});
  
  // Function to fetch and update items
  const fetchItems = async () => {
    const itemsCollection = collection(db, "items");
    const snapshot = await getDocs(itemsCollection);
    const itemsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const groupedItems = {};

    category.forEach((cat) => {
      groupedItems[cat] = [];
    });

    itemsData.forEach((item) => {
      item.category.forEach((cat) => {
        if (groupedItems[cat]) groupedItems[cat].push(item);
      });
    });

    setItemsByCategory(groupedItems); // Update the state with new items
  };

  useEffect(() => {
    fetchItems(); // Load items on initial render
  }, []); // Only run once on mount

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

  const handleCategoryChange = (e) => {
    const { options } = e.target;
    const selectedCategories = [];
    for (const option of options) {
      if (option.selected) {
        selectedCategories.push(option.value);
      }
    }
    setItem((prevItem) => ({ ...prevItem, category: selectedCategories }));
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
    return item.link && item.caption && item.price && item.category.length > 0;
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
        category: [],
      });

      alert("Item added to Firestore successfully!");
      if (onAddComplete) {
        onAddComplete();
      }

      // Reload the items after adding a new one
      fetchItems(); // Refresh items after adding
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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "items", id));
        alert("Item deleted successfully!");

        // Reload the items after deleting one
        fetchItems(); // Refresh items after delete
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
            value={item.category || []}
            onChange={handleCategoryChange}
            multiple
            required
            ref={inputRefs.category}
            onKeyDown={(e) => handleKeyDown(e, inputRefs.submit)}
          >
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
          <img src={item.link} alt="" title={item.caption} />
          <div className="item-info">
            <h3>{item.caption}</h3>
            <p>
              {Array.isArray(item.category) ? item.category.join(", ") : ""}
            </p>
            <p>${item.price}</p>
          </div>
        </div>
      </div>

      {Object.keys(itemsByCategory).map((cat) => (
        <CategorySection
          key={cat}
          category={cat}
          items={itemsByCategory[cat]}
          handleDelete={handleDelete}
        />
      ))}
    </div>
  );
};

const CategorySection = ({ category, items, handleDelete }) =>
  items.length > 0 && (
    <div className="Categories-admin">
      <h2 className="category-title">{category}</h2>
      <div className="admin-gallery">
        {items.map((item) => (
          <EditableItem key={item.id} item={item} handleDelete={handleDelete} />
        ))}
      </div>
    </div>
  );

const EditableItem = ({ item, handleDelete }) => {
  const [editedCaption, setEditedCaption] = useState(item.caption);
  const [editedPrice, setEditedPrice] = useState(item.price);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      const itemRef = doc(db, "items", item.id);
      await updateDoc(itemRef, {
        caption: editedCaption,
        price: editedPrice,
      });
      alert("Item updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item.");
    }
  };

  return (
    <div className="admin-card">
      <img src={item.link} alt={editedCaption} title={editedCaption} />
      <div className="hover-overlay">
        <div className="delete-icon" onClick={() => handleDelete(item.id)}>
          X
        </div>
      </div>
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedCaption}
            onChange={(e) => setEditedCaption(e.target.value)}
          />
          <input
            type="number"
            value={editedPrice}
            onChange={(e) => setEditedPrice(e.target.value)}
          />
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <h3 onClick={() => setIsEditing(true)}>{editedCaption}</h3>
          <p>${editedPrice}</p>
        </>
      )}
    </div>
  );
};

export default AddData;
