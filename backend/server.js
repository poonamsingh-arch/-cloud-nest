const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { PdfReader } = require("pdfreader");
const Groq = require("groq-sdk");
require("dotenv").config();

const User = require("./models/User");
const Document = require("./models/Document");

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ======================
// MongoDB Connection
// ======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ======================
// Multer Storage
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ======================
// Health Check
// ======================
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ======================
// Home Route
// ======================
app.get("/", (req, res) => {
  res.send("CloudNest Backend Running");
});

// ======================
// Register User
// ======================
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: "User Registered Successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======================
// Login User
// ======================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Email" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======================
// Get Users
// ======================
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======================
// Upload File
// ======================
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const document = await Document.create({
      filename: req.file.originalname,
      filepath: req.file.filename,
    });
    res.status(201).json({ message: "File Uploaded Successfully", document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======================
// Get Documents
// ======================
app.get("/documents", async (req, res) => {
  try {
    const documents = await Document.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======================
// Delete Document
// ======================
app.delete("/documents/:id", async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Document Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======================
// Ask AI About PDF
// ======================
app.post("/ask-ai", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "Question is required" });

    const documents = await Document.find();
    if (documents.length === 0) return res.status(400).json({ message: "No documents uploaded" });

    const latestDocument = documents[documents.length - 1];
    const pdfPath = "./uploads/" + latestDocument.filepath;

    let pdfText = "";
    await new Promise((resolve, reject) => {
      new PdfReader().parseFileItems(pdfPath, (err, item) => {
        if (err) reject(err);
        else if (!item) resolve();
        else if (item.text) pdfText += item.text + " ";
      });
    });

    const prompt = `
You are an AI assistant for CloudNest.
Answer ONLY from the PDF content below.
If answer is not in PDF, say "I don't have that information."

PDF Content:
${pdfText}

Question: ${question}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const answer = completion.choices[0].message.content;
    res.json({ answer });

  } catch (error) {
    console.log("FULL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});