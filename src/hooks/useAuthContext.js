import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if(!AuthContext) {
        throw Error('useAuthContext turi buti AuthContextProvider viduje.')
    }
    return context
}