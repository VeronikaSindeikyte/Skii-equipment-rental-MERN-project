import "./componentsCSS/ChangeIrangaForm.css";
import React from 'react';
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
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (selectedIranga) {
            setTitle(selectedIranga.title);
            setDescription(selectedIranga.description);
            setRentPricePerDay(selectedIranga.rentPricePerDay);
            setGender(selectedIranga.gender);
            setSize(selectedIranga.size);
            setCondition(selectedIranga.condition);
            setAvailable(selectedIranga.available);
            setEmptyFields([]);
            setError(null);
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
        
        const empty = [];
        if (!title.trim()) empty.push('title');
        if (!description.trim()) empty.push('description');
        if (!rentPricePerDay) empty.push('rentPricePerDay');
        if (!size.trim()) empty.push('size');

        if (empty.length > 0) {
            setEmptyFields(empty);
            setError('Prašome užpildyti visus laukelius');
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
            const response = await fetch(`${API_BASE_URL}/api/iranga/${selectedIranga._id}`, {
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
            setEmptyFields([]);
            setError(null);
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
                <label htmlFor="equipment">Pasirinkite įrangą:</label>
                <select
                    id="equipment"
                    onChange={(e) => {
                        const selected = irangos.find(i => i._id === e.target.value);
                        setSelectedIranga(selected);
                    }}
                    value={selectedIranga ? selectedIranga._id : ""}
                >
                    <option value="">Pasirinkite įrangą </option>
                    {irangos.map(iranga => (
                        <option key={iranga._id} value={iranga._id}>
                            {iranga.title}
                        </option>
                    ))}
                </select>

                {selectedIranga && (
                    <>
                        <label htmlFor="title">Pavadinimas:</label>
                        <input
                            id="title"
                            type="text"
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (e.target.value.trim()) {
                                    setEmptyFields(prev => prev.filter(field => field !== 'title'));
                                }
                            }}
                            value={title}
                            className={emptyFields.includes('title') ? 'error' : ''}
                        />

                        <label htmlFor="description">Aprašymas:</label>
                        <textarea
                            id="description"
                            onChange={(e) => {
                                setDescription(e.target.value);
                                if (e.target.value.trim()) {
                                    setEmptyFields(prev => prev.filter(field => field !== 'description'));
                                }
                            }}
                            value={description}
                            className={emptyFields.includes('description') ? 'error' : ''}
                        ></textarea>

                        <label htmlFor="price">Nuomos kaina per dieną (EUR):</label>
                        <input
                            id="price"
                            type="number"
                            onChange={(e) => {
                                setRentPricePerDay(e.target.value);
                                if (e.target.value) {
                                    setEmptyFields(prev => prev.filter(field => field !== 'rentPricePerDay'));
                                }
                            }}
                            value={rentPricePerDay}
                            className={emptyFields.includes('rentPricePerDay') ? 'error' : ''}
                        />

                        <label htmlFor="gender">Lytis:</label>
                        <select
                            id="gender"
                            onChange={(e) => setGender(e.target.value)}
                            value={gender}
                        >
                            <option value="male">Vyrams</option>
                            <option value="female">Moterims</option>
                            <option value="unisex">Unisex</option>
                        </select>

                        <label htmlFor="size">Dydis:</label>
                        <input
                            id="size"
                            type="text"
                            onChange={(e) => {
                                setSize(e.target.value);
                                if (e.target.value.trim()) {
                                    setEmptyFields(prev => prev.filter(field => field !== 'size'));
                                }
                            }}
                            value={size}
                            className={emptyFields.includes('size') ? 'error' : ''}
                        />

                        <label htmlFor="condition">Būklė:</label>
                        <select
                            id="condition"
                            onChange={(e) => setCondition(e.target.value)}
                            value={condition}
                        >
                            <option value="new">Nauja</option>
                            <option value="used">Naudota</option>
                            <option value="refurbished">Atnaujinta</option>
                        </select>

                        <label htmlFor="availabilty">Ar įranga laisva nuomai:</label>
                        <select
                            id="availability"
                            onChange={(e) => setAvailable(e.target.value === 'true')}
                            value={available.toString()}
                        >
                            <option value="true">Taip</option>
                            <option value="false">Ne</option>
                        </select>
                        {error && <div className="error">{error}</div>}
                        <button className="change-iranga-btn" type="submit">Atnaujinti įrangą</button>
                    </>
                )}
            </form>
        </div>
    );
};

export default ChangeIrangaForm;