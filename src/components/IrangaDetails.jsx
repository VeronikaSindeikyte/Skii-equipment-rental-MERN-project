import { useState } from "react";
import { useIrangaContext } from "../hooks/useIrangaContext";
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { useAuthContext } from "../hooks/useAuthContext";

const IrangaDetails = ({ iranga }) => {
    const { dispatch } = useIrangaContext();
    const { user } = useAuthContext();
    const [showDetails, setShowDetails] = useState(false);

    const handleClick = async () => {
        if (!user) {
            console.error("User not authenticated");
            return;
        }
        const response = await fetch('/api/iranga/' + iranga._id, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user.token}` },
        });

        const json = await response.json();

        if (response.ok) {
            dispatch({ type: 'DELETE_IRANGA', payload: json });
        } else {
            console.error("Failed to delete equipment:", json.error);
        }
    };

    return (
        <div className="iranga-details">
            <svg
            className="trashcan"
            onClick={handleClick}
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 16 16"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"></path><path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" clipRule="evenodd"></path></svg>
            <h4>{iranga.title || "Pavadinimas neprieinamas"}</h4>
            <p><strong>Nuomos kaina parai: </strong><span className="kaina">{iranga.rentPricePerDay !== null ? `${iranga.rentPricePerDay} €` : "Nenurodyta"}</span></p>

            <div className="iranga-details-buttons">
                <button onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? "Slėpti informaciją" : "Išsami informacija"}
                </button>

                {showDetails && (
                    <div className="additional-details">
                        <p><strong>Aprašymas:</strong> {iranga.description || "Aprašymas neprieinamas"}</p>
                        <p><strong>Lyčiai:</strong> {iranga.gender || "Nenurodyta"}</p>
                        <p><strong>Dydis:</strong> {iranga.size || "Nenurodyta"}</p>
                        <p><strong>Būklė:</strong> {iranga.condition || "Nenurodyta"}</p>
                        <p><strong>Ar laisva:</strong> {iranga.available ? "Taip" : "Ne"}</p>
                        <p><strong>Pridėta:</strong> {iranga.createdAt ? formatDistanceToNow(new Date(iranga.createdAt), { addSuffix: true }) : "Sukūrimo laikas neprieinamas"}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IrangaDetails;
