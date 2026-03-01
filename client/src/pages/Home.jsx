import { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import { Star, Filter, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [restaurants, setRestaurants] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const restaurantListRef = useRef(null);

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

                const [resRest, resRec] = await Promise.all([
                    API.get(`/restaurants/?${query}`),
                    API.get('/restaurants/recommendations')
                ]);
                setRestaurants(resRest.data);
                setRecommendations(resRec.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [location.search]);

    const categories = [
        { name: 'Pizza', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
        { name: 'Burger', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
        { name: 'Thali', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
        { name: 'Biryani', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400' },
        { name: 'Rolls', img: 'https://images.unsplash.com/photo-1626700051175-656860749007?auto=format&fit=crop&w=400' },
        { name: 'Cake', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' }
    ];

    return (
        <div className="px-4 md:px-20 py-8 bg-bg text-dark transition-colors duration-300">
            {/* Food Categories */}
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
                            <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden mb-2 bg-muted/10 shadow-sm border border-muted/5 group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium text-muted group-hover:text-brand transition-colors">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Filters */}
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

            {/* Recommended Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-dark flex items-center space-x-2">
                    <span className="bg-blue-500/10 p-2 rounded-full text-blue-500 font-bold">✨</span>
                    <span>Recommended for You</span>
                </h2>
                <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-none">
                    {recommendations.map((res) => (
                        <div
                            key={res.id}
                            onClick={() => navigate(`/restaurant/${res.id}`)}
                            className="min-w-[280px] bg-bg rounded-2xl border border-muted/10 shadow-sm p-4 hover:shadow-md transition-all duration-300 cursor-pointer group"
                        >
                            <div className="relative overflow-hidden rounded-xl mb-3">
                                <img src={res.image_url} alt="" className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <h4 className="font-bold text-dark truncate">{res.name}</h4>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted">{res.cuisine_type.split(',')[0]}</span>
                                <div className="flex items-center space-x-1 bg-green-700 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    <span>{res.rating}</span>
                                    <Star size={8} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trending Section */}
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

            {/* Restaurant List */}
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
