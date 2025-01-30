import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { User } from "./types";
import { AuthPage } from "./pages";

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

  return (
    <BrowserRouter>
      <Route path="/" element={<AuthPage onLogin={handleLogin} />} />
    </BrowserRouter>
  );
}

export default App;
