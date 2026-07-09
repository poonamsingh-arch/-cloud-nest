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
const Analytics = require("./models/Analytics");

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const serverStartTime = new Date();

// Simple text splitter
function splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

// Read PDF
function readPDF(pdfPath) {
  return new Promise((resolve, reject) => {
    let text = "";
    new PdfReader().parseFileItems(pdfPath, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve(text);
      else if (item.text) text += item.text + " ";
    });
  });
}

// Auth middleware
function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Track every request in MongoDB
app.use(async (req, res, next) => {
  try {
    await Analytics.findOneAndUpdate(
      {},
      { $inc: { totalRequests: 1 }, lastUpdated: new Date() },
      { upsert: true }
    );
  } catch (e) {}
  next();
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Analytics - now from MongoDB
app.get("/analytics", async (req, res) => {
  try {
    const data = await Analytics.findOne({});
    const uptimeMinutes = Math.floor((new Date() - serverStartTime) / 1000 / 60);
    res.json({
      totalRequests: data?.totalRequests || 0,
      aiQuestions: data?.aiQuestions || 0,
      documentsUploaded: data?.documentsUploaded || 0,
      uptimeMinutes,
      serverStartTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Home
app.get("/", (req, res) => {
  res.send("CloudNest Backend Running");
});

// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: "User Registered Successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
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

// Get Users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload File
app.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const document = await Document.create({
      filename: req.file.originalname,
      filepath: req.file.filename,
      userId: req.userId
    });
    await Analytics.findOneAndUpdate(
      {},
      { $inc: { documentsUploaded: 1 } },
      { upsert: true }
    );
    res.status(201).json({ message: "File Uploaded Successfully", document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Documents
app.get("/documents", authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Document
app.delete("/documents/:id", authMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!document) return res.status(404).json({ message: "Document not found" });
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Document Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ask AI with RAG
app.post("/ask-ai", authMiddleware, async (req, res) => {
  try {
    const { question, documentId } = req.body;

    if (!question) return res.status(400).json({ message: "Question is required" });

    const documents = await Document.find({ userId: req.userId });
    if (documents.length === 0) return res.status(400).json({ message: "No documents uploaded" });

    const latestDocument = documentId
      ? documents.find(d => d._id.toString() === documentId)
      : documents[documents.length - 1];

    if (!latestDocument) return res.status(400).json({ message: "Document not found" });

    const pdfPath = "./uploads/" + latestDocument.filepath;
    const fullText = await readPDF(pdfPath);

    const chunkTexts = splitTextIntoChunks(fullText, 1000, 200);
    const chunks = chunkTexts.map(text => ({ pageContent: text }));

    const questionWords = question.toLowerCase().split(" ");
    const scoredChunks = chunks.map(chunk => {
      const content = chunk.pageContent.toLowerCase();
      const score = questionWords.reduce((acc, word) => {
        return acc + (content.includes(word) ? 1 : 0);
      }, 0);
      return { content: chunk.pageContent, score };
    });

    const topChunks = scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(c => c.content)
      .join("\n\n---\n\n");

    const prompt = `
You are an AI assistant for CloudNest.
Answer the question based ONLY on the context below.
If the answer is not in the context, say "I don't have that information in the uploaded document."

Context:
${topChunks}

Question: ${question}

Give a clear, detailed answer.
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const answer = completion.choices[0].message.content;

    // Save AI question count to MongoDB
    await Analytics.findOneAndUpdate(
      {},
      { $inc: { aiQuestions: 1 } },
      { upsert: true }
    );

    res.json({ answer, chunksUsed: 3, totalChunks: chunks.length });

  } catch (error) {
    console.log("RAG ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});