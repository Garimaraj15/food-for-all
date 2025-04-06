'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface FoodItem {
  id: number;
  name: string;
  category: string;
  description: string;
  time: string;
  expires: string;
  image: string;
}

export default function ExplorePage() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setCoords(null); // fallback mode
      }
    );
  }, []);

  // Refetch when location or search changes
  useEffect(() => {
    fetchFood();
  }, [search, coords]);

  const fetchFood = async () => {
    try {
      setLoading(true);
      let url = `http://127.0.0.1:5000/api/food/explore?search=${encodeURIComponent(search)}`;

      if (coords) {
        const { lat, lng } = coords;
        url += `&lat=${lat}&lng=${lng}&radius=10`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setFoodItems(data.food_items || []);
    } catch (error) {
      console.error('Failed to fetch food items:', error);
      setFoodItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = (id: number) => {
    alert(`Request sent for donation ID ${id}`);
    // You can later replace this with an actual API call to POST /food/request
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Explore Available Donations</h1>

      <input
        type="text"
        placeholder="Search food..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : foodItems.length === 0 ? (
        <div className="text-center text-gray-500">No food donations found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition duration-300"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-1">{item.name}</h2>
                <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                <p className="text-gray-700 mb-2">{item.description}</p>
                <div className="text-xs text-gray-400 mb-1">Listed: {item.time}</div>
                <div className="text-xs text-gray-400 mb-4">Expires: {item.expires}</div>
                <button
                  onClick={() => handleRequest(item.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Request Item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
