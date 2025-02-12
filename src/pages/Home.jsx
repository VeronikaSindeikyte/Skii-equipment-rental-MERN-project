import "./pagesCSS/Home.css";
import React, { useState } from 'react';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IrangaDetails from "../components/IrangaDetails";
import { useIrangaContext } from "../hooks/useIrangaContext";
import { useAuthContext } from "../hooks/useAuthContext";

const Home = () => {
    const { irangos, dispatch } = useIrangaContext();
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchIrangas = async () => {
            const response = await fetch('/api/iranga', {
                headers: {
                    'Authorization': user ? `Bearer ${user.token}` : '',
                },
            });

            const json = await response.json();

            if (response.ok) {
                dispatch({ type: 'SET_IRANGA', payload: json });
            } else {
                console.error("Failed to fetch irangos:", json.error);
            }
        };

        fetchIrangas();
    }, [dispatch, user, navigate]);

    if (!user) {
        return null;
    }

    const filteredIrangos = irangos?.filter(iranga => 
        iranga.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="home">
            <div className="iranga">
                <div className="home-welcome">
                    <h2>Visos Įrangos Sąrašas:</h2>
                    <p>Pasirinkite norimą slidinėjimo įrangą ir išsinuomuokite puikioms ir ekstremalioms atostogoms!</p>
                    
                    <div className="search-container">
                        <p>Paieška:</p>
                        <input
                            type="text"
                            placeholder="Ieškoti pagal pavadinimą..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="all-iranga-list">
                    {filteredIrangos && filteredIrangos.length > 0 ? (
                        filteredIrangos.map((iranga) => (
                            <IrangaDetails key={iranga._id} iranga={iranga} />
                        ))
                    ) : (
                        <p>Įranga nerasta.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;