import "./pagesCSS/Home.css"
import React from 'react';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IrangaDetails from "../components/IrangaDetails";
import { useIrangaContext } from "../hooks/useIrangaContext";
import { useAuthContext } from "../hooks/useAuthContext";


const Home = () => {
    const { irangos, dispatch } = useIrangaContext();
    const { user } = useAuthContext();
    const navigate = useNavigate();

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
                console.log("Fetched irangos:", json);
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

    return (
        <div className="home">
            <div className="iranga">
            <h2>Visos Įrangos Sąrašas:</h2>
            <p>Pasirinkite norimą slidinėjimo įrangą ir išsinuomuokite puikioms ir ekstremalioms atostogoms!</p>
                <div className="all-iranga-list">
                {irangos && irangos.length > 0 ? (
                    irangos.map((iranga) => (
                        <IrangaDetails key={iranga._id} iranga={iranga} />
                    ))
                ) : (
                    <p>Įranga neprieinama.</p>
                )}
                </div>
            </div>
        </div>
    );
};

export default Home;