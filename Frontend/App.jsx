import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Projects from "./Projects";
import Community from "./Community";
import Header from "./Header";
import axios from "axios";
import "./App.css";
import Profile from "./Profile";
import CreateProject from "./CreateProject";

export default function App() {
  const [isNewUser, setIsNewUser] = useState(true);
  const apiClient = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
  });

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await apiClient.get("/auth/check-token");
        if (response.status === 200) {
          setIsNewUser(false);
        }
      } catch (error) {
        console.error("Token is invalid or missing", error);
        setIsNewUser(true);
      }
    };

    checkToken();
  }, []);

  return (
    <Router>
      <Header apiClient={apiClient} isNewUser={isNewUser} />
      <main>
        <Routes>
          <Route path="/" element={<Home apiClient={apiClient} />} />
          <Route path="/signup" element={<Register setIsNewUser={setIsNewUser} apiClient={apiClient} />} />
          <Route path="/signin" element={<Login setIsNewUser={setIsNewUser} apiClient={apiClient} />} />
          <Route path="/projects" element={<Projects apiClient={apiClient} />} />
          <Route path="/community" element={<Community apiClient={apiClient} />} />
          <Route path="/user/" element={<Profile apiClient={apiClient} />} />
          <Route path="/create" element={<CreateProject apiClient={apiClient} />} />
          <Route path="*" element={<Navigate to="/" />} /> {/* Перенаправление на главную для несуществующих маршрутов */}
        </Routes>
      </main>
    </Router>
  );
}
