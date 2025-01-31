import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";

const ManageReservations = () => {
    const { user } = useAuthContext();
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateError, setUpdateError] = useState(null);

    useEffect(() => {
        const fetchUserReservations = async () => {
            if (!user || !user.token) {
                setLoading(false);
                setError("Please log in to view reservations.");
                return;
            }

            try {
                const response = await axios.get(`/api/user/reservations/${id}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                setUserData(response.data);
                setError(null);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to fetch reservations.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserReservations();
    }, [user, id]);

    const handleDelete = async (reservationId) => {
        if (!user?.token) {
            setUpdateError("Authentication required.");
            return;
        }

        try {
            await axios.delete(`/api/user/reservations/${reservationId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            setUserData(prevData => ({
                ...prevData,
                user: {
                    ...prevData.user,
                    rentedItems: prevData.user.rentedItems.filter(item => item._id !== reservationId),
                }
            }));

            setUpdateError(null);
        } catch (err) {
            setUpdateError("Failed to delete reservation.");
            console.error(err);
        }
    };

    const handleStatusUpdate = async (reservationId, newStatus) => {
        if (!user?.token) {
            setUpdateError("Authentication required.");
            return;
        }

        try {
            await axios.patch(
                `/api/user/reservations/${reservationId}`,
                { reservationStatus: newStatus },
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );

            const updatedData = await axios.get(`/api/user/reservations/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setUserData(updatedData.data);
            setUpdateError(null);
        } catch (err) {
            setUpdateError("Failed to update reservation status.");
            console.error(err);
        }
    };

    const handleTimeChange = async (reservationId) => {
        if (!user?.token) {
            setUpdateError("Authentication required.");
            return;
        }

        const newFrom = prompt("Enter new start date (YYYY-MM-DD):");
        const newTo = prompt("Enter new end date (YYYY-MM-DD):");

        if (newFrom && newTo) {
            try {
                await axios.patch(
                    `/api/user/reservations/${reservationId}`,
                    { rentalPeriod: { from: newFrom, to: newTo } },
                    {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }
                );

                const updatedData = await axios.get(`/api/user/reservations/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setUserData(updatedData.data);
                setUpdateError(null);
            } catch (err) {
                setUpdateError("Failed to change reservation time.");
                console.error(err);
            }
        }
    };

    if (loading) return <p>Loading reservations...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!userData || !userData.user) {
        return <p>Loading user data...</p>;
    }

    return (
        <div className="user-reservations">
            <h2>{userData.user.email} rezervacijos</h2>
            {userData?.user?.rentedItems?.length ? (
                <ul>
                    {userData.user.rentedItems.map((rentedItem) => {
                        const item = rentedItem.item;

                        console.log('User ID:', userData.user._id);

                        const reservation = item && item.reservations
                            ? item.reservations.find(res => {
                                console.log("Reservation user._id:", res.user);
                                console.log("Current user._id:", userData.user._id);
                                return res.user && userData.user._id && res.user.toString() === userData.user._id.toString();
                            })
                            : null;

                        console.log('Reservation:', reservation);
                        const rentalPeriod = reservation?.rentalPeriod;
                        console.log('Rental Period:', rentalPeriod); 

                        return (
                            <li key={rentedItem._id}>
                                <div className="item-details">
                                    {item?.photos?.length > 0 ? (
                                        <img
                                            src={item.photos[0]}
                                            alt={item.title || "Item photo"}
                                            className="iranga-photo"
                                        />
                                    ) : (
                                        <div className="iranga-photo-placeholder">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                width="48"
                                                height="48"
                                                fill="gray"
                                            >
                                                <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 5h14v10.09l-2.5-2.5a1 1 0 0 0-1.42 0L11 16l-2.09-2.09a1 1 0 0 0-1.42 0L5 16.5zm0 14v-.59l3.5-3.5 2.09 2.09a1 1 0 0 0 1.42 0L15 14.5l3.5 3.5V19z" />
                                                <circle cx="8" cy="8" r="2" />
                                            </svg>
                                        </div>
                                    )}
                                    <h3>{item?.title || "Nežinomas pavadinimas"}</h3>
                                    <p><strong>Aprašymas:</strong> {item?.description || "Nėra aprašymo"}</p>
                                    <p><strong>Nuomos kaina per dieną:</strong> {item?.rentPricePerDay ? `${item.rentPricePerDay}€` : "Nenurodyta"}</p>
                                    <p><strong>Dydis:</strong> {item?.size || "Nenurodyta"}</p>
                                    <p><strong>Būklė:</strong> {item?.condition || "Nenurodyta"}</p>
                                    <p><strong>Nuomos periodas:</strong>
                                        {rentalPeriod && rentalPeriod.from && rentalPeriod.to
                                            ? `${new Date(rentalPeriod.from).toLocaleDateString()} - ${new Date(rentalPeriod.to).toLocaleDateString()}`
                                            : "Nežinomas laikotarpis"
                                        }
                                    </p>
                                </div>
                                <div className="reservation-actions">
                                    <button onClick={() => handleDelete(rentedItem._id)} className="delete-btn">
                                        Ištrinti rezervaciją
                                    </button>
                                    <button onClick={() => handleStatusUpdate(rentedItem._id, 'Patvirtinta')} className="status-btn">
                                        Patvirtinti
                                    </button>
                                    <button onClick={() => handleStatusUpdate(rentedItem._id, 'Atmesta')} className="status-btn">
                                        Atmesti
                                    </button>
                                    <button onClick={() => handleTimeChange(rentedItem._id)} className="time-change-btn">
                                        Keisti nuomos laiką
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>No reservations found.</p>
            )}
        </div>
    );

};

export default ManageReservations;
