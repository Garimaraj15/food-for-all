// app/donate/DonationCard.tsx
"use client";

export default function DonationCard({ donation }) {
  return (
    <div className="border border-emerald-100 p-4 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-emerald-50 animate-fade-in">
      {/* Image */}
      {donation.photo && (
        <img
          src={donation.photo}
          alt={donation.food_name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}

      {/* Title */}
      <h3 className="text-xl font-semibold text-emerald-700 mb-2">
        {donation.food_name}
      </h3>

      {/* Info */}
      <div className="text-sm space-y-1 text-gray-700">
        <p>
          <span className="font-medium">Quantity:</span> {donation.quantity}
        </p>
        <p>
          <span className="font-medium">Expiry Date:</span>{" "}
          {new Date(donation.expiry_date).toLocaleDateString()}
        </p>
        <p>
          <span className="font-medium">Pickup Address:</span>{" "}
          {donation.pickup_address}
        </p>
        <p>
          <span className="font-medium">User ID:</span> {donation.user_id}
        </p>
      </div>
    </div>
  );
}
