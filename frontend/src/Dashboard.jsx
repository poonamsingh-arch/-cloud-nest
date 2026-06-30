import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const [documents, setDocuments] =
    useState([]);

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Get Documents
  const getDocuments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/documents"
      );

      setDocuments(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDocuments();
  }, []);

  // Upload File
  const uploadFile = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:3000/upload",
        formData
      );

      alert(response.data.message);

      setFile(null);

      getDocuments();
    } catch (error) {
      console.log(error);

      alert("Upload Failed");
    }
  };

  // Delete Document
  const deleteDocument = async (id) => {
    try {
      await axios.delete(
        `http://localhost:3000/documents/${id}`
      );

      getDocuments();
    } catch (error) {
      console.log(error);
    }
  };

  


// Ask AI
const askQuestion = async () => {
  if (!question) {
    alert("Please ask a question");
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:3000/ask-ai",
      {
        question,
      }
    );

    setAnswer(response.data.answer);

  } catch (error) {
    console.log(error);

    alert(
      error.response?.data?.error ||
      "AI Error"
    );
  }
};









  return (
    <div style={{ padding: "20px" }}>
      <h1>CloudNest Dashboard</h1>

      <p>
        Welcome to CloudNest Platform
      </p>

      <hr />

      {/* Upload Section */}

      <h2>Upload Document</h2>

      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <br />
      <br />

      <button onClick={uploadFile}>
        Upload File
      </button>

      <hr />

      {/* Documents Section */}

      <h2>
        Uploaded Documents (
        {documents.length})
      </h2>

      {documents.length === 0 ? (
        <p>No documents uploaded</p>
      ) : (
        documents.map((doc) => (
          <div key={doc._id}>
            <a
              href={`http://localhost:3000/uploads/${doc.filepath}`}
              target="_blank"
              rel="noreferrer"
            >
              {doc.filename}
            </a>

            {" "}

            <button
              onClick={() =>
                deleteDocument(doc._id)
              }
            >
              Delete
            </button>

            <hr />
          </div>
        ))
      )}

      {/* AI Search Section */}

      <h2>Ask AI About Your PDF</h2>

      <input
        type="text"
        placeholder="Ask question..."
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
        style={{
          padding: "10px",
          width: "300px",
        }}
      />

      <br />
      <br />

      <button onClick={askQuestion}>
        Ask AI
      </button>

      <br />
      <br />

      {answer && (
        <div
          style={{
            border: "1px solid black",
            padding: "15px",
          }}
        >
          <h3>AI Answer:</h3>

          <p>{answer}</p>
        </div>
      )}

      <hr />

      {/* Logout */}

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;