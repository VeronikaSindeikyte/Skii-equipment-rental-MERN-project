import "./pagesCSS/ManageReservations.css";
import React from 'react';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";

const ManageReservations = () => {
    const { user } = useAuthContext();
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateError, setUpdateError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserReservations = async () => {
            if (!user || !user.token) {
                setLoading(false);
                setError("Please log in to view reservations.");
                return;
            }

            try {
                const response = await axios.get(`/api/reservations/admin/${id}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (!response.data || !response.data.user) {
                    setError("No user data received");
                    setLoading(false);
                    return;
                }

                setUserData(response.data);
                setError(null);
            } catch (err) {
                console.error("Detailed fetch error:", err);
                setError(`Failed to fetch reservations: ${err.response?.data?.message || err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchUserReservations();
    }, [user, id]);

    const handleDelete = async (reservationId, itemId) => {
        if (!user?.token) {
            setUpdateError("Authentication required.");
            return;
        }

        if (!reservationId || !itemId) {
            setUpdateError("Reservation ID or Item ID not found.");
            return;
        }

        const confirmDelete = window.confirm("Ar tikrai norite ištrinti šią rezervaciją?");
        if (!confirmDelete) return;

        try {
            await axios.delete("/api/reservations/admin/delete", {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
                params: {
                    itemId: itemId,
                    reservationId: reservationId
                }
            });

            const updatedResponse = await axios.get(`/api/reservations/admin/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setUserData(updatedResponse.data);
            setUpdateError(null);
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Failed to delete reservation.";
            setUpdateError(errorMessage);
            console.error("Error in handleDelete:", err);
        }
    };

    const handleStatusUpdate = async (reservationId, newStatus) => {
        if (!user?.token) {
            setUpdateError("Authentication required.");
            return;
        }

        if (!reservationId) {
            setUpdateError("Reservation not found.");
            return;
        }

        try {
            await axios.patch(
                `/api/reservations/admin/updateStatus/${reservationId}`,
                { reservationStatus: newStatus },
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );

            const updatedResponse = await axios.get(`/api/reservations/admin/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            setUserData(updatedResponse.data);
            setUpdateError(null);
            alert('Rezervacijos būsena sėkmingai pakeista!');
        } catch (err) {
            setUpdateError("Failed to update reservation status.");
            console.error(err);
        }
    };

    if (loading) return <p className="ieskoma">Kraunama rezervacijų informacija...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!userData || !userData.user) {
        return <p className="ieskoma">Kraunama vartotojo informacija...</p>;
    }

    const seenReservationIds = new Set();

    const allReservations = userData.user.reservations.flatMap(reservation => {
        const item = reservation.item;
        return item.reservations
            .filter(res => {
                const isCurrentUser = res.user.toString() === userData.user._id.toString();
                const isDuplicate = seenReservationIds.has(res._id);
                if (isCurrentUser && !isDuplicate) {
                    seenReservationIds.add(res._id);
                    return true;
                }
                return false;
            })
            .map(res => ({
                ...res,
                item: item,
                uniqueKey: `${res._id}-${item._id}`
            }));
    });

    return (
        <div className="user-reservations">
            <h2>Rezervacijos</h2>
            <h3>Vartotojas: <strong>{userData.user.email}</strong></h3>
            {updateError && <p className="error">{updateError}</p>}

            {allReservations.length ? (
                <ul className="all-reservations">
                    {allReservations.map((reservation) => (
                        <li key={reservation.uniqueKey}>
                            <div className="item-details">
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
                                    <div className="reservation-details">
                                        <p><strong>ID:</strong> {reservation._id}</p>
                                        <p><strong>Rezervacijos pradžia: </strong>
                                            {reservation.rentalPeriod?.from
                                                ? new Date(reservation.rentalPeriod.from).toISOString().split('T')[0]
                                                : "Nežinoma"}
                                        </p>
                                        <p><strong>Rezervacijos pabaiga: </strong>
                                            {reservation.rentalPeriod?.to
                                                ? new Date(reservation.rentalPeriod.to).toISOString().split('T')[0]
                                                : "Nežinoma"}
                                        </p>
                                        <p className="reservation-status">
                                            <strong>Rezervacijos statusas: </strong>
                                            <select
                                                value={reservation.reservationStatus}
                                                onChange={(e) => handleStatusUpdate(reservation._id, e.target.value)}
                                                className={`status-select ${reservation.reservationStatus?.toLowerCase()}`}
                                            >
                                                <option className="laukia" value="Laukia patvirtinimo">Laukia patvirtinimo</option>
                                                <option className="patvirtinta" value="Patvirtinta">Patvirtinta</option>
                                                <option className="atmesta" value="Atmesta">Atmesta</option>
                                            </select>
                                        </p>
                                        <button
                                            onClick={() => navigate(`/reservations/${reservation._id}`)}
                                            className="edit-btn"
                                        >
                                            Keisti rezervacijos laiką
                                        </button>
                                        <button
                                            onClick={() => handleDelete(reservation._id, reservation.item._id)}
                                            className="delete-btn"
                                        >
                                            Ištrinti rezervaciją
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="nerasta">Rezervacijų nerasta.</p>
            )}
        </div>
    );
};

export default ManageReservations;