import "./componentsCSS/ChangeIrangaForm.css"
import { useState, useEffect } from "react";
import { useIrangaContext } from "../hooks/useIrangaContext";
import { useAuthContext } from "../hooks/useAuthContext";

const ChangeIrangaForm = () => {
    const { irangos, dispatch } = useIrangaContext();
    const { user } = useAuthContext();

    const [selectedIranga, setSelectedIranga] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rentPricePerDay, setRentPricePerDay] = useState('');
    const [gender, setGender] = useState('unisex');
    const [size, setSize] = useState('');
    const [condition, setCondition] = useState('new');
    const [available, setAvailable] = useState(true);
    const [error, setError] = useState(null);
    const [emptyFields, setEmptyFields] = useState([]);

    useEffect(() => {
        if (selectedIranga) {
            setTitle(selectedIranga.title);
            setDescription(selectedIranga.description);
            setRentPricePerDay(selectedIranga.rentPricePerDay);
            setGender(selectedIranga.gender);
            setSize(selectedIranga.size);
            setCondition(selectedIranga.condition);
            setAvailable(selectedIranga.available);
        }
    }, [selectedIranga]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!user) {
            setError('Būtina prisijungti.');
            return;
        }
    
        if (!selectedIranga) {
            setError('Pasirinkite įrangą, kurią norite redaguoti.');
            return;
        }
    
        const updatedEquipment = {
            title,
            description,
            rentPricePerDay: rentPricePerDay ? Number(rentPricePerDay) : null,
            gender,
            size,
            condition,
            available,
        };
    
        try {
            const response = await fetch(`/api/iranga/${selectedIranga._id}`, {
                method: 'PATCH',
                body: JSON.stringify(updatedEquipment),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });
    
            if (!response.ok) {
                const json = await response.json();
                throw new Error(json.error || 'Nepavyko atnaujinti įrangos.');
            }
    
            const updatedIranga = await response.json();
            
            dispatch({ type: 'UPDATE_IRANGA', payload: updatedIranga });
    
            alert('Įrangos informacija atnaujinta sėkmingai!');
        } catch (err) {
            setError(err.message);
        }
    };

    if (!user || user.role !== 'admin') {
        return <p>Prieiga negalima. Tik administratoriai gali redaguoti įrangą.</p>;
    }

    return (
        <div className="iranga-form-and-list">
            <form className="edit-form" onSubmit={handleSubmit}>
            <h3>Atnaujinti įrangos informaciją:</h3>
                <label>Pasirinkti įrangą:</label>
                <select onChange={(e) => {
                    const selected = irangos.find(i => i._id === e.target.value);
                    setSelectedIranga(selected);
                }}>
                    <option value="">Pasirinkite įrangą </option>
                    {irangos.map(iranga => (
                        <option key={iranga._id} value={iranga._id}>
                            {iranga.title}
                        </option>
                    ))}
                </select>

                {selectedIranga && (
                    <>
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
                        />

                        <label>Būklė:</label>
                        <select
                            onChange={(e) => setCondition(e.target.value)}
                            value={condition}
                        >
                            <option value="new">Nauja</option>
                            <option value="used">Naudota</option>
                            <option value="refurbished">Atnaujinta</option>
                        </select>

                        <div className="checkbox-container">
                            <label className="checkbox-label">Ar įranga laisva nuomai?</label>
                            
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="availability"
                                    value="true"
                                    checked={available === true}
                                    onChange={() => setAvailable(true)}
                                />
                                Taip
                            </label>

                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="availability"
                                    value="false"
                                    checked={available === false}
                                    onChange={() => setAvailable(false)}
                                />
                                Ne
                            </label>
                        </div>

                        <button>Atnaujinti įrangą</button>
                    </>
                )}

                {error && <div className="error">{error}</div>}
            </form>
        </div>
    );
};

export default ChangeIrangaForm;
