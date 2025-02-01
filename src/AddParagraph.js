import React, { useState } from "react";
import {
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  collection,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const AddParagraph = ({ paragraphs, setParagraphs }) => {
  const [newParagraph, setNewParagraph] = useState("");

  const handleResizeTextarea = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleAddParagraph = async () => {
    if (newParagraph.trim() === "") {
      alert("Paragraph cannot be empty.");
      return;
    }

    const textWithPlaceholder = newParagraph.replace(/\n/g, "__NEWLINE__");

    try {
      const docRef = await addDoc(collection(db, "paragraphs"), {
        text: textWithPlaceholder,
      });

      setParagraphs((prev) => [
        ...prev,
        { id: docRef.id, text: textWithPlaceholder },
      ]);
      setNewParagraph("");
      const textarea = document.querySelector(".add-paragraph textarea");
      if (textarea) {
        textarea.style.height = "auto";
      }
    } catch (error) {
      console.error("Error adding paragraph:", error);
      alert("Failed to add the paragraph. Please try again.");
    }
  };

  const handleUpdateParagraph = async (id, updatedText) => {
    if (updatedText.trim() === "") {
      alert("Paragraph cannot be empty.");
      return;
    }

    const textWithPlaceholder = updatedText.replace(/\n/g, "__NEWLINE__");

    try {
      await updateDoc(doc(db, "paragraphs", id), { text: textWithPlaceholder });

      setParagraphs((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, text: textWithPlaceholder.replace(/__NEWLINE__/g, "\n") }
            : p
        )
      );
    } catch (error) {
      console.error("Error updating paragraph:", error);
      alert("Failed to update the paragraph. Please try again.");
    }
  };

  const handleDeleteParagraph = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this paragraph?"
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "paragraphs", id));
        setParagraphs((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting paragraph:", error);
      }
    }
  };

  return (
    <div className="boxes-page">
      {paragraphs.map((p) => (
        <div key={p.id} className="box-admin">
          <textarea
            value={p.text}
            onChange={(e) =>
              setParagraphs((prev) =>
                prev.map((par) =>
                  par.id === p.id ? { ...par, text: e.target.value } : par
                )
              )
            }
            onBlur={(e) => handleUpdateParagraph(p.id, e.target.value)}
            onClick={(e) => handleResizeTextarea(e)}
            onInput={(e) => handleResizeTextarea(e)}
            className="editable-textarea"
          />
          <button onClick={() => handleDeleteParagraph(p.id)}>Delete</button>
        </div>
      ))}
      <div className="add-paragraph">
        <textarea
          value={newParagraph}
          onChange={(e) => setNewParagraph(e.target.value)}
          onInput={(e) => handleResizeTextarea(e)}
          placeholder="Add new paragraph"
        />
        <button onClick={handleAddParagraph}>Add Paragraph</button>
      </div>
    </div>
  );
};

export default AddParagraph;
