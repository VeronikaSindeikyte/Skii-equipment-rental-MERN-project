import { useAuthContext } from "./useAuthContext";
import { useIrangaContext } from "./useIrangaContext";

export const useLogout = () => {
    const {dispatch} = useAuthContext()
    const {dispatch: pratimoDispatch} = useIrangaContext()

    const logout = () => {
        // saliname user is localStorage
        localStorage.removeItem('user')

        // naikiname JWT
        dispatch({type: 'LOGOUT'})
        pratimoDispatch({type: 'SET-WORKOUTS', payload: null})
    }
    return {logout}
}