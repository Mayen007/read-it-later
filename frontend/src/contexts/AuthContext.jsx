import { useState, useEffect } from "react";
import api from "../services/api";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: userData,
      } = response.data;

      // Store in state
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);

      // Persist to localStorage
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await api.post("/auth/register", { email, password });
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: userData,
      } = response.data;

      // Store in state
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);

      // Persist to localStorage
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const logout = () => {
    // Clear state
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  const refreshAccessToken = async () => {
    try {
      const response = await api.post("/auth/refresh", { refreshToken });
      const { accessToken: newAccessToken } = response.data;

      setAccessToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);

      return newAccessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout(); // If refresh fails, log out user
      return null;
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    login,
    register,
    logout,
    refreshAccessToken,
    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
