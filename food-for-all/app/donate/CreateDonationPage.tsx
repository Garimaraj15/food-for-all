"use client";
import { useState } from "react";
import { createDonation } from "./utils/api/donations";
import { useRouter } from "next/router";

export default function CreateDonationPage() {
  const [formData, setFormData] = useState({
    user_id: "",
    food_name: "",
    quantity: "",
    expiry_date: "",
    pickup_address: "",
  });
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState(""); 
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    Object.keys(formData).forEach((key) => form.append(key, formData[key]));
    if (photo) form.append("photo", photo);

    const result = await createDonation(form);
    if (result.error) {
      setMessage("Error creating donation.");
    } else {
      setMessage("Donation created successfully!");
      if (result.image_url) {
        setImageUrl(result.image_url); // show uploaded image
      }
      // Delay redirection to allow image preview for a moment
      setTimeout(() => {
        router.push("/donate");
      }, 2000); // 2 seconds delay
    }
  };

  return (
    <div className="container mx-auto max-w-xl p-6 bg-white rounded-2xl shadow-lg mt-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6 text-center">Create a Donation</h1>

      {message && (
        <p className={`mb-4 text-center font-medium ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}

      {imageUrl && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Uploaded Image Preview:</p>
          <img
            src={imageUrl}
            alt="Uploaded Donation"
            className="w-full max-h-64 object-contain rounded-xl border"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="user_id"
          placeholder="Your User ID"
          value={formData.user_id}
          onChange={handleChange}
          className="input-field"
          required
        />
        <input
          type="text"
          name="food_name"
          placeholder="Food Name"
          value={formData.food_name}
          onChange={handleChange}
          className="input-field"
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="input-field"
          required
        />
        <input
          type="date"
          name="expiry_date"
          value={formData.expiry_date}
          onChange={handleChange}
          className="input-field"
          required
        />
        <input
          type="text"
          name="pickup_address"
          placeholder="Pickup Address"
          value={formData.pickup_address}
          onChange={handleChange}
          className="input-field"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="input-field"
        />

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold transition-all duration-200"
        >
          Submit Donation
        </button>
      </form>
    </div>
  );
}
