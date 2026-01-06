import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedRole = localStorage.getItem('role');
    const savedUid = localStorage.getItem('uid');
    
    if (token && savedRole) {
      setUser({ uid: savedUid });
      setRole(savedRole);
    }
    setLoading(false);
  }, []);

  const loginGoogle = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setRole(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, loginGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);