
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Book Schema
const bookSchema = new mongoose.Schema({
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
});

// Book Model
const Book = mongoose.model("Book", bookSchema);

// Home Route
app.get("/", (req, res) => {
  res.send("BookStore backend is running!");
});

// GET API: Fetch all books
app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

// POST API: Add a new book
app.post("/api/books", async (req, res) => {
  try {
    const { title, author } = req.body;

    if (!title?.trim() || !author?.trim()) {
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

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, (0.0.0.0) => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
