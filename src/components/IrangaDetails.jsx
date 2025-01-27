import { useIrangaContext } from "../hooks/useIrangaContext";
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { useAuthContext } from "../hooks/useAuthContext";

const IrangaDetails = ({ iranga }) => {
    const { dispatch } = useIrangaContext();
    const { user } = useAuthContext();

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

    if (!iranga) {
        return <div>Įranga neprieinama.</div>;
    }

    return (
        <div className="iranga-details">
            <h4>{iranga.title || "Pavadinimas neprieinamas"}</h4>
            <p><strong>Įrangos aprašymas:</strong> {iranga.description || "Aprašymas neprieinamas"}</p>
            <p><strong>Įrangos nuomos kaina vienai dienai:</strong> {iranga.rentPricePerDay !== null ? `${iranga.rentPricePerDay} €` : "Nenurodyta"}</p>
            <p><strong>Kokiai lyčiai yra pritaikyta įranga:</strong> {iranga.gender || "Nenurodyta"}</p>
            <p><strong>Įranga skirta dydžiui:</strong> {iranga.size || "Nenurodyta"}</p>
            <p><strong>Įrangos būklė:</strong> {iranga.condition || "Nenurodyta"}</p>
            <p><strong>Ar įranga šiuo metu yra laisva:</strong> {iranga.available ? "Taip" : "Ne"}</p>
            <p>{iranga.createdAt ? formatDistanceToNow(new Date(iranga.createdAt), { addSuffix: true }) : "Sukūrimo laikas neprieinamas"}</p>
            <span className="material-symbols-outlined" onClick={handleClick} style={{ cursor: 'pointer', color: 'red' }}>delete</span>
        </div>
    );
};

export default IrangaDetails;