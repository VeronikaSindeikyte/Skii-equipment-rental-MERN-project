import React from 'react';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import './RootLayout.css';

const RootLayout = () => {
    const [email, setEmail] = useState("");

    const handleSubscribe = (e) => {
        e.preventDefault();
        alert(`Subscribed with: ${email}`);
        setEmail("");
    };
    return (
        <div className="root-layout">
            <Navbar />
            <main className='main'>
                <Outlet />
            </main>
            <footer className='footer'>
             <h2>Apie mus</h2>
                <div className='footer-text'>
                    <p>
                        Mes esame įmonė, siekianti suteikti geriausias paslaugas savo klientams.
                        Susisiekite su mumis dėl bet kokių klausimų ar pasiūlymų.
                    </p>
                </div>

                <div className='footer-form'>
                    <h3>Prisijunkite prie mūsų naujienlaiškio: </h3>
                    <form onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            placeholder="Įveskite savo el. paštą"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit">
                            Prenumeruoti
                        </button>
                    </form>
                </div>
                <p>&copy; 2025 Visos teisės saugomos.</p>
            </footer>

        </div>
    );
};

export default RootLayout;