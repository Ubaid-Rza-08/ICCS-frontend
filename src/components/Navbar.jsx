import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, role, loginGoogle, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">E-Shop</Link>
      
      <div className="flex gap-4 items-center">
        <Link to="/" className="hover:text-gray-300">Home</Link>
        
        {role === 'SELLER' && (
          <>
            <Link to="/seller/dashboard" className="text-green-400">Dashboard</Link>
            <Link to="/seller/add-product" className="text-green-400">Add Product</Link>
          </>
        )}

        {role === 'ADMIN' && (
          <Link to="/admin/dashboard" className="text-red-400">Admin Panel</Link>
        )}

        {user ? (
          <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">Logout</button>
        ) : (
          <button onClick={loginGoogle} className="bg-blue-600 px-3 py-1 rounded">Login with Google</button>
        )}
      </div>
    </nav>
  );
};
export default Navbar;