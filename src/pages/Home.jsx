import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("name");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/public/products');
      console.log("Fetched Products:", data); 
      setProducts(data);
    } catch (err) { console.error(err); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if(!search) return fetchProducts();

    let endpoint = '/public/products/search?name=' + search;
    // Adjust these if your backend endpoints for keywords/desc change
    if(searchMode === 'keyword') endpoint = '/public/products/search-keywords?keywords=' + search;
    if(searchMode === 'desc') endpoint = '/public/products/search-description?query=' + search;

    try {
      const { data } = await api.get(endpoint);
      setProducts(data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <select className="p-2 border rounded" value={searchMode} onChange={e=>setSearchMode(e.target.value)}>
          <option value="name">Name</option>
          <option value="keyword">Keyword</option>
          <option value="desc">Description</option>
        </select>
        
        <input 
          className="border p-2 flex-1 rounded" 
          placeholder="Search..." 
          value={search} 
          onChange={e=>setSearch(e.target.value)} 
        />
        
        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">Search</button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {products.map((p, index) => (
          <div key={p.pId || index} className="border rounded shadow p-4 bg-white hover:shadow-lg transition flex flex-col h-full">
            <img 
              // Backend sends pImages list
              src={p.pImages && p.pImages.length > 0 ? p.pImages[0] : 'https://placehold.co/400'} 
              alt={p.pName} 
              className="h-48 w-full object-cover mb-2 rounded" 
            />
            
            <h3 className="font-bold text-lg mt-2 truncate">{p.pName}</h3>
            <p className="text-green-600 font-bold text-lg">${p.pSellingPrice}</p>
            
            {/* Keywords */}
            <div className="flex flex-wrap gap-1 mt-2 mb-4">
               {(p.keywords || []).slice(0,3).map((k, idx) => (
                 <span key={idx} className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">{k}</span>
               ))}
            </div>

            <div className="mt-auto">
              <Link to={`/product/${p.pId}`} className="block w-full text-center bg-gray-900 text-white py-2 rounded hover:bg-gray-700 transition">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;