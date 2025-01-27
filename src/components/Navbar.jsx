import {Link} from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'
import { useAuthContext } from '../hooks/useAuthContext';

const Navbar = () => {
    const {user} = useAuthContext()
    const {logout} = useLogout()
    const handleClick = (e) => {
        logout()
    }
    return ( 
        <header>
            <div className='container'>
                <Link to='/'>
                    <h1>Slidinėjimo įrangos nuoma</h1>
                </Link>
                <nav>
                    {user && (
                        <div>
                            <span>{user.email}</span>
                        <button onClick={handleClick}>Atsijungti</button>
                        </div>
                    )}
                    {!user && (
                         <div>
                         <Link to='/login'>Prisijungti</Link>
                         <Link to='/signup'>Registracija</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar