import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios'; // Adjust path based on your folder structure
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaBoxOpen } from 'react-icons/fa';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Seller Products
  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      // Calls the /all endpoint from your Java Controller
      const { data } = await api.get('/seller/all');
      setProducts(data);
    } catch (err) {
      toast.error("Failed to load your inventory.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (pId) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      await api.delete(`/seller/delete/${pId}`);
      setProducts(products.filter(p => p.pId !== pId));
      toast.success("Product deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your inventory, prices, and products.</p>
        </div>
        <Link 
          to="/seller/add-product" 
          className="mt-4 md:mt-0 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-md"
        >
          <FaPlus /> Add New Product
        </Link>
      </div>

      {/* Stats (Optional Placeholder) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><FaBoxOpen size={24}/></div>
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            <h3 className="text-2xl font-bold">{products.length}</h3>
          </div>
        </div>
        {/* Add more stats here like Total Sales if available */}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock/Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No products found. Start selling today!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.pId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={product.pImages?.[0] || 'https://placehold.co/100'} 
                          alt={product.pName} 
                          className="w-12 h-12 rounded object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.pName}</p>
                          <p className="text-xs text-gray-500">{product.pBrandName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category} <span className="text-gray-400">/</span> {product.subCategory}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900">₹{product.pSellingPrice}</span>
                        <br />
                        <span className="text-xs text-gray-400 line-through">₹{product.pMrp}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => navigate(`/seller/edit-product/${product.pId}`, { state: { product } })}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.pId)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;