import "./pagesCSS/ManageReservations.css"
import React from 'react';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";

const ManageReservations = () => {
    const { user } = useAuthContext();
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateError, setUpdateError] = useState(null);

    useEffect(() => {
        const fetchUserReservations = async () => {
            if (!user || !user.token) {
                setLoading(false);
                setError("Please log in to view reservations.");
                return;
            }

            try {
                const response = await axios.get(`/api/user/reservations/${id}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
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
    }, [user, id]);

    const handleDelete = async (rentedItem) => {
        if (!user?.token) {
            setUpdateError("Authentication required.");
            return;
        }

        console.log("Rented Item:", rentedItem);

        const item = rentedItem?.item;
        if (!item || !item.reservations || item.reservations.length === 0) {
            setUpdateError("No reservations found for this item.");
            console.error("Error: No reservations found", item);
            return;
        }

        const reservation = item.reservations.find(res => res.user?.toString() === userData.user._id?.toString());
        console.log("User ID to delete reservation from:", reservation.user);

        if (!reservation || !reservation._id) {
            setUpdateError("Reservation ID not found.");
            console.error("Error: Reservation ID not found", reservation);
            return;
        }

        console.log("Deleting reservation with ID:", reservation._id);

        try {
            const response = await axios.delete(
                `/api/user/delete/reservations/${reservation._id}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );

            console.log("Delete response:", response.data);

            const updatedResponse = await axios.get(`/api/user/reservations/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            setUserData(updatedResponse.data);
            setUpdateError(null);
            alert('Reservation deleted successfully!')
        } catch (err) {
            setUpdateError("Failed to delete reservation.");
            console.error("Deletion error:", err);
        }
    };

    const handleStatusUpdate = async (rentedItem, newStatus) => {
        if (!user?.token) {
            setUpdateError("Authentication required.");
            return;
        }

        const reservation = rentedItem.item.reservations.find(
            res => res.user.toString() === userData.user._id.toString()
        );

        if (!reservation) {
            setUpdateError("Reservation not found.");
            return;
        }

        try {
            await axios.patch(
                `/api/user/update/reservations/${reservation._id}`,
                { reservationStatus: newStatus },
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );

            const updatedResponse = await axios.get(`/api/user/reservations/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            setUserData(updatedResponse.data);
            setUpdateError(null);
            alert('Rezervacijos būsena sėkmingai pakeista!')
        } catch (err) {
            setUpdateError("Failed to update reservation status.");
            console.error(err);
        }
    };

    if (loading) return <p>Loading reservations...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!userData || !userData.user) {
        return <p>Loading user data...</p>;
    }

    return (
        <div className="user-reservations">
            <h2>{userData.user.email} rezervacijos</h2>
            {updateError && <p className="error">{updateError}</p>}
            {userData?.user?.rentedItems?.length ? (
                <ul>
                    {userData.user.rentedItems.map((rentedItem) => {
                        const item = rentedItem.item;
                        const reservation = item && item.reservations
                            ? item.reservations.find(res =>
                                res.user && userData.user._id &&
                                res.user.toString() === userData.user._id.toString()
                            )
                            : null;

                        return (
                            <li key={rentedItem._id}>
                                <div className="item-details">
                                    {item?.photos?.length > 0 ? (
                                        <img
                                            src={item.photos[0]}
                                            alt={item.title || "Item photo"}
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
                                    <h3>{item?.title || "Nežinomas pavadinimas"}</h3>
                                    <p className="aprasymas"><strong>Aprašymas:</strong> {item?.description || "Nėra aprašymo"}</p>
                                    <p><strong>Nuomos kaina per dieną:</strong> {item?.rentPricePerDay ? `${item.rentPricePerDay}€` : "Nenurodyta"}</p>
                                    <p><strong>Dydis:</strong> {item?.size || "Nenurodyta"}</p>
                                    <p><strong>Būklė:</strong> {item?.condition || "Nenurodyta"}</p>
                                    <p><strong>Nuomos periodas:</strong>
                                        {reservation?.rentalPeriod && reservation.rentalPeriod.from && reservation.rentalPeriod.to
                                            ? `${new Date(reservation.rentalPeriod.from).toLocaleDateString()} - ${new Date(reservation.rentalPeriod.to).toLocaleDateString()}`
                                            : "Nežinomas laikotarpis"
                                        }
                                    </p>
                                    <p>
                                        <strong>Rezervacijos statusas: <br /></strong> 
                                        <span className={`reservation-status ${reservation?.reservationStatus?.toLowerCase()}`}>
                                            {reservation?.reservationStatus || "Nenurodyta"}
                                        </span>
                                    </p>
                                    <div className="reservation-actions">
                                    <button onClick={() => handleDelete(rentedItem)} className="delete-btn">
                                        Ištrinti rezervaciją
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(rentedItem, 'Patvirtinta')}
                                        className="status-btn"
                                        disabled={reservation?.reservationStatus === 'Patvirtinta'}
                                    >
                                        Patvirtinti
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(rentedItem, 'Atmesta')}
                                        className="status-btn"
                                        disabled={reservation?.reservationStatus === 'Atmesta'}
                                    >
                                        Atmesti
                                    </button>
                                </div>
                                </div>
                                
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="nerasta">Rezervacijų nerasta.</p>
            )}
        </div>
    );
};

export default ManageReservations;