import { useEffect } from "react";
import IrangaDetails from "../components/IrangaDetails";
import IrangaForm from "../components/AddIrangaForm";
import { useIrangaContext } from "../hooks/useIrangaContext";
import { useAuthContext } from "../hooks/useAuthContext";

const Home = () => {
    const { irangos, dispatch } = useIrangaContext();
    const { user } = useAuthContext();

    useEffect(() => {
        const fetchIrangas = async () => {
            if (!user) return;

            const response = await fetch('http://localhost:4001/api/iranga', {
                headers: { 'Authorization': `Bearer ${user.token}` },
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
    }, [dispatch, user]);

    return (
        <div className="home">
            <div className="iranga">
                {irangos && irangos.length > 0 ? (
                    irangos.map((iranga) => (
                        <IrangaDetails key={iranga._id} iranga={iranga} />
                    ))
                ) : (
                    <p>Įranga neprieinama.</p>
                )}
            </div>
            <IrangaForm />
        </div>
    );
};

export default Home;