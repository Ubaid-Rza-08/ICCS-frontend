import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext'; 
import { FaCreditCard } from 'react-icons/fa';

const PaymentButton = ({ 
    productId, 
    productName, 
    description, 
    amount, 
    image, 
    onSuccess, 
    className 
}) => {
    const { user } = useContext(AuthContext); 
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if(document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handlePayment = async () => {
        if (!user) {
            alert("Please login to purchase");
            return;
        }

        setLoading(true);

        try {
            const { data: order } = await api.post('/payment/create-order', {
                amount: amount, 
                productId: productId
            });

            const options = {
                // CHANGED: Use Environment Variable
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                amount: order.amount, 
                currency: "INR",
                name: "ICCS Store", 
                description: description || `Purchase: ${productName}`,
                image: image || "https://placehold.co/150x150?text=Logo",
                order_id: order.id, 
                handler: async function (response) {
                    try {
                        await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        
                        if (onSuccess) onSuccess(response);
                        else alert("Payment Successful!");

                    } catch (error) {
                        alert("Payment Verification Failed");
                        console.error(error);
                    }
                },
                prefill: {
                    name: "User", 
                    email: "",
                    contact: "" 
                },
                theme: {
                    color: "#4F46E5" 
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                alert("Payment Failed: " + response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error("Payment Error:", error);
            alert("Unable to initiate payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handlePayment}
            disabled={loading}
            className={`flex items-center justify-center gap-2 ${className}`}
        >
            {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <>
                    <FaCreditCard /> Buy Now
                </>
            )}
        </button>
    );
};

export default PaymentButton;