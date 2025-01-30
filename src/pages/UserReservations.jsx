import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";

const UserReservations = () => {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    if (!user) return;

    if (!user || !user.token) {
      setError("Please log in to view your reservations.");
      setLoading(false);
      return;
    }

    fetchUserReservations();
  }, [user]);

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

  const handleDelete = async (itemId, reservationId) => {
    if (!user) return;

    if (!user || !user.token) {
        console.error("No authentication token found");
        setUpdateError("Authentication required.");
        return;
    }

    try {
        await axios.delete(`/api/user/reservations/${reservationId}`, {
            headers: { Authorization: `Bearer ${user.token}` },
        });

        fetchUserReservations();
    } catch (err) {
        setUpdateError("Failed to delete reservation.");
        console.error(err);
    }
};

  const handleUpdate = async (itemId, reservationId, newDates) => {
    try {
      await axios.patch(
        `/api/reservations/${reservationId}`,
        {
          rentalPeriod: newDates,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      
      fetchUserReservations();
    } catch (err) {
      setUpdateError("Failed to update reservation.");
      console.error(err);
    }
  };

  if (loading) return <p>Loading reservations...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!userData) return <p>No reservation data available.</p>;

  return (
    <div className="user-reservations">
      <h2>Mano nuomojama įranga:</h2>
      {updateError && <p className="error">{updateError}</p>}
      {userData.rentedItems.length > 0 ? (
        <ul className="reservation-list">
          {Array.from(new Set(userData.rentedItems.map(rental => rental.item._id))).map(itemId => {
            const rental = userData.rentedItems.find(r => r.item._id === itemId);
            const item = rental.item;
            
            return (
              <li key={itemId} className="reservation-box">
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p><strong>Aprašymas:</strong> {item.description}</p>
                  <p><strong>Dydis:</strong> {item.size}</p>
                  <p><strong>Būklė:</strong> {item.condition}</p>
                  <p><strong>Nuomos kaina parai:</strong> €{item.rentPricePerDay}</p>
                </div>

                <div className="reservations-section">
                  <h4>Rezervacijos:</h4>
                  {item.reservations && item.reservations.length > 0 ? (
                    <ul className="one-item-all-reservations">
                      {item.reservations.map((reservation, index) => (
                        <li key={index} className="one-item-one-reservation">
                          {reservation.rentalPeriod ? (
                            <p>
                              <strong>Rezervacijos periodas:</strong>{' '}
                              {new Date(reservation.rentalPeriod.from).toLocaleDateString()} - {' '}
                              {new Date(reservation.rentalPeriod.to).toLocaleDateString()}
                            </p>
                          ) : (
                            <p><strong>Rezervacijos periodas:</strong> Informacija neprieinama.</p>
                          )}
                          <p>
                            <strong>Rezervacijos būsena:</strong>{' '}
                            {reservation.reservationStatus || 'Informacija neprieinama'}
                          </p>
                          <div className="reservation-actions">
                            <button
                              onClick={() => {
                                const newFrom = prompt("Enter new start date (YYYY-MM-DD):", 
                                  reservation.rentalPeriod?.from?.split('T')[0]);
                                const newTo = prompt("Enter new end date (YYYY-MM-DD):", 
                                  reservation.rentalPeriod?.to?.split('T')[0]);
                                
                                if (newFrom && newTo) {
                                  handleUpdate(itemId, reservation._id, {
                                    from: newFrom,
                                    to: newTo
                                  });
                                }
                              }}
                              className="update-btn"
                            >
                              Atnaujinti rezervaciją
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Ar tikrai norite atšaukti šią rezervaciją?")) {
                                  handleDelete(itemId, reservation._id);
                                }
                              }}
                              className="delete-btn"
                            >
                              Atšaukti rezervaciją
                            </button>
                          </div>
                          <hr className="reservation-divider" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nuomojamos įrangos rezervacijų nerasta.</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Nuomojamos įrangos nerasta.</p>
      )}
    </div>
  );
};

export default UserReservations;