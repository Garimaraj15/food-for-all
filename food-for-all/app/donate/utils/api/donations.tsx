// app/donate/utils/api/donations.ts
"use client";
const BASE_URL = "http://127.0.0.1:5000/api/donations"; // Updated API endpoint

// Fetch all donations
export async function getAllDonations() {
  try {
    const res = await fetch(`${BASE_URL}/all`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching donations:", error);
    return { error: "Failed to fetch donations" };
  }
}

// Fetch a single donation
export async function getDonation(id) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching donation:", error);
    return { error: "Failed to fetch donation" };
  }
}

// Create a new donation
export async function createDonation(formData) {
  try {
    const res = await fetch(`${BASE_URL}/create`, {
      method: "POST",
      body: formData, // FormData object for images
    });
    return await res.json();
  } catch (error) {
    console.error("Error creating donation:", error);
    return { error: "Failed to create donation" };
  }
}

// Upload an image
export async function uploadDonationImage(donationId, file) {
  const formData = new FormData();
  formData.append("photo", file);

  try {
    const res = await fetch(`${BASE_URL}/upload-image/${donationId}`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    console.error("Error uploading donation image:", error);
    return { error: "Failed to upload donation image" };
  }
}
