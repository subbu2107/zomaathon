import { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import RecommendationSystem from '../components/RecommendationSystem';
import { Star, Filter, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [restaurants, setRestaurants] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [feed, setFeed] = useState({ new_restaurants: [], new_items: [] });
    const [loading, setLoading] = useState(true);
    const [userLoc, setUserLoc] = useState(null);
    const restaurantListRef = useRef(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn("Geolocation denied or failed", err)
            );
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const searchParams = new URLSearchParams(location.search);
                const search = searchParams.get('search') || '';
                const rating = searchParams.get('rating') || '';
                const price = searchParams.get('price') || '';
                const cuisine = searchParams.get('cuisine') || '';

                const query = new URLSearchParams({ search, rating, price, cuisine }).toString();
                const recQuery = userLoc ? `?lat=${userLoc.lat}&lng=${userLoc.lng}` : '';

                const [resRest, resRec, resFeed] = await Promise.all([
                    API.get(`/restaurants/?${query}`),
                    API.get(`/restaurants/recommendations${recQuery}`),
                    API.get('/restaurants/feed')
                ]);
                setRestaurants(resRest.data);
                setRecommendations(resRec.data);
                setFeed(resFeed.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [location.search, userLoc]);

    const categories = [
        { name: 'Pizza', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
        { name: 'Burger', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
        { name: 'Thali', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
        { name: 'Biryani', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400' },
        { name: 'Rolls', img: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80' },
        { name: 'Cake', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' }
    ];

    return (
        <div className="px-4 md:px-20 py-8 bg-bg text-dark transition-colors duration-300">
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-dark tracking-tight">Eat what inspires you</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                    {categories.map((cat, idx) => (
                        <div
                            key={idx}
                            onClick={() => {
                                navigate(`/?cuisine=${cat.name}`);
                                setTimeout(() => restaurantListRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                            }}
                            className="flex flex-col items-center cursor-pointer group"
                        >
                            <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden mb-2 bg-muted/10 shadow-md border border-muted/20 group-hover:shadow-xl group-hover:border-brand/40 transition-all duration-300 group-hover:scale-105">
                                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium text-dark/70 group-hover:text-brand transition-colors tracking-tight">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="flex items-center space-x-4 mb-10 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center space-x-2 border border-brand px-4 py-1.5 rounded-lg text-brand hover:bg-brand/5 transition-colors"
                >
                    <SlidersHorizontal size={18} />
                    <span>All</span>
                </button>
                <div className="flex items-center space-x-3">
                    <span
                        onClick={() => navigate('/?rating=4.0')}
                        className="px-4 py-1.5 rounded-lg border border-muted/20 font-medium text-muted cursor-pointer hover:bg-muted/5 whitespace-nowrap"
                    >
                        Rating: 4.0+
                    </span>
                    <span
                        onClick={() => navigate('/?price=300')}
                        className="px-4 py-1.5 rounded-lg border border-muted/20 font-medium text-muted cursor-pointer hover:bg-muted/5 whitespace-nowrap"
                    >
                        Under ₹300
                    </span>
                    <span
                        onClick={() => navigate('/?cuisine=Biryani')}
                        className="px-4 py-1.5 rounded-lg border border-muted/20 font-medium text-muted cursor-pointer hover:bg-muted/5 whitespace-nowrap"
                    >
                        Biryani
                    </span>
                </div>
            </section>

            <RecommendationSystem recommendations={recommendations} />

            {feed.new_items.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-dark flex items-center space-x-2">
                        <span className="bg-orange-500/10 p-2 rounded-full text-orange-600">✨</span>
                        <span>New in the Kitchen</span>
                    </h2>
                    <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-none">
                        {feed.new_items.map((item) => (
                            <div key={item.id}
                                onClick={() => navigate(`/restaurant/${item.restaurant_id}`)}
                                className="min-w-[280px] bg-bg rounded-3xl p-4 border border-muted/10 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                            >
                                <div className="h-40 rounded-2xl overflow-hidden mb-4 relative">
                                    <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-2 right-2 bg-brand text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Just Added</div>
                                </div>
                                <h3 className="font-black text-dark group-hover:text-brand transition-colors truncate">{item.name}</h3>
                                <p className="text-xs text-muted font-bold truncate mb-2">{item.description}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-brand font-black">₹{item.price}</span>
                                    <span className="text-[10px] font-black uppercase text-muted tracking-widest bg-muted/5 px-2 py-1 rounded-lg">View Details</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-dark flex items-center space-x-2">
                    <span className="bg-brand/10 p-2 rounded-full text-brand">🔥</span>
                    <span>Trending Restaurants</span>
                </h2>
                <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-none">
                    {restaurants.slice(0, 4).map((res) => (
                        <div key={res.id} onClick={() => navigate(`/restaurant/${res.id}`)} className="min-w-[300px] h-48 relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                            <img src={res.image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                                <h4 className="text-white font-black text-lg">{res.name}</h4>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{res.cuisine_type}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section ref={restaurantListRef} className="scroll-mt-24">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-dark">Best Food in Mumbai</h2>
                    <button className="text-brand flex items-center font-medium hover:underline">
                        View all <ChevronRight size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-muted/10 animate-pulse rounded-xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {restaurants.length > 0 ? (
                            restaurants.map(res => (
                                <RestaurantCard key={res.id} restaurant={res} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-muted italic">
                                No restaurants found matching your criteria.
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
