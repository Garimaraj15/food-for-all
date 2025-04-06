import { useEffect, useState } from "react";
import { getAllDonations } from "@/app/donate/utils/api/donations";
import DonationCard from "@/components/DonationCard";

export default function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getAllDonations();
      if (!data.error) {
        setDonations(data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Donations</h1>
      {loading ? (
        <p>Loading donations...</p>
      ) : donations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {donations.map((donation) => (
            <DonationCard key={donation.id} donation={donation} />
          ))}
        </div>
      ) : (
        <p>No donations available.</p>
      )}
    </div>
  );
}
