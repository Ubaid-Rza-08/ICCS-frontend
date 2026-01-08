import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ProductDetails = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("name");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/public/products');
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search) return fetchProducts();

    let endpoint = `/public/products/search?name=${search}`;
    if (searchMode === 'keyword')
      endpoint = `/public/products/search-keywords?keywords=${search}`;
    if (searchMode === 'desc')
      endpoint = `/public/products/search-description?query=${search}`;

    try {
      const { data } = await api.get(endpoint);
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <select
          className="p-2 border rounded"
          value={searchMode}
          onChange={(e) => setSearchMode(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="keyword">Keyword</option>
          <option value="desc">Description</option>
        </select>

        <input
          className="border p-2 flex-1 rounded"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 px-6 py-6">
        {products.map((p, index) => (
          <div
            key={p.pId || index}
            className="border rounded-lg bg-white p-4 flex flex-col transition hover:shadow-md"
          >
            {/* Product Image */}
            <img
              src={p.pImages?.length ? p.pImages[0] : 'https://placehold.co/400'}
              alt={p.pName}
              className="h-48 w-full object-cover rounded-md mb-4"
            />

            {/* Brand */}
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {p.pBrandName}
            </p>

            {/* Name */}
            <h3 className="font-semibold text-lg line-clamp-1 mb-1">
              {p.pName}
            </h3>

            {/* Category */}
            <p className="text-xs text-gray-600 mb-2">
              {p.category} / {p.subCategory}
            </p>

            {/* Description */}
            <p className="text-sm text-gray-700 line-clamp-2 mb-3">
              {p.pDescription}
            </p>

            {/* Pricing */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-600 font-bold text-lg">
                ₹{p.pSellingPrice}
              </span>
              {p.pMrp && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{p.pMrp}
                </span>
              )}
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-1 mb-4">
              {(p.keywords || []).slice(0, 4).map((k, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-200 px-2 py-1 rounded"
                >
                  {k}
                </span>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                const id = p.pId || p.id || p._id || '';
                const path = id ? `/add-product?id=${id}` : '/add-product';
                navigate(path, { state: { prefill: p } });
              }}
              className="mt-auto text-center bg-gray-900 text-white py-2 rounded hover:bg-gray-700 transition"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetails;
