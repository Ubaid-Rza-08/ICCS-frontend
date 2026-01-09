import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaStar, FaSpinner, FaUser, FaCheckCircle, FaThumbsUp, FaRegThumbsUp, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [newRating, setNewRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState(0); 
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Sorting State
  const [sortBy, setSortBy] = useState('newest');

  // --- Fetch Reviews ---
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/product/${productId}`);
        setReviews(data);
      } catch (err) {
        // If 403/Redirect happens, user isn't logged in (which is fine for public view now with your security fix)
        // or backend isn't allowing GET.
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchReviews();
  }, [productId]);

  // --- Handle Submit ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newRating === 0) {
        toast.warning("Please select a star rating!");
        return;
    }
    setSubmitting(true);

    const reviewPayload = {
        productId: productId,
        rating: newRating,
        message: newMessage
    };

    try {
      const formData = new FormData();
      formData.append('review', JSON.stringify(reviewPayload));
      
      const { data } = await api.post('/reviews/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setReviews(prev => [data.review, ...prev]); 
      setNewMessage('');
      setNewRating(0);
      toast.success("Review posted successfully!");
    } catch (err) {
      toast.error("Please login to post a review.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Calculations for "Pro" Stats ---
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) 
    : 0;
  
  // Calculate counts for each star (5, 4, 3, 2, 1)
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
      if (starCounts[r.rating] !== undefined) starCounts[r.rating]++;
  });

  // Sort Reviews Logic
  const getSortedReviews = () => {
      const sorted = [...reviews];
      if (sortBy === 'newest') {
          sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } else if (sortBy === 'highest') {
          sorted.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'lowest') {
          sorted.sort((a, b) => a.rating - b.rating);
      }
      return sorted;
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-100 bg-white font-sans">
      
      <h3 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* --- LEFT COLUMN: STATS & REVIEW LIST (Span 8) --- */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Rating Dashboard (The "Pro" feature) */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                {/* Score Circle */}
                <div className="text-center">
                    <div className="text-5xl font-extrabold text-gray-900">{averageRating}</div>
                    <div className="flex text-yellow-400 text-sm justify-center my-2">
                        {[...Array(5)].map((_, i) => (
                             <FaStar key={i} className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"} />
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{totalReviews} Verified Reviews</p>
                </div>

                {/* Progress Bars */}
                <div className="flex-1 w-full max-w-md space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = starCounts[star];
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-3 text-sm">
                                <span className="w-3 font-bold text-gray-600">{star}</span>
                                <FaStar className="text-gray-300 text-xs" />
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-yellow-400 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <span className="w-8 text-right text-gray-400 text-xs">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. Controls (Filter/Sort) */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" /> All Reviews
                </h4>
                <div className="relative">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-indigo-500 transition cursor-pointer">
                        <FaSortAmountDown />
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent outline-none cursor-pointer appearance-none pr-4 font-medium"
                        >
                            <option value="newest">Newest First</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 3. Review List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-indigo-600 text-2xl"/></div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No reviews yet. Share your thoughts!</p>
                    </div>
                ) : (
                    getSortedReviews().map((review, idx) => (
                        <div key={idx} className="flex gap-4 items-start p-4 rounded-xl hover:bg-gray-50 transition duration-200">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {review.userProfileImage ? (
                                    <img src={review.userProfileImage} alt="User" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                        {(review.userName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h5 className="font-bold text-gray-900 text-sm">
                                        {review.userName || 'Shopper'} 
                                        <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-medium">Verified Buyer</span>
                                    </h5>
                                    <span className="text-xs text-gray-400">
                                        {new Date(review.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <div className="flex text-yellow-400 text-xs my-1.5">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-200"} />
                                    ))}
                                </div>

                                <p className="text-gray-700 text-sm leading-relaxed mt-2">{review.message}</p>

                                {/* Images */}
                                {review.imageUrls?.length > 0 && (
                                    <div className="flex gap-2 mt-3">
                                        {review.imageUrls.map((img, i) => (
                                            <img key={i} src={img} alt="Review" className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80" />
                                        ))}
                                    </div>
                                )}

                                {/* Helpful Button */}
                                <div className="mt-3 flex items-center gap-4">
                                    <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 transition">
                                        <FaRegThumbsUp /> Helpful
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* --- RIGHT COLUMN: WRITE REVIEW (Span 4) --- */}
        <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-50/50 border border-indigo-50 sticky top-24">
                <h4 className="text-lg font-bold text-gray-900 mb-6">Write a Review</h4>
                
                <form onSubmit={handleSubmitReview}>
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rating</label>
                        <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star} 
                                    type="button"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onClick={() => setNewRating(star)}
                                    className="focus:outline-none transition-transform active:scale-110"
                                >
                                    <FaStar 
                                        className={`text-3xl transition-colors duration-200 ${
                                            star <= (hoverRating || newRating) ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'
                                        }`} 
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="h-5 mt-1 text-sm font-medium text-indigo-600">
                            {hoverRating === 5 ? "Excellent!" : 
                             hoverRating === 4 ? "Good" : 
                             hoverRating === 3 ? "Average" : 
                             hoverRating === 2 ? "Fair" : 
                             hoverRating === 1 ? "Poor" : ""}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Review</label>
                        <textarea 
                            rows="4"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="w-full p-4 rounded-xl bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-sm resize-none outline-none text-gray-700"
                            placeholder="How was the quality? Did it meet expectations?"
                            required
                        ></textarea>
                    </div>

                    <button 
                        disabled={submitting}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70"
                    >
                        {submitting ? <FaSpinner className="animate-spin" /> : "Submit Review"}
                    </button>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ProductReviews;