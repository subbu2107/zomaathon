import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
    return (
        <Link to={`/restaurant/${restaurant.id}`} className="card group cursor-pointer">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=60'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[12px] font-bold text-dark">
                    {restaurant.delivery_time}
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold truncate max-w-[70%]">{restaurant.name}</h3>
                    <div className="flex items-center space-x-1 bg-green-700 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                        <span>{restaurant.rating}</span>
                        <Star size={10} fill="currentColor" />
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted">
                    <p className="truncate">{restaurant.cuisine_type}</p>
                    <p>₹{restaurant.avg_price} for two</p>
                </div>
            </div>
        </Link>
    );
};

export default RestaurantCard;
