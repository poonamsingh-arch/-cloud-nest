import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";



function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");


const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const getUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const registerUser = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      setName("");
      setEmail("");
      setPassword("");

      getUsers();
    } catch (error) {
      console.log(error);
      alert("Error");
    }
  };


const loginUser = async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    if (data.token) {
      localStorage.setItem(
        "token",
        data.token
      );

    setLoginEmail("");
    setLoginPassword("");  


   
      alert("Login Successful");

     navigate("/dashboard");

    }
  } catch (error) {
    console.log(error);
  }
};










  const updateUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/users/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      setName("");
      setEmail("");
      setPassword("");
      setEditingId(null);

      getUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await fetch(
        `http://localhost:3000/users/${id}`,
        {
          method: "DELETE",
        }
      );

      getUsers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>CloudNest</h1>

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button
        onClick={
          editingId
            ? updateUser
            : registerUser
        }
      >
        {editingId ? "Update User" : "Register"}
      </button>

        

<hr />

<h2>Login</h2>

<input
  type="email"
  placeholder="Login Email"
  value={loginEmail}
  onChange={(e) =>
    setLoginEmail(e.target.value)
  }
/>

<br />
<br />

<input
  type="password"
  placeholder="Login Password"
  value={loginPassword}
  onChange={(e) =>
    setLoginPassword(e.target.value)
  }
/>

<br />
<br />

<button onClick={loginUser}>
  Login
</button>






      <hr />

      <h2>Registered Users</h2>

      {users.map((user) => (
        <div key={user._id}>
          <p>
            {user.name} - {user.email}
          </p>

          <button
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
              setEditingId(user._id);
            }}
          >
            Edit
          </button>

          <button
            onClick={() =>
              deleteUser(user._id)
            }
          >
            Delete
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;