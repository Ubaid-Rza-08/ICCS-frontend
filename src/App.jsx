import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginCallback from './pages/LoginCallback'; // (Code provided in previous answer)
import ProductForm from './pages/seller/ProductForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductDetails from './pages/ProductDetails';

// Role Guard Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (roles && !roles.includes(role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<LoginCallback />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            {/* Public prefill route so responses can open the add-product form with data */}
            <Route path="/add-product" element={<ProductForm />} />
            
            {/* Seller Routes */}
            <Route path="/seller/add-product" element={
              <ProtectedRoute roles={['SELLER']}> <ProductForm /> </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['ADMIN']}> <AdminDashboard /> </ProtectedRoute>
            } />
          </Routes>
        </div>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
