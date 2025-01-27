import { useState, useEffect } from "react";
import { useIrangaContext } from "../hooks/useIrangaContext";
import { useAuthContext } from "../hooks/useAuthContext";
import IrangaDetails from "./IrangaDetails";

const IrangaForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rentPricePerDay, setRentPricePerDay] = useState('');
    const [gender, setGender] = useState('unisex');
    const [size, setSize] = useState('');
    const [condition, setCondition] = useState('new');
    const [available, setAvailable] = useState(true);
    const [error, setError] = useState(null);
    const [emptyFields, setEmptyFields] = useState([]);

    const { irangos, dispatch } = useIrangaContext();
    const { user } = useAuthContext();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setError('Butina prisijungti.');
            return;
        }

        const equipment = {
            title,
            description,
            rentPricePerDay: rentPricePerDay ? Number(rentPricePerDay) : null,
            gender,
            size,
            condition,
            available,
        };

        const response = await fetch('/api/iranga', {
            method: 'POST',
            body: JSON.stringify(equipment),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        });

        const json = await response.json();

        if (!response.ok) {
            setError(json.error);
            setEmptyFields(json.emptyFields || []);
        }

        if (response.ok) {
            setEmptyFields([]);
            setTitle('');
            setDescription('');
            setRentPricePerDay('');
            setGender('unisex');
            setSize('');
            setCondition('new');
            setAvailable(true);
            setError(null);

            // Add the new equipment to the top of the list
            dispatch({ type: 'CREATE_IRANGA', payload: json });
        }
    };

    return (
        <div className="iranga-form-and-list">
            <form className="create" onSubmit={handleSubmit}>
                <h3>Pridėti naują įrangą</h3>

                <label>Pavadinimas:</label>
                <input
                    type="text"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    className={emptyFields.includes('title') ? 'error' : ''}
                />

                <label>Aprašymas:</label>
                <textarea
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                ></textarea>

                <label>Nuomos kaina per dieną (EUR):</label>
                <input
                    type="number"
                    onChange={(e) => setRentPricePerDay(e.target.value)}
                    value={rentPricePerDay}
                    className={emptyFields.includes('rentPricePerDay') ? 'error' : ''}
                />

                <label>Lytis:</label>
                <select
                    onChange={(e) => setGender(e.target.value)}
                    value={gender}
                    className={emptyFields.includes('gender') ? 'error' : ''}
                >
                    <option value="male">Vyrams</option>
                    <option value="female">Moterims</option>
                    <option value="unisex">Unisex</option>
                </select>

                <label>Dydis:</label>
                <input
                    type="text"
                    onChange={(e) => setSize(e.target.value)}
                    value={size}
                    className={emptyFields.includes('size') ? 'error' : ''}
                />

                <label>Būklė:</label>
                <select
                    onChange={(e) => setCondition(e.target.value)}
                    value={condition}
                    className={emptyFields.includes('condition') ? 'error' : ''}
                >
                    <option value="new">Nauja</option>
                    <option value="used">Naudota</option>
                    <option value="refurbished">Atnaujinta</option>
                </select>

                <label>Ar prieinama?</label>
                <input
                    type="checkbox"
                    onChange={(e) => setAvailable(e.target.checked)}
                    checked={available}
                />

                <button>Pridėti įrangą</button>

                {error && <div className="error">{error}</div>}
            </form>

            <div className="iranga-list">
                <h3>Įrangos sąrašas</h3>
                {irangos && irangos.length > 0 ? (
                    irangos.map((iranga) => (
                        <IrangaDetails key={iranga._id} iranga={iranga} />
                    ))
                ) : (
                    <p>Įranga neprieinama.</p>
                )}
            </div>
        </div>
    );
};

export default IrangaForm;
