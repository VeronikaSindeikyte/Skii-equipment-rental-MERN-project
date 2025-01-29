import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";

const UserReservations = () => {
  const { user } = useAuthContext();  // Get the user data from context
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("User from context:", user);  // Debugging log

    if (!user || !user.token) {
      setError("Please log in to view your reservations.");
      setLoading(false);
      return;
    }

    const fetchUserReservations = async () => {
      try {
        const response = await axios.get("/api/user/reservations", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setUserData(response.data);
      } catch (err) {
        setError("Failed to fetch reservations.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReservations();
  }, [user]);  // Depend on user object

  if (loading) return <p>Loading reservations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!userData) return <p>No reservation data available.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Reservations</h1>
      
      {/* User Info */}
      <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-100">
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Role:</strong> {userData.role}</p>
      </div>

      {/* Reservations List */}
      <h2 className="text-xl font-semibold mb-3">Your Rented Items</h2>
      {userData.rentedItems.length > 0 ? (
        <ul className="space-y-4">
          {userData.rentedItems.map((rental) => (
            <li key={rental._id} className="p-4 border rounded-lg shadow-sm">
              <p><strong>Title:</strong> {rental.item.title}</p>
              <p><strong>Description:</strong> {rental.item.description}</p>
              <p><strong>Size:</strong> {rental.item.size}</p>
              <p><strong>Condition:</strong> {rental.item.condition}</p>
              <p><strong>Rental Price Per Day:</strong> €{rental.item.rentPricePerDay}</p>
              <p><strong>Rental Period:</strong> {new Date(rental.rentalPeriod.from).toLocaleDateString()} - {new Date(rental.rentalPeriod.to).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {rental.reservationStatus}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reservations found.</p>
      )}
    </div>
  );
};

export default UserReservations;
