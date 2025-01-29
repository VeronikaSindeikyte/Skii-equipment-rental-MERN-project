import { useState, useEffect, useRef } from "react";
import { useIrangaContext } from "../hooks/useIrangaContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLocation } from 'react-router-dom';
import Drafts from "./Drafts";

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
    const [drafts, setDrafts] = useState([]);
    const [editingDraftIndex, setEditingDraftIndex] = useState(null);

    const { dispatch } = useIrangaContext();
    const { user } = useAuthContext();
    const location = useLocation();
    const draftsRef = useRef(null);

    useEffect(() => {
        const savedDrafts = JSON.parse(localStorage.getItem("drafts")) || [];
        setDrafts(savedDrafts);

        // Check if we should scroll to drafts
        if (location.state?.scrollToDrafts && draftsRef.current) {
            draftsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Būtina prisijungti.');
            return;
        }

        const equipment = { title, description, rentPricePerDay: rentPricePerDay ? Number(rentPricePerDay) : null, gender, size, condition, available };

        const response = await fetch('/api/iranga', {
            method: 'POST',
            body: JSON.stringify(equipment),
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` }
        });

        const json = await response.json();

        if (!response.ok) {
            setError(json.error);
            setEmptyFields(json.emptyFields || []);
        } else {
            if (editingDraftIndex !== null) {
                handleDeleteDraft(editingDraftIndex);
                setEditingDraftIndex(null);
            }
            resetForm();
            dispatch({ type: 'CREATE_IRANGA', payload: json });
        }
    };

    const handleSaveDraft = () => {
        if (!user || user.role !== 'admin') return;
        const draft = { title, description, rentPricePerDay, gender, size, condition, available };
        
        let updatedDrafts;
        if (editingDraftIndex !== null) {
            updatedDrafts = drafts.map((d, index) => 
                index === editingDraftIndex ? draft : d
            );
            setEditingDraftIndex(null);
        } else {
            updatedDrafts = [...drafts, draft];
        }
        
        setDrafts(updatedDrafts);
        localStorage.setItem("drafts", JSON.stringify(updatedDrafts));
        resetForm();
    };

    const handleDeleteDraft = (index) => {
        const updatedDrafts = drafts.filter((_, i) => i !== index);
        setDrafts(updatedDrafts);
        localStorage.setItem("drafts", JSON.stringify(updatedDrafts));
        if (editingDraftIndex === index) {
            setEditingDraftIndex(null);
            resetForm();
        }
    };

    const handleEditDraft = (index) => {
        const draft = drafts[index];
        setTitle(draft.title || '');
        setDescription(draft.description || '');
        setRentPricePerDay(draft.rentPricePerDay || '');
        setGender(draft.gender || 'unisex');
        setSize(draft.size || '');
        setCondition(draft.condition || 'new');
        setAvailable(draft.available !== undefined ? draft.available : true);
        setEditingDraftIndex(index);
        setError(null);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setRentPricePerDay('');
        setGender('unisex');
        setSize('');
        setCondition('new');
        setAvailable(true);
        setError(null);
        setEditingDraftIndex(null);
    };

    if (!user || user.role !== 'admin') {
        return <p>Prieiga negalima. Tik administratoriai gali pridėti įrangą.</p>;
    }

    return (
        <div className="iranga-form-and-list">
            <form className="create" onSubmit={handleSubmit}>
                <h3>{editingDraftIndex !== null ? 'Redaguoti juodraštį' : 'Pridėti naują įrangą'}</h3>

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

                <button type="submit">
                    {editingDraftIndex !== null ? 'Išsaugoti pakeitimus' : 'Pridėti įrangą'}
                </button>
                <button type="button" onClick={handleSaveDraft}>
                    {editingDraftIndex !== null ? 'Atnaujinti juodraštį' : 'Pridėti į juodraštį'}
                </button>
                {editingDraftIndex !== null && (
                    <button type="button" onClick={resetForm}>Atšaukti redagavimą</button>
                )}

                {error && <div className="error">{error}</div>}
            </form>

            <div ref={draftsRef} className="draft-div">
                <Drafts 
                    drafts={drafts} 
                    onDelete={handleDeleteDraft} 
                    onEdit={handleEditDraft}
                />
            </div>
        </div>
    );
};

export default IrangaForm;