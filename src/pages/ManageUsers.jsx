import "./pagesCSS/manageUsers.css"
import React from 'react';
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
    const { user } = useAuthContext();
    const [usersData, setUsersData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllUsers = async () => {
            if (!user || !user.token) {
                setLoading(false);
                setError("Please log in to view users.");
                return;
            }

            try {
                const response = await axios.get("/api/user/users", {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                setUsersData(response.data);
                setError(null);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to fetch users.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllUsers();
    }, [user]);

    const handleDeleteUser = async (userId) => {
        if (!user?.token) {
            setError("Authentication required.");
            return;
        }

        const isConfirmed = window.confirm("Ar tikrai norite ištrinti šį vartotoją?");
        if (!isConfirmed) {
            return;
        }

        try {
            await axios.delete(`/api/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setUsersData((prevUsers) => prevUsers.filter((u) => u._id !== userId));
            alert('Vartotojas ištrintas sėkmingai!')
        } catch (err) {
            setError("Nepavyko ištrinti vartotojo. Bandykite dar kartą.");
            console.error(err);
        }
    };
    
    const handleChangeUserRole = async (userId, newRole) => {
        if (!user?.token) {
            setError("Authentication required.");
            return;
        }
        try {
            const response = await axios.patch(
                `/api/user/${userId}`,
                { role: newRole },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            setUsersData((prevUsers) =>
                prevUsers.map((u) => (u._id === userId ? { ...u, role: response.data.user.role } : u))
            );
            alert('Vartotojo rolė sėkmingai pakeista!')
        } catch (err) {
            setError("Nepavyko pakeisti vartotojo rolės. Bandykite dar kartą.");
            console.error(err);
        }
    };
    

    if (loading) {
        return <p className="ieskoma">Kraunama vartotojų informacija...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="manage-all-users">
            <h2>Vartotojų sąrašas:</h2>

            {usersData.length === 0 ? (
                <p>Vartotojų nerasta.</p>
            ) : (
                <div className="users-list">
                    {usersData.map((userData) => (
                        <div key={userData._id} className="user-section">
                            <h3>Vartotojas: <strong>{userData.email}</strong></h3>
                            <p>Rolė: <strong> {userData.role}</strong></p>
                            <div className="user-actions">
                                <div className="change-role">
                                <label htmlFor="select">Keisti vartotojo rolę: </label>
                                <select
                                    value={userData.role}
                                    onChange={(e) => handleChangeUserRole(userData._id, e.target.value)}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                                </div>
                                <button className="check-reservation-btn" onClick={() => navigate(`/ManageReservations/${userData._id}`)}>
                                    Peržiūrėti rezervacijas
                                </button>
                                <button className="delete-user-btn" onClick={() => handleDeleteUser(userData._id)}>
                                    Ištrinti vartotoją
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageUsers;