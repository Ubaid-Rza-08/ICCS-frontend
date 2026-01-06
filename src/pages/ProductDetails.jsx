import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios'; 
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  // Review Form State
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use a state to track the currently selected main image
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id || id === 'undefined') return;

      try {
        setLoading(true);
        // 1. Fetch Product
        const productRes = await api.get(`/public/products/${id}`);
        setProduct(productRes.data);
        
        // Set initial main image if images exist
        if(productRes.data.pImages && productRes.data.pImages.length > 0) {
            setMainImage(productRes.data.pImages[0]);
        }

        // 2. Fetch Reviews
        try {
            const reviewsRes = await api.get(`/reviews/product/${id}`);
            setReviews(reviewsRes.data);
        } catch (error) {
            // It's okay if there are no reviews yet
            console.log("No reviews found or error loading reviews");
        }
        
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.warning("Please login to review");

    const reviewPayload = JSON.stringify({ productId: id, rating, message });
    const formData = new FormData();
    formData.append('review', reviewPayload);
    for (let i = 0; i < reviewImages.length; i++) {
      formData.append('images', reviewImages[i]);
    }

    try {
      await api.post('/reviews/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Review Added!");
      
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data);
      
      setMessage('');
      setReviewImages([]);
      setRating(5);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add review");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!product) return <div className="p-10 text-center text-red-500">Product not found</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        
        {/* Left: Image Gallery */}
        <div>
           <div className="border rounded-lg overflow-hidden shadow-sm mb-4">
             <img 
               src={mainImage || 'https://placehold.co/400'} 
               alt={product.pName} 
               className="w-full h-96 object-contain bg-gray-50"
             />
           </div>
           
           {/* Thumbnails */}
           {product.pImages && product.pImages.length > 0 && (
             <div className="flex gap-2 overflow-x-auto pb-2">
               {product.pImages.map((img, idx) => (
                 <img 
                   key={idx} 
                   src={img} 
                   alt={`thumb-${idx}`}
                   onClick={() => setMainImage(img)}
                   className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${mainImage === img ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`} 
                 />
               ))}
             </div>
           )}
        </div>
        
        {/* Right: Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{product.pName}</h1>
          <p className="text-xl text-gray-500 mb-4 font-medium">{product.pBrandName}</p>
          
          <div className="text-3xl font-bold text-green-700 mb-6">
            ${product.pSellingPrice} 
            <span className="text-lg text-gray-400 line-through ml-3 font-normal">${product.pMrp}</span>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed text-lg">
            {product.pDescription}
          </p>
          
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
              <h3 className="font-semibold mb-3 text-gray-800 border-b pb-2">Product Details</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <p><span className="font-medium text-gray-600">Category:</span> {product.category}</p>
                <p><span className="font-medium text-gray-600">Sub-Category:</span> {product.subCategory}</p>
                <p><span className="font-medium text-gray-600">Seller Email:</span> {product.sellerEmail}</p>
                {product.confidence > 0 && (
                   <p><span className="font-medium text-gray-600">AI Confidence:</span> {(product.confidence * 100).toFixed(1)}%</p>
                )}
              </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-10">
        <h3 className="text-2xl font-bold mb-8">Customer Reviews ({reviews.length})</h3>
        
        <div className="space-y-6 mb-12">
          {reviews.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded">
                <p className="text-gray-500 text-lg">No reviews yet.</p>
                <p className="text-gray-400">Be the first to share your thoughts!</p>
            </div>
          )}
          
          {reviews.map((rev, index) => (
            <div key={rev.reviewId || index} className="border p-5 rounded-lg bg-white shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <img src={rev.userProfileImage || 'https://placehold.co/40'} alt="user" className="w-12 h-12 rounded-full border" />
                <div>
                   <div className="font-bold text-gray-800">{rev.userName || "Anonymous User"}</div>
                   <div className="text-yellow-400 text-sm tracking-wide">{'★'.repeat(rev.rating || 5)}{'☆'.repeat(5-(rev.rating || 5))}</div>
                </div>
              </div>
              <p className="text-gray-700 mt-2">{rev.message}</p>
              
              {rev.imageUrls && rev.imageUrls.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {rev.imageUrls.map((url, idx) => (
                    <img key={idx} src={url} alt="review-img" className="w-20 h-20 object-cover rounded border hover:scale-105 transition" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Review Form */}
        <div className="max-w-2xl">
        {user ? (
          <form onSubmit={submitReview} className="bg-white p-6 rounded-lg border shadow-md">
            <h4 className="text-xl font-bold mb-6">Write a Review</h4>
            
            <div className="mb-5">
              <label className="block mb-2 font-medium text-gray-700">Rating</label>
              <select 
                value={rating} 
                onChange={(e) => setRating(parseInt(e.target.value))} 
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="5">5 Stars (Excellent)</option>
                <option value="4">4 Stars (Good)</option>
                <option value="3">3 Stars (Average)</option>
                <option value="2">2 Stars (Poor)</option>
                <option value="1">1 Star (Terrible)</option>
              </select>
            </div>

            <div className="mb-5">
               <label className="block mb-2 font-medium text-gray-700">Your Review</label>
               <textarea 
                 placeholder="Share your experience with this product..." 
                 className="w-full p-3 border rounded h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                 value={message}
                 onChange={(e) => setMessage(e.target.value)} 
               />
            </div>

            <div className="mb-6">
               <label className="block mb-2 font-medium text-gray-700">Add Photos (Optional)</label>
               <input 
                 type="file" 
                 multiple 
                 accept="image/*"
                 onChange={(e) => setReviewImages(e.target.files)} 
                 className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
               />
            </div>

            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full md:w-auto">
              Submit Review
            </button>
          </form>
        ) : (
          <div className="bg-blue-50 p-6 rounded-lg text-center text-blue-800 border border-blue-200">
             Please <Link to="/login" className="font-bold underline hover:text-blue-900">login</Link> to write a review.
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;