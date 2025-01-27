
export const IrangaReducer = (state, action) => {
    switch (action.type) {
        case 'SET_IRANGA':
            return { irangos: action.payload };
        case 'CREATE_IRANGA':
            return { irangos: [action.payload, ...(state.irangos || [])] };
        case 'DELETE_IRANGA':
            return {
                irangos: state.irangos.filter(
                    (iranga) => iranga._id !== action.payload._id
                ),
            };
        default:
            return state;
    }
};