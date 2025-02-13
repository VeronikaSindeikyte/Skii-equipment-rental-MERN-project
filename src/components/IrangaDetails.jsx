import "./componentsCSS/IrangaDetails.css";
import React from "react";
import { useIrangaContext } from "../hooks/useIrangaContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link, useNavigate } from "react-router-dom";

const IrangaDetails = ({ iranga }) => {
    const { dispatch } = useIrangaContext();
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const handleClick = async (e) => {
        e.stopPropagation();
        window.confirm("Ar tikrai norite ištrinti pasirinktą įrangą?")
        if (!user || user.role !== "admin") {
            console.error("Unauthorized action");
            return;
        }

        const response = await fetch("/api/iranga/" + iranga._id, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${user.token}` },
        });

        const json = await response.json();

        if (response.ok) {
            dispatch({ type: "DELETE_IRANGA", payload: json });
        } else {
            console.error("Failed to delete equipment:", json.error);
        }
    };

    return (
        <div
            className="iranga-details"
            onClick={() => navigate(`/iranga/${iranga._id}`)}
        >
            {user && user.role === "admin" && (
                <svg
                    id="trashcan-icon"
                    className="trashcan"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClick(e);
                    }}
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 16 16"
                    height="1.5em"
                    width="1.5em"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Delete equipment"
                >
                    <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"></path>
                    <path
                        fillRule="evenodd"
                        d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                        clipRule="evenodd"
                    ></path>
                </svg>
            )}

            {iranga.photos && iranga.photos.length > 0 ? (
                <img
                    id="iranga-photo"
                    src={iranga.photos[0]}
                    alt={iranga.title || "Įrangos nuotrauka"}
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
            <div className="iranga-details-buttons">
                <Link to={`/iranga/${iranga._id}`} className="details-button">
                    Rezervuoti
                </Link>
            </div>
            <h4>{iranga.title || "Pavadinimas neprieinamas"}</h4>
            <div className="iranga-content">
                <p>Kaina vienai parai: <span> {iranga.rentPricePerDay} €</span></p>
                <p>Kam skirta:
                    <span>
                        {iranga.gender === "male" ? " Vyrams" :
                        iranga.gender === "female" ? " Moterims" :
                        iranga.gender === "unisex" ? " Unisex" : " Nenurodyta"}
                    </span>
                </p>
                <p>Dydis: <span>{iranga.size || "Nenurodyta"}</span></p>
                <p>Būklė:
                    <span>
                        {iranga.condition === "new" ? " Nauja" :
                        iranga.condition === "used" ? " Naudota" :
                        iranga.condition === "refurbished" ? " Atnaujinta" : " Nenurodyta"}
                    </span>
                </p>
                <p>Ar yra laisvų laikų: <span>{iranga.available ? "Taip" : "Ne"}</span></p>
            </div>
        </div>
    );
};

export default IrangaDetails;
