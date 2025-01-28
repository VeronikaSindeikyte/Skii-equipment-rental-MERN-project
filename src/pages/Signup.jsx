import { useState } from "react";
import { useSignup } from "../hooks/useSignup";

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const { signup, error, isLoading } = useSignup();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(email, password, role);
        console.log(email, password, role);
    };

    return (
        <form className="signup" onSubmit={handleSubmit}>
            <h3>Registracija</h3>

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

            <label>Pasirinkite rolę:</label>
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
            >
                <option value="user">Vartotojas</option>
                <option value="admin">Administratorius</option>
            </select>

            <button disabled={isLoading}>Registruotis</button>
            {error && <div className="error">{error}</div>}
        </form>
    );
};

export default Signup;
