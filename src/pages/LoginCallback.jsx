import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // Optional: Use this if you need to update context immediately

const LoginCallback = () => {
  const navigate = useNavigate();
  const processedRef = useRef(false); // Prevents running twice in React Strict Mode

  useEffect(() => {
    // 1. Prevent double execution
    if (processedRef.current) return;
    processedRef.current = true;

    // 2. Parse Parameters from URL
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const uid = params.get('uid');
    const role = params.get('role');

    // 3. Validate & Save to Local Storage
    if (accessToken && refreshToken && uid) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('uid', uid);
      localStorage.setItem('role', role || 'CUSTOMER');

      toast.success(`Login Successful! Welcome, ${role || 'Customer'}`);

      // 4. Redirect based on Role
      // We use window.location.href instead of navigate() to ensure the AuthContext 
      // completely reloads and picks up the new token from localStorage.
      if (role === 'SELLER') {
        window.location.href = '/seller/add-product';
      } else if (role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/';
      }
    } else {
      toast.error('Login Failed: Missing tokens in URL');
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Processing Login...</h2>
      <p className="text-gray-500 text-sm mt-2">Please wait while we redirect you.</p>
    </div>
  );
};

export default LoginCallback;