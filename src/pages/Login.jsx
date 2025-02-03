import React from 'react';
import { useState } from "react"
import { useLogin } from "../hooks/useLogin";
import "./pagesCSS/login-signup.css"

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {login, error, isLoading} = useLogin()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await login(email, password)
        console.log(email, password)
    }
    return ( 
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
    );
}
 
export default Login;