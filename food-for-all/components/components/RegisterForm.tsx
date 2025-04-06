"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    address: "",
    password: "",
    confirm_password: "",
    role: "", // 🔹 No default value (user must select)
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Ensure the API URL is correctly set
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    console.log("Submitting registration form with data:", formData);

    // Validate fields
    if (!formData.full_name || !formData.email || !formData.phone_number || !formData.address || !formData.password || !formData.confirm_password || !formData.role) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/user/register`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Server Response:", response.data);

      if (response.status === 201) {
        setSuccess("Registration successful! Please log in.");
        setFormData({
          full_name: "",
          email: "",
          phone_number: "",
          address: "",
          password: "",
          confirm_password: "",
          role: "",
        });
      }
    } catch (err: any) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Food For All</h1>
      <h2 className="text-xl font-semibold mb-6">Register Now</h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {success && <p className="text-green-500 text-center mb-4">{success}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full p-2 border rounded-md" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded-md" />
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} required className="w-full p-2 border rounded-md" />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <input id="address" name="address" value={formData.address} onChange={handleChange} required className="w-full p-2 border rounded-md" />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="w-full p-2 border rounded-md" />
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input id="confirm_password" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} required className="w-full p-2 border rounded-md" />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Register as</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange} required className="w-full p-2 border rounded-md">
            <option value="" disabled>Select your role</option>
            <option value="consumer">Consumer</option>
            <option value="donor">Donor</option>
            <option value="ngo">NGO</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
          Register
        </button>
      </form>

      <p className="text-center mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
