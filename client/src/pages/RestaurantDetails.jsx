import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { Star, MapPin, Clock, Search, Info, Plus, Minus, Heart, Calendar } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { toast } from 'react-toastify';

import Reviews from '../components/Reviews';

const RestaurantDetails = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const { addToCart, cartItems, updateQuantity } = useCart();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await API.get(`/restaurants/${id}`);
                setRestaurant(res.data);

                try {
                    const favsRes = await API.get('/users/favorites');
                    setIsFavorite(favsRes.data.some(f => f.id === parseInt(id)));
                } catch (e) {
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load restaurant details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const toggleFavorite = async () => {
        try {
            if (isFavorite) {
                await API.delete(`/users/favorites/${id}`);
                toast.success("Removed from favorites");
            } else {
                await API.post('/users/favorites', { restaurant_id: id });
                toast.success("Added to favorites ❤️");
            }
            setIsFavorite(!isFavorite);
        } catch (err) {
            toast.error("Please login to manage favorites");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-brand font-bold">Loading Zomathon...</div>;
    if (!restaurant) return <div className="text-center py-20">Restaurant not found.</div>;

    const getItemQuantity = (itemId) => {
        const item = cartItems.find(i => i.id === itemId);
        return item ? item.quantity : 0;
    };

    return (
        <div className="px-4 md:px-20 pb-20 bg-bg text-dark transition-colors duration-300">
            <div className="py-4 text-xs text-muted space-x-2">
                <span>Home</span> / <span>India</span> / <span>Mumbai</span> / <span className="text-muted/60">{restaurant.name}</span>
            </div>

            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h1 className="text-4xl font-bold text-dark mb-2 tracking-tight">{restaurant.name}</h1>
                            <button
                                onClick={toggleFavorite}
                                className={`p-3 rounded-full border transition-all duration-300 ${isFavorite ? 'bg-brand/10 border-brand/20 text-brand shadow-lg' : 'bg-bg border-muted/20 text-muted hover:text-brand'}`}
                            >
                                <Heart fill={isFavorite ? "currentColor" : "none"} size={22} />
                            </button>
                        </div>
                        <p className="text-muted mb-1">{restaurant.cuisine_type}</p>
                        <p className="text-muted/70 text-sm flex items-center space-x-1">
                            <MapPin size={14} /> <span>{restaurant.address}</span>
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-6">
                        <div className="bg-green-700 text-white p-2 rounded-lg text-center flex flex-col items-center shadow-lg">
                            <div className="flex items-center space-x-1 font-bold text-lg">
                                <span>{restaurant.rating}</span>
                                <Star size={16} fill="currentColor" />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-green-100">Delivery</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-6 mt-6 py-4 border-y border-muted/10 overflow-x-auto whitespace-nowrap">
                    <button className="flex items-center space-x-2 bg-brand text-white px-4 py-2 rounded-lg text-sm transition-all hover:shadow-lg active:scale-95">
                        <Star size={18} /> <span>Add Review</span>
                    </button>
                    <button className="flex items-center space-x-2 border border-muted/20 px-4 py-2 rounded-lg text-sm text-muted hover:bg-muted/5 transition-colors">
                        <MapPin size={18} /> <span>Direction</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-dark tracking-tight">Order Online</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search within menu"
                                className="pl-10 pr-4 py-2 bg-muted/5 border border-muted/20 rounded-lg text-sm text-dark placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                        </div>
                    </div>

                    <div className="space-y-10">
                        {restaurant.menu?.map((item) => (
                            <div key={item.id} className="flex items-start justify-between py-6 border-b border-muted/10 last:border-0 group transition-all duration-300">
                                <div className="flex-1 pr-6">
                                    <div className={`w-4 h-4 border-2 p-0.5 mb-2 rounded ${item.is_veg ? 'border-green-600' : 'border-red-600'}`}>
                                        <div className={`w-full h-full rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                    </div>
                                    <h3 className="text-lg font-bold text-dark group-hover:text-brand transition-colors">{item.name}</h3>
                                    <p className="text-sm font-semibold text-muted mt-1">₹{item.price}</p>
                                    <p className="text-xs text-muted/60 mt-3 line-clamp-2 max-w-sm">{item.description}</p>
                                </div>
                                <div className="relative w-32 h-32 ml-4">
                                    <img
                                        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                                        alt={item.name}
                                        className="w-full h-full object-cover rounded-xl shadow-md border border-muted/10"
                                    />
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                        {getItemQuantity(item.id) > 0 ? (
                                            <div className="flex items-center bg-bg shadow-xl border border-brand text-brand rounded-lg overflow-hidden backdrop-blur-sm">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="p-1 px-3 hover:bg-brand/10 transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="px-1 font-black text-sm">{getItemQuantity(item.id)}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="p-1 px-3 hover:bg-brand/10 transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    addToCart(item, restaurant.id);
                                                    toast.success(`${item.name} added to cart!`);
                                                }}
                                                className="bg-bg border border-brand/20 text-brand px-6 py-1 rounded-lg font-bold text-sm shadow-xl hover:bg-brand/5 active:scale-95 transition-all"
                                            >
                                                ADD
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Reviews restaurantId={id} />

                <div className="w-full md:w-80 h-fit sticky top-24 hidden md:block">
                    <div className="card p-6 shadow-xl border-muted/20">
                        <h4 className="font-bold flex items-center space-x-2 text-dark mb-4 uppercase text-xs tracking-widest">
                            <Info size={16} className="text-brand" />
                            <span>Additional Info</span>
                        </h4>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs text-muted uppercase font-black tracking-widest mb-1 opacity-60">Average Cost</p>
                                <p className="text-sm font-semibold opacity-90">₹{restaurant.avg_price} for two people (approx.)</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted uppercase font-black tracking-widest mb-1 opacity-60">Address</p>
                                <p className="text-sm font-semibold opacity-90 leading-relaxed">{restaurant.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetails;
