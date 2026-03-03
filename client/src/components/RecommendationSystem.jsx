import { Sparkles, MapPin, Star, History, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecommendationSystem = ({ recommendations, title = "Recommended for You" }) => {
    const navigate = useNavigate();

    if (!recommendations || recommendations.length === 0) return null;

    const getIcon = (reason) => {
        if (reason.toLowerCase().includes('favorite')) return <Heart size={14} className="text-pink-500 fill-pink-500" />;
        if (reason.toLowerCase().includes('ordered') || reason.toLowerCase().includes('frequent')) return <History size={14} className="text-blue-500" />;
        if (reason.toLowerCase().includes('near')) return <MapPin size={14} className="text-brand" />;
        if (reason.toLowerCase().includes('taste') || reason.toLowerCase().includes('craving')) return <Sparkles size={14} className="text-yellow-500" />;
        return <Star size={14} className="text-green-500 fill-green-500" />;
    };

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-dark flex items-center space-x-2">
                <span className="bg-brand/10 p-2 rounded-full text-brand">✨</span>
                <span>{title}</span>
            </h2>
            <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-none px-1">
                {recommendations.map((res) => (
                    <div
                        key={res.id}
                        onClick={() => navigate(`/restaurant/${res.id}`)}
                        className="min-w-[300px] max-w-[320px] bg-bg rounded-2xl border border-muted/10 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    >
                        <div className="relative h-44 overflow-hidden">
                            <img
                                src={res.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
                                alt={res.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-bg/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-muted/20">
                                {getIcon(res.recommendation_reason)}
                                <span className="text-[10px] font-black uppercase tracking-wider text-dark/90">
                                    {res.recommendation_reason}
                                </span>
                            </div>

                            <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-green-600 dark:bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-black shadow-lg">
                                <span>{res.rating}</span>
                                <Star size={10} fill="currentColor" />
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black text-lg text-dark truncate flex-1 pr-2">{res.name}</h4>
                                <span className="text-brand font-black text-sm">₹{res.avg_price}</span>
                            </div>

                            <div className="flex items-center space-x-2 text-xs text-muted font-bold">
                                <span className="truncate max-w-[150px]">{res.cuisine_type}</span>
                                <span>•</span>
                                <span>{res.delivery_time} mins</span>
                            </div>

                            {res.recommendation_reason.includes('Near') && (
                                <div className="mt-4 flex flex-col space-y-1">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted/60">
                                        <span>Proximity Boost</span>
                                        <span>95% Matching</span>
                                    </div>
                                    <div className="h-1 w-full bg-muted/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand w-[95%] rounded-full animate-grow-width" />
                                    </div>
                                </div>
                            )}

                            {res.recommendation_reason.includes('taste') && (
                                <div className="mt-4 flex flex-col space-y-1">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted/60">
                                        <span>Cuisine Match</span>
                                        <span>Highly Recommended</span>
                                    </div>
                                    <div className="h-1 w-full bg-muted/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500 w-[88%] rounded-full animate-grow-width" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style sx>{`
                @keyframes grow-width {
                    from { width: 0; }
                    to { width: var(--target-width); }
                }
                .animate-grow-width {
                    animation: grow-width 1.5s ease-out forwards;
                }
            `}</style>
        </section>
    );
};

export default RecommendationSystem;
