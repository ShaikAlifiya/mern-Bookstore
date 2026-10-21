
import { useEffect, useState } from "react";
import "./App.css";

const API = "https://mern-bookstore-c74e.onrender.com/api/books";

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all books
  const fetchBooks = async () => {
    try {
      setError("");

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Failed to load books");
      }

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error("Fetch books error:", err);
      setError(
        "Could not connect to the BookStore server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load books when the page opens
  useEffect(() => {
    fetchBooks();
  }, []);

  // Add or update a book
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!title.trim() || !author.trim()) {
      setError("Please enter both the book title and author.");
      return;
    }

    const isEditing = editingId !== null;
    const url = isEditing ? `${API}/${editingId}` : API;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save book");
      }

      setTitle("");
      setAuthor("");
      setEditingId(null);
      setMessage(isEditing ? "Book updated successfully!" : "Book added successfully!");

      await fetchBooks();
    } catch (err) {
      console.error("Save book error:", err);
      setError(err.message || "Failed to save book. Please try again.");
    }
  };

  // Start editing a book
  const handleEdit = (book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setEditingId(book._id);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel editing
  const handleCancel = () => {
    setTitle("");
    setAuthor("");
    setEditingId(null);
    setError("");
    setMessage("");
  };

  // Delete a book
  const handleDelete = async (id) => {
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
        throw new Error(data.message || "Unable to delete book");
      }

      if (editingId === id) {
        handleCancel();
      }

      setMessage("Book deleted successfully!");
      await fetchBooks();
    } catch (err) {
      console.error("Delete book error:", err);
      setError(err.message || "Failed to delete book. Please try again.");
    }
  };

  return (
    <main className="container">
      <h1>My BookStore 📚</h1>

      <section className="form-section">
        <h2>{editingId ? "Edit Book" : "Add a Book"}</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Book Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter book title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="author">Author</label>
            <input
              id="author"
              type="text"
              placeholder="Enter author name"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              required
            />
          </div>

          <button type="submit">
            {editingId ? "Update Book" : "Add Book"}
          </button>

          {editingId && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>

        {error && <p role="alert" className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
      </section>

      <section className="books-section">
        <h2>Available Books</h2>

        {loading ? (
          <p>Loading books...</p>
        ) : error && books.length === 0 ? (
          <p>Books could not be loaded. Check the error above.</p>
        ) : books.length === 0 ? (
          <p>No books yet. Add your first book!</p>
        ) : (
          <div className="book-list">
            {books.map((book) => (
              <article className="book-card" key={book._id}>
                <h3>{book.title}</h3>
                <p>Author: {book.author}</p>

                <button type="button" onClick={() => handleEdit(book)}>
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(book._id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
