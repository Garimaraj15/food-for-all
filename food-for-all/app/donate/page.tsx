"use client";
import { useState } from "react";
import { createDonation } from "./utils/api/donations";
import { useRouter } from "next/navigation";

type FormFields = {
  user_id: string;
  category_id: string;
  food_name: string;
  description: string;
  quantity: string;
  nutrients: string;
  expiry_date: string;
  status: string;
  pickup_address: string;
  latitude: string;
  longitude: string;
  pickup_from: string;
  pickup_to: string;
  pickup_days: { [key: string]: boolean };
  contact_preference: string;
  additional_notes: string;
  safety_confirmed: string;
  share_contact_details: string;
};

export default function CreateDonationPage() {
  const [formData, setFormData] = useState<FormFields>({
    user_id: "",
    category_id: "",
    food_name: "",
    description: "",
    quantity: "",
    nutrients: "",
    expiry_date: "",
    status: "available",
    pickup_address: "",
    latitude: "",
    longitude: "",
    pickup_from: "",
    pickup_to: "",
    pickup_days: {},
    contact_preference: "",
    additional_notes: "",
    safety_confirmed: "true",
    share_contact_details: "false",
  });

  const [pickupAddress, setPickupAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const fetchCoordinates = async (address: string) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/donations/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) throw new Error("Failed to fetch coordinates");

      const data = await response.json();
      setLatitude(data.latitude.toString());
      setLongitude(data.longitude.toString());
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      pickup_address: pickupAddress,
      latitude,
      longitude,
    };

    const form = new FormData();
    (Object.keys(updatedFormData) as (keyof FormFields)[]).forEach((key) => {
      if (key === "pickup_days") {
        form.append("pickup_days", JSON.stringify(updatedFormData.pickup_days));
      } else {
        form.append(key, updatedFormData[key] as string);
      }
    });
    if (photo) form.append("photo", photo);

    const result = await createDonation(form);
    if (result.error) {
      setMessage("Error creating donation.");
    } else {
      setMessage("Donation created successfully!");
      router.push("/donate");
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-6 py-8 bg-white rounded-2xl shadow-xl mt-10 animate-fade-in">
      <h1 className="text-4xl font-bold text-emerald-700 mb-8 text-center">Start a Food Donation</h1>

      {message && (
        <p
          className={`mb-6 text-center font-medium text-lg transition-all duration-300 ${
            message.includes("Error") ? "text-red-500" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "user_id", placeholder: "Your User ID" },
            { name: "category_id", placeholder: "Category ID" },
            { name: "food_name", placeholder: "Food Name" },
            { name: "description", placeholder: "Description" },
          ].map(({ name, placeholder }) => (
            <input
              key={name}
              type="text"
              name={name}
              placeholder={placeholder}
              value={(formData as any)[name]}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm placeholder-gray-600"
              required
            />
          ))}

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm placeholder-gray-600"
            required
          />
          <select
            name="quantity_unit"
            value={formData.quantity_unit || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder-gray-600"
            required
          >
            <option value="">Select Unit</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
            <option value="liters">Liters</option>
            <option value="ml">Milliliters (ml)</option>
            <option value="pieces">Pieces</option>
          </select>

          {[
            { name: "nutrients", placeholder: "Nutrients" },
            { name: "expiry_date", type: "date" },
            { name: "status", placeholder: "Status" },
            { name: "pickup_from", placeholder: "Pickup From (e.g. 09:00)" },
            { name: "pickup_to", placeholder: "Pickup To (e.g. 18:00)" },
            { name: "additional_notes", placeholder: "Additional Notes" },
          ].map(({ name, placeholder, type }) => (
            <input
              key={name}
              type={type || "text"}
              name={name}
              placeholder={placeholder}
              value={(formData as any)[name]}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm placeholder-gray-500"
              required={name !== "additional_notes"}
            />
          ))}
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Food Condition</label>
          <select
            name="food_condition"
            value={formData.food_condition || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            required
          >
            <option value="">Select Food Condition</option>
            <option value="Fresh">Fresh</option>
            <option value="Near Expiry">Near Expiry</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Contact Preference</label>
          <select
            name="contact_preference"
            value={formData.contact_preference}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            required
          >
            <option value="">Select Contact Preference</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="block text-gray-700 font-semibold">Pickup Address</label>
          <input
            type="text"
            placeholder="Enter address"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            onBlur={() => fetchCoordinates(pickupAddress)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm placeholder-gray-600"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Latitude"
              value={latitude}
              readOnly
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 text-sm"
            />
            <input
              type="text"
              placeholder="Longitude"
              value={longitude}
              readOnly
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Pickup Days</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day, idx) => {
              const full = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][idx];
              return (
                <label key={day} className="flex items-center space-x-2 text-gray-700 hover:text-emerald-700 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.pickup_days?.[day] || false}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        pickup_days: { ...prev.pickup_days, [day]: e.target.checked },
                      }))
                    }
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span>{full}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Safety Confirmed</label>
            <select
              name="safety_confirmed"
              value={formData.safety_confirmed}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Share Contact Details</label>
            <select
              name="share_contact_details"
              value={formData.share_contact_details}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Upload Food Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold text-lg shadow-md transition-all duration-200"
        >
          Submit Donation
        </button>
      </form>
    </div>
  );
}