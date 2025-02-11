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
    const [currentReservation, setCurrentReservation] = useState(null);
    const [disabledDates, setDisabledDates] = useState([]);
    const [rentalPeriod, setRentalPeriod] = useState([]);
    const { id } = useParams();


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
            const reservationResponse = await fetch(`/api/reservations/user/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            });
    
            if (!reservationResponse.ok) {
                if (reservationResponse.status === 401) {
                    throw new Error("Unauthorized - Please log in again");
                }
                throw new Error("Failed to fetch reservation");
            }
    
            const reservationData = await reservationResponse.json();
            setCurrentReservation(reservationData);

    
        const status = reservationData.reservation.reservationStatus;

        if (status !== "Laukia patvirtinimo") {
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
    
            
            const itemId = reservationData.reservation.item._id;
            const reservationsResponse = await fetch(`/api/iranga/${itemId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
            });
    
            if (!reservationsResponse.ok) throw new Error("Failed to fetch item reservations");
    
            const itemData = await reservationsResponse.json();
            const reservations = itemData.reservations;
    
            const bookedDates = [];
            reservations.forEach((res) => {
                if (res._id === reservationData.reservation._id) return;
    
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

    return (
        <div className="update-reservation">
            <h2>Keisti rezervacijos laiką</h2>
            {updateError && <p className="error">{updateError}</p>}

            {currentReservation ? (
                <div>
                    <div className="reservation-info">
                        <p><strong>Rezervacijos ID:</strong> {currentReservation.reservation.reservationId}</p>
                        <p><strong>Įranga:</strong> {currentReservation.reservation.item.title}</p>
                        <p><strong>Informacija:</strong> Kalendoriuje pasirinkite naują rezervacijos laiką ir spauskite "Išsaugoti pakeitimus".</p>
                        <p><strong>Svarbu:</strong> Rezervacijos laiką galite keisti tik tada, kai ji dar nėra patvirtinta administratoriaus. Jei rezervacija jau patvirtinta, laiko keisti negalite.</p>
                        <p><strong>Rezervacijos statusas:</strong> {currentReservation.reservation.reservationStatus}.</p>
                    </div>

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
                            if (!isBlocked) {
                                setRentalPeriod([item.selection]); 
                            }
                        }}
                        minDate={new Date()}
                        disabledDates={disabledDates}
                        rangeColors={["#2ecc71"]}
                    />

                    <div className="update-reservation-buttons">
                        <button onClick={() => console.log("Updating...")} className="save-btn">
                            Išsaugoti pakeitimus
                        </button>
                        <button onClick={() => navigate("/UserReservations")} className="grizti">Grįžti</button>
                    </div>
                </div>
            ) : (<p>Kraunama...</p>)}
        </div>
    );
};

export default ChangeDate;