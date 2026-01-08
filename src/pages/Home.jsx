import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("name");

  useEffect(() => {
    fetchProducts();
  }, []);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/public/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search) return fetchProducts();

    let endpoint = `/public/products/search?name=${search}`;
    if (searchMode === "keyword")
      endpoint = `/public/products/search-keywords?keywords=${search}`;
    if (searchMode === "desc")
      endpoint = `/public/products/search-description?query=${search}`;

    try {
      const { data } = await api.get(endpoint);
      setProducts(data);
      if (searchMode === "keyword") setResponses(data);
      else setResponses([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-6">
      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="max-w-screen-xl mx-auto flex gap-2 mb-8 px-6"
      >
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
      <div className="max-w-screen-xl mx-auto px-6">
        {/* Keyword Responses (show first when searching by keyword) */}
        {searchMode === "keyword" && responses.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Responses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {responses.map((r, i) => (
                <div key={r.pId || i} className="border rounded-lg bg-white p-3 flex flex-col">
                  <div className="flex items-start gap-3">
                    <img src={r.pImages?.[0] || 'https://placehold.co/200'} alt={r.pName} className="h-20 w-20 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase">{r.pBrandName}</p>
                      <h3 className="font-medium">{r.pName}</h3>
                      <p className="text-sm text-gray-600">{r.pDescription}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => {
                      const id = r.pId || r.id || r._id || '';
                      const path = id ? `/add-product?id=${id}` : '/add-product';
                      navigate(path, { state: { prefill: r } });
                    }} className="text-center bg-gray-900 text-white py-1 px-3 rounded hover:bg-gray-700">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map((p, index) => (
            <div
              key={p.pId || index}
              className="border rounded-lg bg-white p-4 flex flex-col h-full
              transition duration-300 hover:shadow-xl hover:scale-[1.02]"
            >
              {/* Product Image */}
              <img
                src={
                  p.pImages?.length
                    ? p.pImages[0]
                    : "https://placehold.co/400"
                }
                alt={p.pName}
                className="h-48 w-full object-cover rounded-md mb-4"
              />

              {/* Brand */}
              <p className="text-xs text-gray-500 uppercase">
                {p.pBrandName}
              </p>

              {/* Name */}
              <h3 className="font-semibold text-lg line-clamp-1">
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
                className="mt-auto text-center bg-gray-900 text-white py-2 rounded hover:bg-gray-700"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
