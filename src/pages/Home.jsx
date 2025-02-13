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
    const [activeFilters, setActiveFilters] = useState([]);

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

    const handleFilterClick = (filter) => {

        if (filter === 'all') {
            setActiveFilters([]);
            setSearchTerm('');
            return;
        }
        setActiveFilters(prev => {
            if (prev.includes(filter)) {
                return prev.filter(f => f !== filter);
            }
            if (['male', 'female', 'unisex'].includes(filter)) {
                const nonGenderFilters = prev.filter(f => !['male', 'female', 'unisex'].includes(f));
                return [...nonGenderFilters, filter];
            }
            return [...prev, filter];
        });
    };

    const getFilteredIrangos = () => {
        if (!irangos) return [];

        return irangos.filter(iranga => {
            const matchesSearch = iranga.title?.toLowerCase().includes(searchTerm.toLowerCase());

            if (activeFilters.length === 0) {
                return matchesSearch;
            }

            const matchesFilters = activeFilters.every(filter => {
                switch (filter) {
                    case 'male':
                        return iranga.gender?.toLowerCase() === 'male';
                    case 'female':
                        return iranga.gender?.toLowerCase() === 'female';
                    case 'unisex':
                        return iranga.gender?.toLowerCase() === 'unisex';
                    case 'new':
                        return iranga.condition?.toLowerCase() === 'new';
                    case 'available':
                        return iranga.available === true;
                    default:
                        return true;
                }
            });

            return matchesSearch && matchesFilters;
        });
    };

    const filteredIrangos = getFilteredIrangos();

    return (
        <div className="home">
            <div className="iranga">
                <div className="home-welcome">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M253.813 14.47c-132.537 0-240.188 107.65-240.188 240.186 0 132.537 107.65 240.156 240.188 240.156C386.349 494.813 494 387.192 494 254.656S386.35 14.47 253.812 14.47zm0 18.686c122.436 0 221.5 99.064 221.5 221.5 0 17.96-2.133 35.412-6.157 52.125l-44.906-8.686-20.53-71.594-1.376-4.844-4.844-1.5-58.063-17.937-66.906-128.626-4.75-9.156-8.655 5.624-91.094 59.25-2.936 1.907-.97 3.374L116.19 301.97l-70.22 29.436c-8.82-23.91-13.656-49.753-13.656-76.75 0-122.436 99.064-221.5 221.5-221.5zm.812 62.125l-52.53 104.595 16.218 134.438 90.125-61.938v62.97l-23.563 6.25L305.72 470.03c-16.646 3.988-34.03 6.095-51.908 6.095-88.813 0-165.33-52.117-200.656-127.47l74.406-31.217 4.126-1.72 1.25-4.312 48.187-168.28 73.5-47.845z"></path>
                    </svg>
                    <h2>JŪSŲ ATOSTOGOS PRASIDEDA ČIA!</h2>
                    <p>Pasirinkite norimą slidinėjimo įrangą ir išsinuomuokite puikioms ir ekstremalioms atostogoms!</p>
                </div>

                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Ieškoti pagal pavadinimą..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <svg className="search-icon" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.023,16.977c-0.513-0.488-1.004-0.997-1.367-1.384c-0.372-0.378-0.596-0.653-0.596-0.653l-2.8-1.337 C15.34,12.37,16,10.763,16,9c0-3.859-3.14-7-7-7S2,5.141,2,9s3.14,7,7,7c1.763,0,3.37-0.66,4.603-1.739l1.337,2.8 c0,0,0.275,0.224,0.653,0.596c0.387,0.363,0.896,0.854,1.384,1.367c0.494,0.506,0.988,1.012,1.358,1.392 c0.362,0.388,0.604,0.646,0.604,0.646l2.121-2.121c0,0-0.258-0.242-0.646-0.604C20.035,17.965,19.529,17.471,19.023,16.977z M9,14 c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S11.757,14,9,14z"></path>
                        </svg>
                    </div>
                    <div className="categories">
                        <button
                            className={activeFilters.length === 0 && !searchTerm ? 'active' : ''}
                            onClick={() => handleFilterClick('all')}
                        >
                            Visi
                        </button>
                        <button
                            className={activeFilters.includes('male') ? 'active' : ''}
                            onClick={() => handleFilterClick('male')}
                        >
                            Vyrams
                        </button>
                        <button
                            className={activeFilters.includes('female') ? 'active' : ''}
                            onClick={() => handleFilterClick('female')}
                        >
                            Moterims
                        </button>
                        <button
                            className={activeFilters.includes('unisex') ? 'active' : ''}
                            onClick={() => handleFilterClick('unisex')}
                        >
                            Unisex
                        </button>
                        <button
                            className={activeFilters.includes('new') ? 'active' : ''}
                            onClick={() => handleFilterClick('new')}
                        >
                            Nauja
                        </button>
                        <button
                            className={activeFilters.includes('available') ? 'active' : ''}
                            onClick={() => handleFilterClick('available')}
                        >
                            Laisva
                        </button>
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