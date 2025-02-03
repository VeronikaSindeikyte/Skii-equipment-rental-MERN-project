import React from 'react';
import { useReducer } from "react";
import PropTypes from "prop-types"; 
import { IrangaContext } from "./IrangaContext";
import { IrangaReducer } from "./IrangaReducer";

export const IrangaContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(IrangaReducer, {
        irangos: null,
    });

    return (
        <IrangaContext.Provider value={{ ...state, dispatch }}>
            {children}
        </IrangaContext.Provider>
    );
}


IrangaContextProvider.propTypes = {
    children: PropTypes.node.isRequired, 
};