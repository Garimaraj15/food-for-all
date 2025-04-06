"use client";

import { createDonation } from "@/app/donate/utils/api/donations";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      router.push("/donations");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a Donation</h1>
      {message && <p className="text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="user_id"
          placeholder="Your User ID"
          value={formData.user_id}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          name="food_name"
          placeholder="Food Name"
          value={formData.food_name}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="date"
          name="expiry_date"
          value={formData.expiry_date}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          name="pickup_address"
          placeholder="Pickup Address"
          value={formData.pickup_address}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
