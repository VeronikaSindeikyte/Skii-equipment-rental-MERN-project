import "./pagesCSS/ChangeDate.css";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";


const ChangeDate = () => {
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState("");
    const [currentReservation, setCurrentReservation] = useState(null);
    const [disabledDates, setDisabledDates] = useState([]);
    const [rentalPeriod, setRentalPeriod] = useState([]);
    const { id } = useParams();
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (user && user.token) {
            fetchReservationAndBlockedDates();
        }
    }, [user, id]);

    const fetchReservationAndBlockedDates = async () => {
        if (!user || !user.token) {
            setLoading(false);
            setUpdateError("Please log in to view your reservations.");
            return;
        }

        try {
            console.log("Fetching reservation with ID:", id);

            if (!id) {
                setUpdateError("Reservation ID is missing");
                return;
            }

            const reservationResponse = await fetch(`${API_BASE_URL}/api/reservations/user/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            });

            if (!reservationResponse.ok) {
                const errorData = await reservationResponse.json().catch(() => ({}));
                console.error("Response status:", reservationResponse.status);
                console.error("Error data:", errorData);

                if (reservationResponse.status === 401) {
                    throw new Error("Unauthorized - Please log in again");
                } else if (reservationResponse.status === 404) {
                    throw new Error("Reservation not found");
                }
                throw new Error(`Failed to fetch reservation: ${errorData.error || 'Unknown error'}`);
            }

            const reservationData = await reservationResponse.json();
            console.log("Received reservation data:", reservationData);

            if (!reservationData.reservation) {
                throw new Error("Invalid reservation data received");
            }

            setCurrentReservation(reservationData);

            const status = reservationData.reservation.reservationStatus;

            if (status !== "Laukia patvirtinimo" && user.role !== 'admin') {
                const message = status === "Patvirtinta"
                    ? "Rezervacija jau patvirtinta, todėl jos laiko keisti nebegalite"
                    : "Rezervacija atmesta, todėl jos laiko keisti nebegalite";
                setUpdateError(message);

                const blockedStart = new Date(2000, 0, 1);
                const blockedEnd = new Date(2100, 11, 31);
                const allDates = [];
                const current = new Date(blockedStart);

                while (current <= blockedEnd) {
                    allDates.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                }

                setDisabledDates(allDates);
                return;
            }

            const currentStart = new Date(reservationData.reservation.rentalPeriod.from);
            const currentEnd = new Date(reservationData.reservation.rentalPeriod.to);

            setRentalPeriod([{
                startDate: currentStart,
                endDate: currentEnd,
                key: "selection",
                color: "#2ecc71"
            }]);

            const itemResponse = await fetch(`${API_BASE_URL}/api/iranga`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
            });

            if (!itemResponse.ok) {
                throw new Error("Failed to fetch items");
            }

            const itemsData = await itemResponse.json();

            const item = itemsData.find(item =>
                item.reservations.some(res => res._id === id)
            );

            if (!item) {
                throw new Error("Item not found");
            }

            const bookedDates = [];
            item.reservations.forEach((res) => {
                if (res._id === id) return;

                const start = new Date(res.rentalPeriod.from);
                const end = new Date(res.rentalPeriod.to);

                const current = new Date(start);
                while (current <= end) {
                    if (current < currentStart || current > currentEnd) {
                        bookedDates.push(new Date(current));
                    }
                    current.setDate(current.getDate() + 1);
                }
            });

            setDisabledDates(bookedDates);
        } catch (error) {
            console.error("Error fetching data:", error);
            setUpdateError(error.message);
        }
    };

    const handleUpdateReservation = async () => {

        if (!user || !user.token) {
            console.error("Error: User is not logged in");
            setUpdateError("Please log in to update the reservation.");
            return;
        }

        if (!rentalPeriod || !rentalPeriod[0]?.startDate || !rentalPeriod[0]?.endDate) {
            console.error("Error: No rental period selected");
            setUpdateError("Prašome pasirinkti rezervacijos laikotarpį");
            return;
        }

        const localStartDate = new Date(rentalPeriod[0].startDate);
        localStartDate.setHours(12, 0, 0, 0);
        const localEndDate = new Date(rentalPeriod[0].endDate);
        localEndDate.setHours(12, 0, 0, 0);

        console.log("Sending request to update reservation:", {
            reservationId: id,
            rentalPeriod: { from: localStartDate.toISOString(), to: localEndDate.toISOString() }
        });

        try {
            const response = await fetch(`${API_BASE_URL}/api/reservations/update/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    rentalPeriod: {
                        from: localStartDate.toISOString(),
                        to: localEndDate.toISOString()
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error updating reservation:", errorData);
                throw new Error(errorData.error || 'Failed to update reservation');
            }

            const updatedData = await response.json();
            console.log("Reservation successfully updated:", updatedData);

            setCurrentReservation(prev => ({
                ...prev,
                reservation: {
                    ...prev.reservation,
                    rentalPeriod: updatedData.updatedReservation.rentalPeriod
                }
            }));

            alert("Rezervacijos laikas sėkmingai atnaujintas!");
            setTimeout(() => setUpdateSuccess(""), 3000);
            fetchReservationAndBlockedDates();

        } catch (error) {
            console.error("Fetch request failed:", error);
            setUpdateError(error.message || "Įvyko klaida atnaujinant rezervaciją");
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("lt-LT", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    return (
        <div className="change-date-page">
            <div className="change-date-header">
                <h2>Keisti rezervacijos laiką:</h2>
                {updateError && <p className="error">{updateError}.</p>}
            </div>

            {currentReservation ? (
                <div className="issami-info-kalendorius">
                    <div className="svarbu">
                        <p><strong>Informacija:</strong> Kalendoriuje pasirinkite naują rezervacijos laiką ir spauskite "Išsaugoti pakeitimus".</p>
                        <p><strong>Svarbu:</strong> Rezervacijos laiką galite keisti tik tada, kai ji dar nėra patvirtinta administratoriaus. Jei rezervacija atmesta arba jau patvirtinta, laiko keisti negalite.</p>
                    </div>
                    <div className="issami-info">
                        {currentReservation.reservation.item.photos && currentReservation.reservation.item.photos.length > 0 ? (
                            <img
                                src={currentReservation.reservation.item.photos[0]}
                                alt={currentReservation.reservation.item.title || "Įrangos nuotrauka"}
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
                        <h2>{currentReservation.reservation.item.title}</h2>
                        <p className="aprasymas">{currentReservation.reservation.item.description}</p>
                        <p><strong>Rezervacijos informacija:</strong></p>
                        <div className="rezervacijos-info">
                            <p>
                                Rezervacijos ID: <span>{currentReservation.reservation.reservationId}</span>
                            </p>
                            <p>
                                Rezervacijos pradžia:{" "}
                                <span>{formatDate(currentReservation.reservation.rentalPeriod.from)}</span>
                            </p>
                            <p>
                                Rezervacijos pabaiga:{" "}
                                <span>{formatDate(currentReservation.reservation.rentalPeriod.to)}</span>
                            </p>
                            <p className={
                                currentReservation?.reservation?.reservationStatus === "Patvirtinta" ? "Patvirtinta" :
                                    currentReservation?.reservation?.reservationStatus === "Atmesta" ? "Atmesta" :
                                        currentReservation?.reservation?.reservationStatus === "Laukia patvirtinimo" ? "Laukia" : ""
                            }>
                                Rezervacijos statusas: <span>{currentReservation.reservation.reservationStatus}</span>
                            </p>
                        </div>
                    </div>

                    <div className="calendar-box">
                        <DateRange
                            className="calendar"
                            editableDateInputs={true}
                            moveRangeOnFirstSelection={false}
                            ranges={rentalPeriod}
                            onChange={(item) => {
                                const newStart = item.selection.startDate;
                                const newEnd = item.selection.endDate;
                                const isBlocked = disabledDates.some(
                                    (date) => newStart <= date && date <= newEnd
                                );
                                if (!isBlocked) { setRentalPeriod([item.selection]); }
                            }}
                            minDate={new Date()}
                            disabledDates={disabledDates}
                            rangeColors={["rgba(193, 136, 89, 0.664)"]}
                        />

                        <button
                            className="rezervuoti"
                            onClick={handleUpdateReservation}
                        >
                            Išsaugoti pakeitimus
                        </button>
                    </div>
                    {updateSuccess && (<div>{updateSuccess}</div>)}

                    <button
                        onClick={() => {
                                navigate(user.role === "admin" ? `/ManageReservations/${String(currentReservation.reservation.user)}` : "/UserReservations");
                        }}
                        className="grizti"
                    >
                        Grįžti
                    </button>
                </div>
            ) : (<p>Kraunama...</p>)}
        </div>
    );
};

export default ChangeDate;