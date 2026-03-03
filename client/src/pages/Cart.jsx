import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import API from '../services/api';
import { Trash2, Plus, Minus, CreditCard, Home, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import RecommendationSystem from '../components/RecommendationSystem';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, subtotal, restaurantId, clearCart, addToCart } = useCart();
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Online');
    const [loading, setLoading] = useState(false);
    const [restaurantMenu, setRestaurantMenu] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (restaurantId) {
            API.get(`/restaurants/${restaurantId}`)
                .then(res => setRestaurantMenu(res.data.menu || []))
                .catch(err => console.error(err));
        }
    }, [restaurantId]);

    const recommendations = useMemo(() => {
        if (!restaurantMenu.length || cartItems.length === 0) return [];

        const cartCategories = new Set(cartItems.map(item => item.category?.toLowerCase()));
        const cartItemIds = new Set(cartItems.map(item => item.id));

        const mainCategories = ['main course', 'biryani', 'pizza', 'burger', 'rolls'];
        const hasMain = [...cartCategories].some(cat => mainCategories.includes(cat));

        let targetCategories = [];
        if (hasMain) {
            if (!cartCategories.has('starters') && !cartCategories.has('sides')) {
                targetCategories = ['starters', 'sides'];
            } else if (!cartCategories.has('dessert') && !cartCategories.has('beverages') && !cartCategories.has('beverage')) {
                targetCategories = ['dessert', 'beverages', 'beverage'];
            }
        }

        let recs = [];
        if (targetCategories.length > 0) {
            recs = restaurantMenu.filter(item =>
                targetCategories.includes(item.category?.toLowerCase()) &&
                !cartItemIds.has(item.id)
            );
        }

        if (recs.length === 0) {
            recs = restaurantMenu.filter(item =>
                !cartItemIds.has(item.id) &&
                !mainCategories.includes(item.category?.toLowerCase())
            );
        }
        if (recs.length === 0) {
            recs = restaurantMenu.filter(item => !cartItemIds.has(item.id));
        }

        return recs.slice(0, 2);
    }, [restaurantMenu, cartItems]);

    useEffect(() => {
        if (user) {
            API.get('/users/addresses')
                .then(res => {
                    setAddresses(res.data);
                    const def = res.data.find(a => a.is_default);
                    if (def) setSelectedAddress(def.id);
                })
                .catch(err => console.error(err));
        }
    }, [user]);

    const handlePlaceOrder = async () => {
        if (!user) {
            toast.info("Please login to place your order");
            navigate('/login');
            return;
        }

        if (!selectedAddress) {
            toast.warn("Please select a delivery address");
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                restaurant_id: restaurantId,
                total_amount: finalAmount,
                items: cartItems,
                payment_method: paymentMethod,
                address_id: selectedAddress
            };

            const res = await API.post('/orders/', orderData);

            if (paymentMethod === 'Online') {
                const stripeRes = await API.post('/payments/create-checkout-session', { order_id: res.data.id });
                window.location.href = stripeRes.data.url;
            } else {
                toast.success("Order placed successfully! 🍕");
                clearCart();
                navigate('/orders');
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <img
                    src="https://b.zmtcdn.com/webFrontend/69df31968e7af2c5a04ce481da44a9901596707349.png"
                    alt="Empty Cart"
                    className="w-64 mb-6"
                />
                <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
                <p className="text-gray-500 mt-2 mb-8 italic">Let's find some delicious food for you!</p>
                <button onClick={() => navigate('/')} className="btn-primary">Browse Restaurants</button>
            </div>
        );
    }

    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const handleApplyCoupon = async () => {
        try {
            const res = await API.post('/coupons/validate', { code: couponCode, order_value: subtotal });
            setDiscount(res.data.discount_percent);
            toast.success("Coupon applied!");
        } catch (err) {
            toast.error(err.response?.data?.msg || "Invalid coupon");
        }
    };

    const totalDiscount = (subtotal * discount) / 100;
    const finalAmount = subtotal + 40 + 25.5 - totalDiscount;

    const [globalRecommendations, setGlobalRecommendations] = useState([]);
    useEffect(() => {
        API.get('/restaurants/recommendations')
            .then(res => setGlobalRecommendations(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="px-4 md:px-20 py-10 bg-bg min-h-screen text-dark transition-colors duration-300">
            <h1 className="text-3xl font-black mb-10 text-dark tracking-tight">Secure Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-6">
                    <div className="card p-6 bg-bg shadow-lg border-muted/10">
                        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2 text-dark">
                            <span>Order Summary</span>
                            <span className="text-sm font-normal text-muted">({cartItems.length} items)</span>
                        </h2>
                        <div className="space-y-6">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between group transition-all duration-300">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-3 h-3 border-2 p-0.5 rounded ${item.is_veg ? 'border-green-600' : 'border-red-600'}`}>
                                            <div className={`w-full h-full rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-dark group-hover:text-brand transition-colors">{item.name}</h3>
                                            <p className="text-sm text-muted font-medium">₹{item.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center border border-muted/20 rounded-lg overflow-hidden bg-bg/50 shadow-inner">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 px-3 hover:bg-brand/10 transition-colors text-muted hover:text-brand">
                                                <Minus size={14} />
                                            </button>
                                            <span className="px-4 font-black text-sm text-dark">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 px-3 hover:bg-brand/10 transition-colors text-muted hover:text-brand">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-muted/40 hover:text-brand transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {recommendations.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-muted/10">
                                <h3 className="text-lg font-bold mb-4 text-dark tracking-tight">Complete your meal with</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {recommendations.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 border border-muted/10 rounded-xl bg-bg shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center space-x-3">
                                                <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                                                <div>
                                                    <h4 className="font-bold text-sm text-dark line-clamp-1" title={item.name}>{item.name}</h4>
                                                    <p className="text-xs text-muted font-black">₹{item.price}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addToCart(item, restaurantId)}
                                                className="bg-brand/10 text-brand px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-brand hover:text-white transition-all active:scale-95 shadow-sm"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card p-6 bg-bg shadow-lg border-muted/10">
                        <h2 className="text-xl font-bold mb-6 flex items-center justify-between text-dark">
                            <span>Delivery Address</span>
                            <button
                                onClick={() => navigate('/profile', { state: { tab: 'addresses' } })}
                                className="text-brand text-sm hover:underline font-extrabold"
                            >
                                + Add New
                            </button>
                        </h2>
                        {addresses.length === 0 ? (
                            <div className="text-center py-10 bg-muted/5 rounded-2xl border-2 border-dashed border-muted/10">
                                <MapPin size={40} className="mx-auto text-muted/30 mb-3" />
                                <p className="text-sm text-muted font-medium">No addresses saved yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr.id}
                                        onClick={() => setSelectedAddress(addr.id)}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform ${selectedAddress === addr.id ? 'border-brand bg-brand/5 shadow-md scale-[1.02]' : 'border-muted/10 bg-muted/5 hover:border-brand/30'}`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className={`p-2 rounded-xl transition-colors ${selectedAddress === addr.id ? 'bg-brand text-white' : 'bg-muted/10 text-muted'}`}>
                                                <Home size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-dark text-sm uppercase tracking-wider mb-1">Home</p>
                                                <p className="text-xs text-muted font-medium leading-relaxed">{addr.address_line}, {addr.city}</p>
                                                {addr.is_default && (
                                                    <span className="mt-2 inline-block px-2 py-0.5 bg-brand/10 text-brand text-[10px] font-black rounded uppercase">Default</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full lg:w-96 space-y-6">
                    <div className="card p-6 bg-bg shadow-2xl border-muted/10 sticky top-24 transition-all duration-300">
                        <h2 className="text-xl font-black mb-8 text-dark tracking-tight">Bill Summary</h2>
                        <div className="space-y-5 text-sm">
                            <div className="flex justify-between text-muted font-medium">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted font-medium">
                                <span>Delivery Fee</span>
                                <span className="text-green-500 font-bold uppercase text-xs">₹40.00</span>
                            </div>
                            <div className="flex justify-between text-muted font-medium">
                                <span>Taxes & Service Fee</span>
                                <span>₹25.50</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-brand font-black">
                                    <span>Discount ({discount}%)</span>
                                    <span>-₹{totalDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="my-4 pt-4 border-t border-muted/10">
                                <div className="flex justify-between text-xl font-black text-dark tracking-tight">
                                    <span>Grand Total</span>
                                    <span className="text-brand">₹{finalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 space-y-6">
                            <div className="bg-muted/5 p-4 rounded-2xl border border-muted/10 space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-brand/10 p-2 rounded-xl text-brand transition-colors">
                                        <CreditCard size={18} />
                                    </div>
                                    <span className="text-sm font-black text-dark uppercase tracking-wider">Promo Code</span>
                                </div>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="SAVE50"
                                        className="w-full bg-bg border border-muted/20 rounded-xl px-4 py-2 text-sm text-dark placeholder:text-muted/30 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="bg-dark text-bg px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand transition-all active:scale-95"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-3">
                                <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] px-1 opacity-60">Payment Sequence</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod('Online')}
                                        className={`group py-3 text-xs font-black uppercase tracking-widest rounded-xl border-2 transition-all duration-300 ${paymentMethod === 'Online' ? 'border-brand bg-brand text-white shadow-lg' : 'border-muted/10 text-muted hover:border-brand/30'}`}
                                    >
                                        Online
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`group py-3 text-xs font-black uppercase tracking-widest rounded-xl border-2 transition-all duration-300 ${paymentMethod === 'COD' ? 'border-brand bg-brand text-white shadow-lg' : 'border-muted/10 text-muted hover:border-brand/30'}`}
                                    >
                                        Cash/COD
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-brand text-white py-4 rounded-2xl font-black uppercase tracking-[0.1em] flex items-center justify-center space-x-3 shadow-2xl shadow-brand/20 active:scale-[0.97] transition-all disabled:opacity-75 disabled:cursor-not-allowed group overflow-hidden relative"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                )}
                                <span>Finalize & Place</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-20">
                <RecommendationSystem recommendations={globalRecommendations} title="Your Next Food Discovery" />
            </div>
        </div>
    );
};

export default Cart;
