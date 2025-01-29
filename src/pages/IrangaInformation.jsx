import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useAuthContext } from "../hooks/useAuthContext";

const IrangaInformation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [iranga, setIranga] = useState(null);
  const [rentalPeriod, setRentalPeriod] = useState([{ startDate: new Date(), endDate: new Date(), key: "selection" }]);
  const { user } = useAuthContext();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIranga = async () => {
      try {
        const response = await fetch(`/api/iranga/${id}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setIranga(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Nepavyko gauti įrangos duomenų.");
      }
    };

    fetchIranga();
  }, [id]);

  const handleReserve = async () => {
    setError(null);
  
    console.log(user.token)
    if (!user.token) {
      setError("Turite būti prisijungęs, kad rezervuotumėte.");
      return;
    }
  
    const toUTC = (date) => {
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      return utcDate.toISOString();
    };
  
    try {
      const response = await fetch(`/api/reservation/reserve`, {
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
  
      alert("Įranga sėkmingai rezervuota!");
      navigate("/");
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
          <h2>{iranga.title}</h2>
          <p><strong>Aprašymas:</strong> {iranga.description}</p>
          <p><strong>Kaina per dieną:</strong> {iranga.rentPricePerDay} €</p>
          <p><strong>Lyčiai:</strong> {iranga.gender || "Nenurodyta"}</p>
          <p><strong>Dydis:</strong> {iranga.size || "Nenurodyta"}</p>
          <p><strong>Būklė:</strong> {iranga.condition || "Nenurodyta"}</p>
          <p><strong>Ar laisva:</strong> {iranga.available ? "Taip" : "Ne"}</p>
        </div>
        <div className="calendar-box">
          <DateRange
            className="calendar"
            editableDateInputs={true}
            moveRangeOnFirstSelection={false}
            ranges={rentalPeriod}
            onChange={(item) => setRentalPeriod([item.selection])}
            minDate={new Date()}
          />
        </div>
      </div>
      <button onClick={handleReserve}>Rezervuoti</button>
      {error && <p className="error">{error}</p>}
      <button onClick={() => navigate("/")}>Grįžti</button>
    </div>
  );
};

export default IrangaInformation;
