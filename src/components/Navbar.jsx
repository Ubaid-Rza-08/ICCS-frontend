import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, role, loginGoogle, logout } = useAuth();

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-green-400 font-semibold"
      : "text-white hover:text-green-300";

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-white">
          STARIAL
        </Link>

        {/* Links */}
        <div className="flex gap-6 items-center">
          
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          {role === "SELLER" && (
            <>
              <NavLink to="/seller/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/seller/add-product" className={navLinkClass}>
                Add Product
              </NavLink>
            </>
          )}

          {role === "ADMIN" && (
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              Admin Panel
            </NavLink>
          )}

          {user ? (
            <button
              onClick={logout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={loginGoogle}
              className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
            >
              Login with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
