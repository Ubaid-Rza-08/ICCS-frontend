import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { FaShoppingCart, FaStar, FaArrowLeft, FaShieldAlt, FaTruck, FaUndo, FaTag } from 'react-icons/fa';

// Import Components
import ProductReviews from '../components/ProductReviews'; 
import PaymentButton from '../components/PaymentButton'; // <--- NEW IMPORT

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      setLoading(true);
      try {
        // 1. Check passed state first
        if (location.state?.prefill) {
          const p = location.state.prefill;
          setProduct(p);
          setSelectedImage(p.pImages?.[0] || '');
          setLoading(false);
          return;
        }

        // 2. Fetch from API
        try {
            const { data } = await api.get(`/public/products/${id}`); 
            setProduct(data);
            setSelectedImage(data.pImages?.[0] || '');
        } catch (e) {
            // Fallback: fetch all and find
            const { data } = await api.get('/public/products');
            const found = data.find(p => (p.pId || p.id) == id);
            if (found) {
                setProduct(found);
                setSelectedImage(found.pImages?.[0] || '');
            }
        }
      } catch (err) {
        console.error("Error loading product", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, location.state]);

  // Handle successful payment
  const handlePaymentSuccess = (response) => {
      console.log("Payment Success:", response);
      alert(`Order Placed Successfully! Payment ID: ${response.razorpay_payment_id}`);
      // You can redirect to an 'Orders' page here if you want
      // navigate('/orders');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Go Home</button>
    </div>
  );

  const displayImages = product.pImages?.length ? product.pImages : ['https://placehold.co/600x600?text=No+Image'];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors group"
        >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT: IMAGES */}
            <div className="flex flex-col gap-4">
                <div className="relative aspect-square w-full bg-white border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center p-6 shadow-sm">
                    <img 
                        src={selectedImage || displayImages[0]} 
                        alt={product.pName} 
                        className="w-full h-full object-contain transition-transform duration-500 hover:scale-105 cursor-zoom-in"
                    />
                </div>
                {displayImages.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {displayImages.map((img, idx) => (
                            <div 
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className={`w-20 h-20 flex-shrink-0 border-2 rounded-lg cursor-pointer overflow-hidden transition-all ${
                                    selectedImage === img ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <img src={img} className="w-full h-full object-contain p-1" alt="thumb" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT: DETAILS */}
            <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">
                        {product.category}
                    </span>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                        {product.pBrandName}
                    </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                    {product.pName}
                </h1>

                {/* Star Rating Section */}
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-6">
                    <div className="flex text-yellow-400 text-sm">
                        {[...Array(4)].map((_,i) => <FaStar key={i} />)}
                        <FaStar className="text-gray-300" />
                    </div>
                    <span className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">
                        (See Reviews)
                    </span>
                </div>

                <div className="mb-6">
                    <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-extrabold text-gray-900">
                            ₹{product.pSellingPrice}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                            ₹{product.pMrp}
                        </span>
                        {product.pMrp && (
                            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                {Math.round(((product.pMrp - product.pSellingPrice) / product.pMrp) * 100)}% OFF
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
                </div>

                {/* QUANTITY AND ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex items-center border border-gray-300 rounded-lg h-12 w-fit">
                        <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-4 text-gray-600 hover:bg-gray-100 h-full font-bold">-</button>
                        <span className="px-4 font-semibold text-gray-900 min-w-[2.5rem] text-center">{qty}</span>
                        <button onClick={() => setQty(q => q+1)} className="px-4 text-gray-600 hover:bg-gray-100 h-full font-bold">+</button>
                    </div>

                    {/* Add to Cart Button */}
                    <button className="flex-1 bg-gray-100 text-gray-900 h-12 rounded-lg font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2 border border-gray-300">
                        <FaShoppingCart /> Add to Cart
                    </button>

                    {/* --- PAYMENT BUTTON COMPONENT --- */}
                    <PaymentButton 
                        productId={product.pId || product.id}
                        productName={product.pName}
                        description={`Purchase of ${product.pName} (x${qty})`}
                        amount={product.pSellingPrice * qty} // Calculate Total Price
                        image={product.pImages?.[0]}
                        onSuccess={handlePaymentSuccess}
                        className="flex-1 bg-indigo-600 text-white h-12 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg"
                    />

                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <FaShieldAlt className="mx-auto text-xl text-gray-400 mb-1" />
                        <p className="text-xs font-semibold text-gray-600">Secure</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <FaTruck className="mx-auto text-xl text-gray-400 mb-1" />
                        <p className="text-xs font-semibold text-gray-600">Fast Delivery</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <FaUndo className="mx-auto text-xl text-gray-400 mb-1" />
                        <p className="text-xs font-semibold text-gray-600">Easy Returns</p>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">About this item</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {product.pDescription}
                    </p>
                </div>

                {/* Keywords/Tags */}
                {product.keywords && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FaTag className="text-gray-400"/> Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {product.keywords.map((k, i) => (
                                <span key={i} className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    #{k}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* --- INJECTED REVIEWS COMPONENT --- */}
        <ProductReviews productId={product.pId || product.id} />

      </div>
    </div>
  );
};

export default ProductDetails;