import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { User } from "./types";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");

  const handleLogin = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
  };

  return <BrowserRouter></BrowserRouter>;
}

export default App;
