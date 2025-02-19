import "./pagesCSS/UserReservations.css";
import React from 'react';
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const UserReservations = () => {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserReservations = async () => {
      if (!user || !user.token) {
        setLoading(false);
        setError("Please log in to view your reservations.");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/reservations/user`, {
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

    fetchUserReservations();
  }, [user]);


  const handleDelete = async (reservationId) => {
    if (!user?.token) {
      setUpdateError("Authentication required.");
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/reservations/user/delete?reservationId=${reservationId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      console.log("Reservation deleted:", response.data);

      const userResponse = await axios.get(`${API_BASE_URL}/api/reservations/user`, {
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

  if (loading) { return <p className="ieskoma">Ieškoma vartotojo rezervacijų...</p>; }
  if (error) { return <p className="error">{error}</p>; }
  if (!userData?.reservations?.length) { return <p className="nerasta">Jūs neturite rezervuotos įrangos. <p>Norėdami rezervuoti, spauskite: <button onClick={() => navigate("/")} className="grizti">Grįžti</button></p></p>; }

  return (
    <div className="user-reservations">
      <h2>Mano rezervacijos:</h2>
      {updateError && <p className="error">{updateError}</p>}

      {userData.reservations.length ? (
        <ul className="all-reservations">
          {userData.reservations.map((reservation) => (
            <li key={reservation._id}>
              <div className="user-item-details">
                {reservation.item.photos && reservation.item.photos.length > 0 ? (
                  <img
                    id="iranga-photo"
                    src={reservation.item.photos[0]}
                    alt={reservation.item.title || "Įrangos nuotrauka"}
                    className="iranga-photo"
                  />
                ) : (
                  <div className="iranga-photo-placeholder">
                    <svg
                      id="photo-placeholder"
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
                <h4>{reservation.item.title || "Pavadinimas neprieinamas"}</h4>
                <div className="iranga-content">
                  <p>Kaina vienai parai: <span> {reservation.item.rentPricePerDay} €</span></p>
                  <p>Kam skirta:
                    <span>
                      {reservation.item.gender === "male" ? " Vyrams" :
                        reservation.item.gender === "female" ? " Moterims" :
                          reservation.item.gender === "unisex" ? " Unisex" : " Nenurodyta"}
                    </span>
                  </p>
                  <p>Dydis: <span>{reservation.item.size || "Nenurodyta"}</span></p>
                  <p id="last">Būklė:
                    <span>
                      {reservation.item.condition === "new" ? " Nauja" :
                        reservation.item.condition === "used" ? " Naudota" :
                          reservation.item.condition === "refurbished" ? " Atnaujinta" : " Nenurodyta"}
                    </span>
                  </p>

                  <div className="item-reservations">
                    <h4>Rezervacijos informacija:</h4>
                    <div className="reservation-details">
                      <p><strong>Rezervacijos pradžia: </strong>
                        {reservation.rentalPeriod?.from
                          ? new Date(reservation.rentalPeriod.from).toLocaleDateString('lt-LT', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          }).replace(/\./g, ' ')
                          : "Nežinoma"}
                      </p>
                      <p><strong>Rezervacijos pabaiga: </strong>
                        {reservation.rentalPeriod?.to
                          ? new Date(reservation.rentalPeriod.to).toLocaleDateString('lt-LT', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          }).replace(/\./g, ' ')
                          : "Nežinoma"}
                      </p>
                      <p className={
                          reservation?.reservationStatus === "Patvirtinta" ? "Patvirtinta" :
                          reservation?.reservationStatus === "Atmesta" ? "Atmesta" :
                          reservation?.reservationStatus === "Laukia patvirtinimo" ? "Laukia" : ""
                          }>
                        <strong>Rezervacijos būsena:</strong>{' '} <span>{reservation.reservationStatus}</span> 
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/reservations/${reservation.reservationId}`)}
                      className="edit-btn"
                    >
                      Keisti rezervacijos laiką
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm("Ar tikrai norite atšaukti šią rezervaciją?")) {
                          handleDelete(reservation.reservationId);
                        }
                      }}
                      className="delete-btn-from-user"
                    >
                      Atšaukti rezervaciją
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="nerasta">Jūs neturite rezervuotos įrangos.</p>
      )}
    </div>
  );
};

export default UserReservations;