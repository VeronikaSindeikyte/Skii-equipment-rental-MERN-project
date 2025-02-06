import "./pagesCSS/UserReservations.css";
import React from 'react';
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
    const fetchReservations = async () => {
      if (!user || !user.token) {
        setLoading(false);
        setError("Please log in to view your reservations.");
        return;
      }

      try {
        const response = await axios.get("/api/reservations/user", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setUserData(response.data);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch reservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user]);



  const handleDelete = async (reservationId) => {
    if (!user?.token) {
      setUpdateError("Authentication required.");
      return;
    }

    console.log("Reservation id:", reservationId);

    try {
      const response = await axios.delete(`/api/reservations/user/delete?reservationId=${reservationId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      console.log("Reservation deleted:", response.data);

      const userResponse = await axios.get("/api/reservations/user", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setUserData(userResponse.data);
      setUpdateError(null);

      console.log("Updated user data:", userResponse.data);
    } catch (err) {
      setUpdateError("Failed to delete reservation.");
      console.error("Error in handleDelete:", err.response?.data || err);
    }
  };

  const handleUpdate = async (reservationId, newDates) => {
    if (!user?.token) {
      setUpdateError("Authentication required.");
      return;
    }

    try {
      await axios.patch(
        `/api/reservations/admin/updateTime/${reservationId}`,
        { rentalPeriod: newDates },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const response = await axios.get("/api/reservations/user", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setUserData(response.data);
      setUpdateError(null);
    } catch (err) {
      setUpdateError("Failed to update reservation.");
      console.error(err);
    }
  };

  if (loading) {return <p>Ieškoma vartotojo rezervacijų...</p>}
  if (error) {return <p className="error">{error}</p>}
  if (!userData?.reservations?.length) {return <p>Rezervacijų nerasta.</p>}

  const groupedItems = userData.reservations.reduce((acc, reservation) => {
    const existingItem = acc.find(item => item.item._id === reservation.item._id);

    if (existingItem) {
      existingItem.reservations.push(reservation);
    } else {
      acc.push({
        item: reservation.item,
        reservations: [reservation]
      });
    }

    return acc;
  }, []);

  return (
    <div className="user-reservations">
      <h2>Mano nuomojama įranga:</h2>
      {updateError && <p className="error">{updateError}</p>}
      <ul className="reservation-list">
        {groupedItems.map(({ item, reservations }) => (
          <li key={item._id} className="reservation-box">
            <div className="item-details">
              {item.photos && item.photos.length > 0 ? (
                <img
                  src={item.photos[0]}
                  alt={item.title || "Įrangos nuotrauka"}
                  className="iranga-photo"
                />
              ) : (
                <div className="iranga-photo-placeholder">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="48"
                    height="48"
                    fill="gray"
                  >
                    <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 5h14v10.09l-2.5-2.5a1 1 0 0 0-1.42 0L11 16l-2.09-2.09a1 1 0 0 0-1.42 0L5 16.5zm0 14v-.59l3.5-3.5 2.09 2.09a1 1 0 0 0 1.42 0L15 14.5l3.5 3.5V19z" />
                    <circle cx="8" cy="8" r="2" />
                  </svg>
                </div>
              )}
              <h3>{item.title || 'Untitled Item'}</h3>
              <p className="aprasymas"><strong>Aprašymas:</strong> {item.description || 'No description available'}</p>
              <p><strong>Dydis:</strong> {item.size || 'Not specified'}</p>
              <p><strong>Būklė:</strong> {item.condition || 'Not specified'}</p>
              <p><strong>Nuomos kaina parai:</strong> €{item.rentPricePerDay || '0'}</p>

              <div className="reservations-section">
                <h4>Rezervacijos:</h4>
                {reservations?.length > 0 ? (
                  <ul className="one-item-all-reservations">
                    {reservations.map((reservation, index) => (
                      <li key={`${item._id}-${index}`} className="one-item-one-reservation">
                        {reservation?.rentalPeriod ? (
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
                          {reservation?.reservationStatus || 'Informacija neprieinama'}
                        </p>
                        <div className="reservation-actions">
                          <button
                            onClick={() => {
                              const newFrom = prompt(
                                "Enter new start date (YYYY-MM-DD):",
                                reservation?.rentalPeriod?.from?.split('T')[0]
                              );
                              const newTo = prompt(
                                "Enter new end date (YYYY-MM-DD):",
                                reservation?.rentalPeriod?.to?.split('T')[0]
                              );

                              if (newFrom && newTo) {
                                handleUpdate(reservation._id, {
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
                                handleDelete(reservation.reservationId);
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserReservations;