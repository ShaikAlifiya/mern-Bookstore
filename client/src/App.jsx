
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/books";

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch books from MongoDB
  async function fetchBooks() {
    try {
      setError("");

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err.message || "Unable to load books");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  // Add or update a book
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API}/${editingId}` : API,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, author }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (isEditing) {
        setBooks((currentBooks) =>
          currentBooks.map((book) =>
            book._id === editingId ? data : book
          )
        );
        setMessage("Book updated successfully!");
      } else {
        setBooks((currentBooks) => [...currentBooks, data]);
        setMessage("Book added successfully!");
      }

      setTitle("");
      setAuthor("");
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  // Load book details into the form
  function handleEdit(book) {
    setEditingId(book._id);
    setTitle(book.title);
    setAuthor(book.author);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Delete a book
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete book");
      }

      setBooks((currentBooks) =>
        currentBooks.filter((book) => book._id !== id)
      );

      if (editingId === id) {
        cancelEdit();
      }

      setMessage("Book deleted successfully!");
    } catch (err) {
      setError(err.message || "Unable to delete book");
    }
  }

  // Cancel editing
  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setAuthor("");
    setError("");
    setMessage("");
  }

  return (
    <div className="container">
      <h1>My BookStore 📚</h1>

      <div className="form-card">
        <h2>{editingId ? "Edit Book" : "Add a Book"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Book title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Author name"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            required
          />

          <button type="submit">
            {editingId ? "Save Changes" : "Add Book"}
          </button>

          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>
      </div>

      {message && <p>{message}</p>}
      {error && <p role="alert">{error}</p>}

      <h2>Available Books</h2>

      {loading ? (
        <p>Loading books...</p>
      ) : books.length === 0 ? (
        <p>No books yet. Add your first book!</p>
      ) : (
        <div className="book-list">
          {books.map((book) => (
            <div key={book._id} className="book-card">
              <h3>{book.title}</h3>
              <p>Author: {book.author}</p>

              <button
                type="button"
                onClick={() => handleEdit(book)}
              >
                Edit
              </button>

              <button
                type="button"
                className="delete-btn"
                onClick={() => handleDelete(book._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
