
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Book Schema
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Book Model
const Book = mongoose.model("Book", bookSchema);

// Home Route
app.get("/", (req, res) => {
  res.send("BookStore backend is running!");
});

// GET: Fetch all books
app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

// POST: Add a new book
app.post("/api/books", async (req, res) => {
  try {
    const { title, author } = req.body;

    if (
      typeof title !== "string" ||
      typeof author !== "string" ||
      !title.trim() ||
      !author.trim()
    ) {
      return res.status(400).json({
        message: "Title and author are required",
      });
    }

    const book = new Book({
      title: title.trim(),
      author: author.trim(),
    });

    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (error) {
    console.error("Error adding book:", error.message);
    res.status(500).json({ message: "Failed to add book" });
  }
});

// PUT: Edit an existing book
app.put("/api/books/:id", async (req, res) => {
  try {
    const { title, author } = req.body;

    if (
      typeof title !== "string" ||
      typeof author !== "string" ||
      !title.trim() ||
      !author.trim()
    ) {
      return res.status(400).json({
        message: "Title and author are required",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        author: author.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error.message);
    res.status(500).json({ message: "Failed to update book" });
  }
});

// DELETE: Remove a book
app.delete("/api/books/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error.message);
    res.status(500).json({ message: "Failed to delete book" });
  }
});

// Server port
const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
