import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminDashboard from './pages/admin/AdminDashboard';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginCallback from './pages/LoginCallback'; 
import ProductForm from './pages/seller/ProductForm';
import SellerDashboard from './pages/seller/SellerDashboard'; // NEW COMPONENT
import ProductDetails from './pages/ProductDetails';
import SessionExpiredPopup from './components/SessionExpiredPopup';

// Role Guard Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (roles && !roles.includes(role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
    <SessionExpiredPopup />
      <AuthProvider>
        <Navbar />
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<LoginCallback />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={
              <ProtectedRoute roles={['SELLER']}> <SellerDashboard /> </ProtectedRoute>
            } />
            <Route path="/seller/add-product" element={
              <ProtectedRoute roles={['SELLER']}> <ProductForm /> </ProtectedRoute>
            } />
            {/* Reuse ProductForm for Editing */}
            <Route path="/seller/edit-product/:id" element={
              <ProtectedRoute roles={['SELLER']}> <ProductForm /> </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['ADMIN']}> <AdminDashboard /> </ProtectedRoute>
            } />
          </Routes>

        </div>
        <ToastContainer position="bottom-right" theme="colored" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

 
