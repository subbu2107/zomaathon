import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../store/AuthContext';
import { User, MapPin, Heart, Settings, Plus, Trash2, Loader2, Home } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [addresses, setAddresses] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'orders');
    const [loading, setLoading] = useState(false);
    const [newAddress, setNewAddress] = useState({ address_line: '', city: '', state: '', pincode: '' });

    useEffect(() => {
        if (user) {
            fetchAddresses();
            fetchFavorites();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const res = await API.get('/users/addresses');
            setAddresses(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchFavorites = async () => {
        try {
            const res = await API.get('/users/favorites');
            setFavorites(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/users/addresses', newAddress);
            toast.success("Address added!");
            setNewAddress({ address_line: '', city: '', state: '', pincode: '' });
            fetchAddresses();
        } catch (err) {
            toast.error("Failed to add address");
        } finally { setLoading(false); }
    };

    const handleRemoveFavorite = async (restaurantId) => {
        try {
            await API.delete(`/users/favorites?restaurant_id=${restaurantId}`);
            toast.success("Removed from favorites");
            fetchFavorites();
        } catch (err) {
            toast.error("Failed to remove favorite");
        }
    };

    if (!user) return <div className="py-20 text-center">Please login to view profile.</div>;

    return (
        <div className="px-4 md:px-20 py-10 bg-bg min-h-screen text-dark transition-colors duration-300">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 space-y-4">
                    <div className="bg-bg p-8 rounded-3xl shadow-xl border border-muted/10 mb-6 transition-all">
                        <div className="w-20 h-20 bg-brand/10 text-brand rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                            <User size={40} />
                        </div>
                        <h2 className="text-xl font-black text-center text-dark tracking-tight">{user.full_name}</h2>
                        <p className="text-muted text-xs text-center font-medium mt-1 uppercase tracking-widest opacity-60">{user.email}</p>
                    </div>

                    <div className="bg-bg rounded-3xl shadow-xl border border-muted/10 overflow-hidden transition-all">
                        {[
                            { id: 'orders', label: 'My Orders', icon: <Settings size={18} /> },
                            { id: 'addresses', label: 'Addresses', icon: <MapPin size={18} /> },
                            { id: 'favorites', label: 'Favorites', icon: <Heart size={18} /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center space-x-4 px-8 py-5 text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-brand/10 text-brand border-r-4 border-brand lg:pl-10' : 'text-muted hover:bg-muted/5 hover:pl-10'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1">
                    {activeTab === 'addresses' && (
                        <div className="space-y-8">
                            <div className="bg-bg p-8 rounded-3xl shadow-xl border border-muted/10 transition-all">
                                <h3 className="text-2xl font-black mb-8 flex items-center space-x-3 text-dark tracking-tight">
                                    <MapPin className="text-brand" size={28} />
                                    <span>Manage Addresses</span>
                                </h3>

                                <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 bg-muted/5 p-8 rounded-2xl border border-muted/10 shadow-inner">
                                    <div className="col-span-full">
                                        <input
                                            placeholder="Address Line (e.g. 123 Street Name)"
                                            className="input-field"
                                            required
                                            value={newAddress.address_line}
                                            onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                                        />
                                    </div>
                                    <input
                                        placeholder="City"
                                        className="input-field"
                                        required
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                    />
                                    <input
                                        placeholder="Pincode"
                                        className="input-field"
                                        required
                                        value={newAddress.pincode}
                                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                    />
                                    <button disabled={loading} className="btn-primary w-fit flex items-center space-x-3 shadow-lg shadow-brand/20 active:scale-95 transition-all">
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                        <span className="font-black uppercase tracking-widest text-xs">Add New Address</span>
                                    </button>
                                </form>

                                <div className="space-y-4">
                                    {addresses.map((addr) => (
                                        <div key={addr.id} className="flex items-center justify-between p-5 border border-muted/10 rounded-2xl hover:bg-muted/5 hover:border-brand/20 transition-all group">
                                            <div className="flex items-start space-x-5">
                                                <div className="bg-muted/10 p-3 rounded-xl text-muted group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                                                    <Home size={22} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-dark text-sm uppercase tracking-wider">{addr.address_line}</p>
                                                    <p className="text-xs text-muted font-medium mt-1 leading-relaxed">{addr.city}, {addr.pincode}</p>
                                                </div>
                                            </div>
                                            <button className="text-muted/40 hover:text-brand transition-colors p-3 hover:bg-brand/10 rounded-xl">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    {addresses.length === 0 && (
                                        <div className="py-20 text-center flex flex-col items-center">
                                            <div className="w-20 h-20 bg-muted/5 rounded-full flex items-center justify-center mb-4">
                                                <MapPin className="text-muted/20" size={32} />
                                            </div>
                                            <p className="text-muted font-bold italic">No addresses saved yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {favorites.map((fav) => (
                                <div key={fav.id} className="card group hover:scale-[1.02] transition-all duration-500 shadow-xl border-muted/10 bg-bg">
                                    <div className="relative h-48 overflow-hidden rounded-t-3xl">
                                        <img src={fav.image_url} alt={fav.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <button
                                            onClick={() => handleRemoveFavorite(fav.id)}
                                            className="absolute top-4 right-4 p-3 bg-bg/90 backdrop-blur-md rounded-2xl text-brand shadow-xl hover:scale-110 active:scale-90 transition-all border border-brand/10"
                                        >
                                            <Heart fill="currentColor" size={20} />
                                        </button>
                                    </div>
                                    <div onClick={() => navigate(`/restaurant/${fav.id}`)} className="p-6 cursor-pointer">
                                        <h4 className="font-black text-xl text-dark group-hover:text-brand transition-colors tracking-tight">{fav.name}</h4>
                                        <p className="text-sm text-muted font-medium mt-1 flex items-center space-x-2">
                                            <span className="w-1 h-1 rounded-full bg-brand"></span>
                                            <span>{fav.cuisine_type}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {favorites.length === 0 && (
                                <div className="col-span-full py-32 text-center bg-muted/5 rounded-3xl border border-dashed border-muted/10">
                                    <div className="w-20 h-20 bg-muted/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Heart className="text-muted/20" size={32} />
                                    </div>
                                    <p className="text-muted font-bold italic">You haven't added any favorites yet</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
