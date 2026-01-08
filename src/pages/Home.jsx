import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { FaSearch, FaShoppingCart, FaFilter, FaBoxOpen } from 'react-icons/fa';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("name");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => 
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      ));
    }
  }, [products, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/public/products");
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSelectedCategory("All"); 

    if (!search) {
      fetchProducts();
      return;
    }

    let endpoint = `/public/products/search?name=${search}`;
    if (searchMode === "keyword") endpoint = `/public/products/search-keywords?keywords=${search}`;
    if (searchMode === "desc") endpoint = `/public/products/search-description?query=${search}`;

    try {
      const { data } = await api.get(endpoint);
      setProducts(data);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      
      {/* HERO SECTION */}
      <div className="relative bg-indigo-900 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-700 mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-purple-600 mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-sm">
            Shop the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-300">Future</span>
          </h1>
          <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Explore our curated collection of premium products. Quality you can trust, prices you'll love.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-3xl bg-white rounded-full p-2 flex shadow-2xl transform transition-transform focus-within:scale-105 duration-300">
            <div className="relative hidden md:block">
              <select
                className="h-full bg-gray-50 text-gray-700 pl-4 pr-8 rounded-l-full outline-none border-r border-gray-200 text-sm font-semibold cursor-pointer appearance-none hover:bg-gray-100 transition"
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value)}
              >
                <option value="name">By Name</option>
                <option value="keyword">By Keyword</option>
                <option value="desc">By Desc</option>
              </select>
              <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
            </div>

            <input
              className="flex-1 px-6 text-gray-800 outline-none placeholder-gray-400"
              placeholder="Search for electronics, shoes, styles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2">
              <FaSearch /> <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* FILTER STRIP REMOVED */}

      {/* PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {search ? 'Search Results' : `Latest Collection`}
          </h2>
          <span className="text-sm text-gray-500 font-medium">{filteredProducts.length} items found</span>
        </div>

        {loading ? (
          // LOADING SKELETON
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          // EMPTY STATE
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="inline-block p-6 bg-indigo-50 rounded-full text-indigo-300 mb-4">
              <FaBoxOpen size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No Products Found</h3>
            <button onClick={fetchProducts} className="mt-6 text-indigo-600 font-semibold hover:underline">
              Clear Filters
            </button>
          </div>
        ) : (
          // PRODUCT CARDS
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((p) => (
              <div
                key={p.pId || p.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                onClick={() => navigate(`/product/${p.pId || p.id}`)}
              >
                <div className="relative h-64 bg-white border-b border-gray-50 overflow-hidden flex items-center justify-center">
                  <img
                    src={p.pImages?.length ? p.pImages[0] : "https://placehold.co/400"}
                    alt={p.pName}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 uppercase tracking-wide">
                      {p.category}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {p.pBrandName}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {p.pName}
                  </h3>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {p.pDescription}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium">Price</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-gray-900">
                          ₹{p.pSellingPrice}
                        </span>
                        {p.pMrp && (
                          <span className="text-xs text-gray-400 line-through decoration-gray-300">
                            ₹{p.pMrp}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      className="bg-gray-900 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-600 hover:scale-110 transition-all duration-300"
                      title="View Details"
                    >
                      <FaShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;