import"./componentsCSS/AddIrangaForm.css"
import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useIrangaContext } from "../hooks/useIrangaContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLocation } from 'react-router-dom';
import Drafts from "./Drafts";
import axios from "axios";

const IrangaForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rentPricePerDay, setRentPricePerDay] = useState('');
    const [gender, setGender] = useState('unisex');
    const [size, setSize] = useState('');
    const [condition, setCondition] = useState('new');
    const [available, setAvailable] = useState(true);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [emptyFields, setEmptyFields] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [editingDraftIndex, setEditingDraftIndex] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const { dispatch } = useIrangaContext();
    const { user } = useAuthContext();
    const location = useLocation();
    const draftsRef = useRef(null);

    useEffect(() => {
        const savedDrafts = JSON.parse(localStorage.getItem("drafts")) || [];
        setDrafts(savedDrafts);
        if (location.state?.scrollToDrafts && draftsRef.current) {
            draftsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.state]);

    const handlePhotoUpload = async (e) => {
        const selectedPhoto = e.target.files[0];
        
        if (!selectedPhoto) {
            setError("Please select a file first.");
            return;
        }

        setFile(selectedPhoto);
        setPreview(URL.createObjectURL(selectedPhoto));

        const formData = new FormData();
        formData.append("file", selectedPhoto);
        formData.append("upload_preset", "egzamino-projektas");

        try {
            setUploading(true);
            setError(null);

            const response = await axios.post(
                "https://api.cloudinary.com/v1_1/dgf88vag3/image/upload",
                formData
            );

            console.log("Cloudinary response:", response.data);

            if (response.data.secure_url) {
                setImageUrl(response.data.secure_url);
                console.log("Image URL set to:", response.data.secure_url);
            } else {
                setError("Unexpected server response.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            if (err.response) {
                setError(err.response.data.error || "Failed to upload image.");
            } else if (err.request) {
                setError("No response from the server. Please try again.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Būtina prisijungti.');
            return;
        }
    
        const requiredFields = ['title', 'description', 'rentPricePerDay', 'gender', 'size', 'condition'];
        const missingFields = requiredFields.filter(field => !eval(field));
    
        if (missingFields.length > 0) {
            setError(`Prašome užpildyti visus laukelius: ${missingFields.join(', ')}`);
            setEmptyFields(missingFields);
            return;
        }

        console.log("Current imageUrl before submit:", imageUrl);
    
        const irangaData = {
            title,
            description,
            rentPricePerDay: Number(rentPricePerDay),
            gender,
            size,
            condition,
            available,
            photos: imageUrl ? [imageUrl] : []
        };

        console.log("Submitting data to server:", irangaData);
    
        try {
            setUploading(true);
            const response = await axios.post('/api/iranga', irangaData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            console.log("Server response:", response.data);
            alert('Nauja įranga pridėta sėkmingai!')
    
            if (response.data) {
                if (editingDraftIndex !== null) {
                    handleDeleteDraft(editingDraftIndex);
                }
                resetForm();
                dispatch({ type: 'CREATE_IRANGA', payload: response.data });
            }
        } catch (err) {
            console.error("Error creating equipment:", err);
            console.error("Error response data:", err.response?.data);
            setError(err.response?.data?.error || "Nepavyko pridėti įrangos.");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveDraft = () => {
        if (!user || user.role !== 'admin') return;
        const draft = { 
            title, 
            description, 
            rentPricePerDay, 
            gender, 
            size, 
            condition, 
            available, 
            photos: imageUrl ? [imageUrl] : []
        };

        let updatedDrafts;
        if (editingDraftIndex !== null) {
            updatedDrafts = drafts.map((d, index) => (index === editingDraftIndex ? draft : d));
            setEditingDraftIndex(null);
        } else {
            updatedDrafts = [...drafts, draft];
        }

        setDrafts(updatedDrafts);
        localStorage.setItem("drafts", JSON.stringify(updatedDrafts));
        resetForm();
        alert('Įranga pridėta į juodraščius!')
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
        setImageUrl(draft.photos?.[0] || null);
        setPreview(draft.photos?.[0] || null);
        setEditingDraftIndex(index);
        setError(null);

        const formElement = document.querySelector(".create");
        if (formElement) {
            formElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setRentPricePerDay('');
        setGender('unisex');
        setSize('');
        setCondition('new');
        setAvailable(true);
        setFile(null);
        setPreview(null);
        setImageUrl(null);
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
    
                <label htmlFor="name">Pavadinimas:</label>
                <input
                    id="name"
                    type="text" 
                    onChange={(e) => setTitle(e.target.value)} 
                    value={title} 
                    className={emptyFields.includes('title') ? 'error' : ''} 
                />
    
                <label htmlFor="description">Aprašymas:</label>
                <textarea
                    id="description"
                    onChange={(e) => setDescription(e.target.value)} 
                    value={description}
                    className={emptyFields.includes('description') ? 'error' : ''} 
                />
    
                <label htmlFor="price">Nuomos kaina vienai parai (EUR):</label>
                <input
                    id="price"
                    type="number" 
                    onChange={(e) => setRentPricePerDay(e.target.value)} 
                    value={rentPricePerDay} 
                    className={emptyFields.includes('rentPricePerDay') ? 'error' : ''} 
                />
    
                <label htmlFor="gender">Kam skirta (Lytis):</label>
                <select
                    id="gender"
                    onChange={(e) => setGender(e.target.value)} 
                    value={gender}
                    className={emptyFields.includes('gender') ? 'error' : ''} 
                >
                    <option value="unisex">Unisex</option>
                    <option value="male">Vyrams</option>
                    <option value="female">Moterims</option>
                </select>
    
                <label htmlFor="size">Dydis:</label>
                <input
                    id="size"
                    type="text" 
                    onChange={(e) => setSize(e.target.value)} 
                    value={size} 
                    className={emptyFields.includes('size') ? 'error' : ''} 
                />
    
                <label htmlFor="condition">Būklė:</label>
                <select
                    id="condition"
                    onChange={(e) => setCondition(e.target.value)} 
                    value={condition}
                    className={emptyFields.includes('condition') ? 'error' : ''} 
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
                    className={emptyFields.includes('available') ? 'error' : ''} 
                >
                    <option value="true">Taip</option>
                    <option value="false">Ne</option>
                </select>
    
                <label htmlFor="image">Nuotrauka:</label>
                <input id="image" type="file" accept="image/*" onChange={handlePhotoUpload} />
                {preview && <img src={preview} alt="Peržiūra" className="preview-img" style={{ width: "300px", marginTop: "10px" }} />}
    
                <button type="submit" disabled={uploading}>
                    {uploading ? 'Nuotrauka įkeliama...' : 'Pridėti įrangą'}
                </button>
                <button type="button" onClick={handleSaveDraft}>
                    {editingDraftIndex !== null ? 'Atnaujinti juodraštį' : 'Pridėti į juodraštį'}
                </button>
                {editingDraftIndex !== null && <button type="button" onClick={resetForm}>Atšaukti redagavimą</button>}
    
                {error && <div className="error">{error}</div>}
            </form>
    
            <div ref={draftsRef} className="draft-div">
                <Drafts drafts={drafts} onDelete={handleDeleteDraft} onEdit={handleEditDraft} />
            </div>
        </div>
    );
};

export default IrangaForm;