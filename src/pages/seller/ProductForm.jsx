import { useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const ProductForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pName: '', pBrandName: '', pDescription: '', pMrp: '', pSellingPrice: '', pPurchasingPrice: '',
    category: '', subCategory: '', keywords: [], confidence: 0, mode: ''
  });
  const [files, setFiles] = useState([]);

  // 1. AI Analysis Handler
  const handleAnalyze = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const analyzeData = new FormData();
    analyzeData.append('image', file);

    try {
      const { data } = await api.post('/analyze-product', analyzeData);
      const ai = data.product_data;
      
      // Auto-fill form
      setFormData(prev => ({
        ...prev,
        pName: ai.title || '',
        pBrandName: ai.brand || '',
        pDescription: ai.description || '',
        category: ai.category || '',
        subCategory: ai.sub_category || '',
        keywords: ai.keywords || [],
        confidence: ai.confidence,
        mode: ai.mode
      }));
      toast.success("AI Analysis Complete!");
    } catch (err) {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // 2. Create Product Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    submitData.append('product', JSON.stringify(formData));
    Array.from(files).forEach(f => submitData.append('images', f));

    try {
      await api.post('/seller/create-product', submitData, { headers: { 'Content-Type': 'multipart/form-data' }});
      toast.success("Product Created!");
    } catch (err) {
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
      
      {/* AI Analysis Section */}
      <div className="bg-blue-50 p-4 rounded mb-6 border border-blue-200">
        <h3 className="font-semibold mb-2">✨ AI Auto-Fill</h3>
        <p className="text-sm mb-2">Upload an image to auto-detect details.</p>
        <input type="file" onChange={handleAnalyze} accept="image/*" />
        {loading && <span className="text-blue-600 ml-2">Analyzing...</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Name" className="border p-2" value={formData.pName} onChange={e=>setFormData({...formData, pName: e.target.value})} required />
          <input placeholder="Brand" className="border p-2" value={formData.pBrandName} onChange={e=>setFormData({...formData, pBrandName: e.target.value})} required />
        </div>
        
        <textarea placeholder="Description" className="border p-2 w-full h-32" value={formData.pDescription} onChange={e=>setFormData({...formData, pDescription: e.target.value})} />

        <div className="grid grid-cols-3 gap-4">
          <input type="number" placeholder="MRP" className="border p-2" onChange={e=>setFormData({...formData, pMrp: e.target.value})} required />
          <input type="number" placeholder="Selling Price" className="border p-2" onChange={e=>setFormData({...formData, pSellingPrice: e.target.value})} required />
          <input type="number" placeholder="Purchasing Price" className="border p-2" onChange={e=>setFormData({...formData, pPurchasingPrice: e.target.value})} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <input placeholder="Category" className="border p-2" value={formData.category} readOnly />
           <input placeholder="Sub Category" className="border p-2" value={formData.subCategory} readOnly />
        </div>

        <div>
           <label className="block mb-1 font-semibold">Product Images</label>
           <input type="file" multiple onChange={e=>setFiles(e.target.files)} className="w-full" />
        </div>

        <button disabled={loading} className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700">
           {loading ? 'Processing...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};
export default ProductForm;
