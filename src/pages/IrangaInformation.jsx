import "./pagesCSS/IrangaInformation.css";
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useAuthContext } from "../hooks/useAuthContext";

const IrangaInformation = () => {
  const { id } = useParams();
  const [iranga, setIranga] = useState(null);
  const [rentalPeriod, setRentalPeriod] = useState([{ 
    startDate: new Date(), 
    endDate: new Date(), 
    key: "selection" }]);
  const { user } = useAuthContext();
  const [error, setError] = useState(null);
  const [disabledDates, setDisabledDates] = useState([]);
  const navigate = useNavigate();


  const fetchIrangaAndReservations = async () => {
    try {
      const irangaResponse = await fetch(`/api/iranga/${id}`);
      if (!irangaResponse.ok) throw new Error("Failed to fetch iranga data");
      const irangaData = await irangaResponse.json();
      setIranga(irangaData);

      // Paimamos visos rezervacijos is DB
      const reservationsResponse = await fetch(`/api/iranga/${id}`);
      if (!reservationsResponse.ok) throw new Error("Failed to fetch reservations");
      const itemData = await reservationsResponse.json();
      const reservations = itemData.reservations;

      // Rezervacijos paverciamos i disabled datas
      const bookedDates = [];
      reservations.forEach(reservation => {
        const start = new Date(reservation.rentalPeriod.from);
        const end = new Date(reservation.rentalPeriod.to);

        const current = new Date(start);
        while (current <= end) {
          bookedDates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      });

      setDisabledDates(bookedDates);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Nepavyko gauti įrangos duomenų.");
    }
  };

  useEffect(() => {
    fetchIrangaAndReservations();
  }, [id]);

  const handleReserve = async () => {
    setError(null);

    if (!user?.token) {
      setError("Turite būti prisijungęs, kad rezervuotumėte.");
      return;
    }

    const toUTC = (date) => {
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      return utcDate.toISOString();
    };

    try {
      const response = await fetch(`/api/iranga/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          itemId: iranga._id,
          rentalPeriod: {
            from: toUTC(rentalPeriod[0].startDate),
            to: toUTC(rentalPeriod[0].endDate),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nepavyko rezervuoti įrangos.");
      }

      setRentalPeriod([{ 
        startDate: new Date(), 
        endDate: new Date(), 
        key: "selection" 
      }]);

      await fetchIrangaAndReservations();

      alert("Įranga sėkmingai rezervuota!");
    } catch (error) {
      setError(error.message);
    }
  };

  if (error) return <p>{error}</p>;
  if (!iranga) return <p>Kraunama...</p>;

  return (
    <div className="reserve-iranga-page">
      <h3>Rezervuoti įrangą</h3>
      <h2>Pasirinkite nuomos laikotarpį:</h2>
      <div className="issami-info-kalendorius">
        <div className="issami-info">
          {iranga.photos && iranga.photos.length > 0 ? (
            <img
              src={iranga.photos[0]}
              alt={iranga.title || "Įrangos nuotrauka"}
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
          <h2>{iranga.title}</h2>
          <p className="aprasymas"><strong>Aprašymas:</strong> {iranga.description}</p>
          
        </div>
        <div className="calendar-box">
          <h2>Rezervuokite įrangą:</h2>
          <p>Pasirinkite sau tinkamą rezervacijos periodą kalendoriuje ir spauskite "Rezervuoti":</p>
          <DateRange
            className="calendar"
            editableDateInputs={true}
            moveRangeOnFirstSelection={false}
            ranges={rentalPeriod}
            onChange={(item) => setRentalPeriod([item.selection])}
            minDate={new Date()}
            disabledDates={disabledDates}
            rangeColors={["#2ecc71"]}
            color="#e74c3c"
          />
        </div>
        <button onClick={handleReserve} className="rezervuoti">Rezervuoti</button>
        {error && <p className="error">{error}</p>}
        <button onClick={() => navigate("/")} className="grizti">Grįžti</button>
      </div>
    </div>
  );
};

export default IrangaInformation;