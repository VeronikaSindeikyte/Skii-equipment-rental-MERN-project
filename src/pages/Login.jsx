import React from 'react';
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import "./pagesCSS/login-signup.css";
import { useAuthContext } from '../hooks/useAuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading } = useLogin();
    const { user } = useAuthContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };
    return (
        <div className='login-page'>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path d="M253.813 14.47c-132.537 0-240.188 107.65-240.188 240.186 0 132.537 107.65 240.156 240.188 240.156C386.349 494.813 494 387.192 494 254.656S386.35 14.47 253.812 14.47zm0 18.686c122.436 0 221.5 99.064 221.5 221.5 0 17.96-2.133 35.412-6.157 52.125l-44.906-8.686-20.53-71.594-1.376-4.844-4.844-1.5-58.063-17.937-66.906-128.626-4.75-9.156-8.655 5.624-91.094 59.25-2.936 1.907-.97 3.374L116.19 301.97l-70.22 29.436c-8.82-23.91-13.656-49.753-13.656-76.75 0-122.436 99.064-221.5 221.5-221.5zm.812 62.125l-52.53 104.595 16.218 134.438 90.125-61.938v62.97l-23.563 6.25L305.72 470.03c-16.646 3.988-34.03 6.095-51.908 6.095-88.813 0-165.33-52.117-200.656-127.47l74.406-31.217 4.126-1.72 1.25-4.312 48.187-168.28 73.5-47.845z"></path>
            </svg>
            <h1>SLIDINĖJIMO ĮRANGOS NUOMA</h1>
            <nav>
                {!user && (
                    <div className='navbar-links'>
                        <Link to='/login' className='link-login'>Prisijungti</Link>
                        <Link to='/signup' className='link-signup'>Registracija</Link>
                    </div>
                )}
            </nav>
            <form className="login" onSubmit={handleSubmit}>
                <h3>Prisijungimas</h3>
                <label>El. paštas:</label>
                <input
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                />
                <label>Slaptažodis:</label>
                <input
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                />
                <button disabled={isLoading}>Prisijungti</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    );
};

export default Login;