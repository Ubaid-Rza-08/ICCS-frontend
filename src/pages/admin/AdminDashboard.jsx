import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data));
  }, []);

  const promoteUser = async (email) => {
    try {
      await api.post('/admin/promote', { email });
      toast.success(`Promoted ${email} to Seller`);
      // Refresh list locally
      setUsers(users.map(u => u.email === email ? { ...u, role: 'SELLER' } : u));
    } catch (err) {
      toast.error("Promotion failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Email</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.email} className="text-center">
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.name || u.username}</td>
              <td className="border p-2">
                <span className={`px-2 py-1 rounded text-xs ${u.role === 'SELLER' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                  {u.role || 'CUSTOMER'}
                </span>
              </td>
              <td className="border p-2">
                {u.role !== 'SELLER' && u.role !== 'ADMIN' && (
                  <button onClick={() => promoteUser(u.email)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    Promote to Seller
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default AdminDashboard;