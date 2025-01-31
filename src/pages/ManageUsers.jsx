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
        try {
            await axios.delete(`/api/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setUsersData(usersData.filter((u) => u._id !== userId));
        } catch (err) {
            setError("Failed to delete user.");
            console.error(err);
        }
    };

    const handleChangeUserRole = async (userId, newRole) => {
        if (!user?.token) {
            setError("Authentication required.");
            return;
        }
        try {
            await axios.patch(
                `/api/user/${userId}/role`,
                { role: newRole },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            setUsersData(
                usersData.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
            );
        } catch (err) {
            setError("Failed to change user role.");
            console.error(err);
        }
    };

    if (loading) {
        return <p>Loading users...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="manage-all-users">
            <h2>All Users</h2>

            {usersData.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <div className="users-list">
                    {usersData.map((userData) => (
                        <div key={userData._id} className="user-section">
                            <h3>{userData.email}</h3>
                            <p><strong>Role:</strong> {userData.role}</p>
                            <div className="user-actions">
                                <button onClick={() => handleDeleteUser(userData._id)}>
                                    Ištrinti vartotoją
                                </button>
                                <select
                                    value={userData.role}
                                    onChange={(e) => handleChangeUserRole(userData._id, e.target.value)}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button onClick={() => navigate(`/ManageReservations/${userData._id}`)}>
                                    Peržiūrėti vartotojo rezervacijas
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