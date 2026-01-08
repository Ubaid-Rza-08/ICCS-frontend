import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaMagic, FaTimes, FaCheckCircle, FaSpinner, FaImage } from 'react-icons/fa';

const ProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    pName: '', pBrandName: '', pDescription: '', pMrp: '', pSellingPrice: '', pPurchasingPrice: '',
    category: '', subCategory: '', keywords: [], confidence: 0, mode: '', pImages: [] 
  });

  // Changed to an array to allow appending multiple files
  const [newFiles, setNewFiles] = useState([]);

  // Load existing data if editing
  useEffect(() => {
    if (isEditMode && location.state?.product) {
      const p = location.state.product;
      setFormData({
        ...p,
        keywords: p.keywords || [],
        pImages: p.pImages || []
      });
    }
  }, [isEditMode, location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 1. HANDLE FILE SELECTION (APPENDING) ---
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...selectedFiles]); // Append new files
    }
  };

  // --- 2. REMOVE NEW FILE ---
  const removeNewFile = (indexToRemove) => {
    setNewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- 3. AI ANALYSIS & SEARCH HANDLER ---
  const handleAnalyze = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // FIX: Add the analyzed image to the upload queue immediately
    setNewFiles(prev => [...prev, file]);

    setAiLoading(true);
    setSimilarProducts([]);

    const analyzeData = new FormData();
    analyzeData.append('image', file);

    try {
      const { data } = await api.post('/analyze-product', analyzeData);
      const ai = data.product_data;
      
      setFormData(prev => ({
        ...prev,
        pName: ai.title || prev.pName,
        pBrandName: ai.brand || prev.pBrandName,
        pDescription: ai.description || prev.pDescription,
        category: ai.category || prev.category,
        subCategory: ai.sub_category || prev.subCategory,
        keywords: ai.keywords || prev.keywords,
        confidence: ai.confidence,
        mode: ai.mode
      }));

      if (ai.keywords && ai.keywords.length > 0) {
        try {
            const keywordQuery = ai.keywords.join(',');
            const { data: searchResults } = await api.get(`/public/products/search-keywords?keywords=${keywordQuery}`);
            if (searchResults && searchResults.length > 0) {
                setSimilarProducts(searchResults);
                toast.info(`Found ${searchResults.length} similar products!`);
            }
        } catch (searchErr) {
            console.error("Keyword search failed", searchErr);
        }
      }
      toast.success("AI Analysis Complete!");
    } catch (err) {
      toast.error("Analysis failed");
    } finally {
      setAiLoading(false);
    }
  };

  // --- 4. HANDLE SELECTING A SIMILAR PRODUCT ---
  const handleSelectSimilar = (product) => {
      // Safety check: ensure we get an array, even if backend sends null
      const incomingImages = product.pImages || [];

      setFormData(prev => ({
          ...prev,
          pName: product.pName || "",
          pBrandName: product.pBrandName || "",
          pDescription: product.pDescription || "",
          pMrp: product.pMrp || "",
          pSellingPrice: product.pSellingPrice || "",
          // Keep current purchasing price or default to 0 if not present
          pPurchasingPrice: product.pPurchasingPrice || prev.pPurchasingPrice, 
          category: product.category || "",
          subCategory: product.subCategory || "",
          keywords: product.keywords || [],
          // IMPORTANT: Set the existing images from the selected product
          pImages: incomingImages
      }));
      
      toast.success("Form filled from selected product!");
      setSimilarProducts([]); // Clear search results
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    submitData.append('product', JSON.stringify(formData));
    
    // FIX: Append all files from the array
    newFiles.forEach(f => submitData.append('images', f));

    try {
      if (isEditMode) {
        await api.put(`/seller/update/${id}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' }});
        toast.success("Product Updated Successfully!");
      } else {
        await api.post('/seller/create-product', submitData, { headers: { 'Content-Type': 'multipart/form-data' }});
        toast.success("Product Created Successfully!");
      }
      navigate('/seller/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = (imgUrl) => {
    setFormData(prev => ({
      ...prev,
      pImages: prev.pImages.filter(url => url !== imgUrl)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        
        {/* --- AI SECTION --- */}
        <div className="bg-indigo-50 p-5 rounded-xl mb-8 border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                <FaMagic /> AI Auto-Fill & Search
              </h3>
              <p className="text-sm text-indigo-700">Upload an image to auto-detect details and add it to your gallery.</p>
            </div>
            
            {aiLoading ? (
                <div className="flex items-center gap-2 px-4 py-2 text-indigo-700 font-medium">
                    <FaSpinner className="animate-spin" /> Analyzing...
                </div>
            ) : (
                <label className="cursor-pointer bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium border border-indigo-200 hover:bg-indigo-50 transition shadow-sm">
                    Upload & Analyze
                    <input type="file" className="hidden" onChange={handleAnalyze} accept="image/*" />
                </label>
            )}
          </div>

          {/* SIMILAR PRODUCTS RESULTS */}
          {similarProducts.length > 0 && (
             <div className="mt-4 pt-4 border-t border-indigo-200">
                 <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-indigo-800">Found {similarProducts.length} similar products:</h4>
                    <button onClick={() => setSimilarProducts([])} className="text-xs text-gray-500 hover:text-red-500">Dismiss</button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {similarProducts.slice(0, 4).map((prod, idx) => (
                         <div 
                           key={idx} 
                           onClick={() => handleSelectSimilar(prod)}
                           className="bg-white p-2 rounded border border-indigo-100 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition relative group"
                         >
                            <img src={prod.pImages?.[0] || 'https://placehold.co/100'} alt={prod.pName} className="w-full h-24 object-contain rounded mb-2"/>
                            <p className="text-xs font-bold text-gray-800 line-clamp-1">{prod.pName}</p>
                            <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded">
                                <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-1 rounded shadow flex items-center gap-1">
                                    <FaCheckCircle /> Use This
                                </span>
                            </div>
                         </div>
                     ))}
                 </div>
             </div>
          )}
        </div>

        {/* --- MAIN FORM --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input name="pName" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.pName} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input name="pBrandName" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.pBrandName} onChange={handleChange} required />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="pDescription" className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.pDescription} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
              <input type="number" name="pMrp" className="w-full border border-gray-300 rounded-lg p-3" value={formData.pMrp} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
              <input type="number" name="pSellingPrice" className="w-full border border-gray-300 rounded-lg p-3 text-green-700 font-semibold" value={formData.pSellingPrice} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchasing Price</label>
              <input type="number" name="pPurchasingPrice" className="w-full border border-gray-300 rounded-lg p-3 text-gray-500" value={formData.pPurchasingPrice} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
               <input name="category" className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 cursor-not-allowed" value={formData.category} readOnly />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
               <input name="subCategory" className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 cursor-not-allowed" value={formData.subCategory} readOnly />
             </div>
          </div>

          {/* --- IMAGE HANDLING SECTION --- */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
             
             <div className="flex gap-4 mb-4 flex-wrap">
               {/* 1. Existing Images (URLs) */}
               {formData.pImages?.map((img, idx) => (
                 <div key={`old-${idx}`} className="relative w-24 h-24">
                   <img src={img} alt="existing" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                   <button type="button" onClick={() => removeExistingImage(img)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition">
                     <FaTimes size={10} />
                   </button>
                 </div>
               ))}

               {/* 2. New Images (File Previews) */}
               {newFiles.map((file, idx) => (
                 <div key={`new-${idx}`} className="relative w-24 h-24">
                   <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover rounded-lg border-2 border-green-400" />
                   <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[10px] text-center px-1">New</div>
                   <button type="button" onClick={() => removeNewFile(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition">
                     <FaTimes size={10} />
                   </button>
                 </div>
               ))}
               
               {/* 3. Upload Button */}
               <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition text-gray-400 hover:text-indigo-500">
                  <FaCloudUploadAlt size={24} />
                  <span className="text-xs mt-1">Add</span>
                  <input type="file" multiple onChange={handleFileSelect} className="hidden" accept="image/*" />
               </label>
             </div>
             
             <p className="text-xs text-gray-500">
                {formData.pImages.length + newFiles.length} images selected. 
                (Green border indicates new files to be uploaded)
             </p>
          </div>

          <div className="flex gap-4 mt-8">
            <button type="button" onClick={() => navigate('/seller/dashboard')} className="w-1/3 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition">
               Cancel
            </button>
            <button disabled={loading} className="w-2/3 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex justify-center items-center gap-2">
               {loading && <FaSpinner className="animate-spin"/>}
               {loading ? 'Processing...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;