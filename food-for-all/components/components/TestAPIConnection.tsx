"use client";

import { useEffect, useState } from "react";

function TestAPIConnection() {
  const [message, setMessage] = useState("Checking API connection...");
  const API_URL = process.env.NEXT_PUBLIC_API_URL; // ✅ Use env variable

  useEffect(() => {
    fetch(`${API_URL}/health`) // ✅ Change this to an existing endpoint in your Flask backend
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Error connecting to API"));
  }, []);

  return (
    <div>
      <h2>{message}</h2>
    </div>
  );
}

export default TestAPIConnection;
