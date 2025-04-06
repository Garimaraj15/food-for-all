"use client"; // Required for Next.js App Router

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages

    console.log("API URL:", API_URL); 

    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email, // ✅ Use formData.email
          password: formData.password, // ✅ Use formData.password
        }),
      });

      const data = await response.json();
      console.log("Response status:", response.status); // ✅ Debug HTTP status
      console.log("Response data:", data); // ✅ Debug API response
      
      if (response.ok) {
        localStorage.setItem("user_id", data.user_id); // Store user ID
        setMessage(`Login successful! Welcome, ${data.full_name || "User"} (ID: ${data.user_id})`);
        //router.push(`/user/profile/${encodeURIComponent(data.user_id)}`);
      } else {
        setMessage(data.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 to-gray-900 p-6">
      <div className="bg-white max-w-md w-full rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              placeholder="Enter your email"
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              placeholder="Enter your password"
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className={`text-sm text-center ${message.includes("successful") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}