import React from 'react';

const ProductModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">{product.pName || product.name}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">Close</button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex gap-4">
            <img src={product.pImages?.[0] || 'https://placehold.co/300'} alt={product.pName} className="w-36 h-36 object-cover rounded" />
            <div className="flex-1">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.pDescription || product.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500">MRP</label>
              <input readOnly value={product.pMrp || product.mrp || ''} className="w-full border p-2 mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Selling Price</label>
              <input readOnly value={product.pSellingPrice || product.sellingPrice || product.price || ''} className="w-full border p-2 mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Purchasing Price</label>
              <input readOnly value={product.pPurchasingPrice || product.purchasingPrice || ''} className="w-full border p-2 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Category</label>
              <input readOnly value={product.category || ''} className="w-full border p-2 mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Sub Category</label>
              <input readOnly value={product.subCategory || product.sub_category || ''} className="w-full border p-2 mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Keywords (comma separated)</label>
            <input readOnly value={(product.keywords || []).join(', ')} className="w-full border p-2 mt-1" />
          </div>
        </div>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
