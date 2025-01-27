import { useContext } from "react";
import { IrangaContext } from "../context/IrangaContext";


export const useIrangaContext = () => {
    const context = useContext(IrangaContext)
    if(!context) {
        throw Error ('useIrangaContext turi buti IrangaContextProvider viduje.')
    }
    return context
}