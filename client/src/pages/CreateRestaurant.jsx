import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';
import { Store, MapPin, Utensils, Clock, DollarSign, Image as ImageIcon, Loader2, ArrowRight } from 'lucide-react';

const CreateRestaurant = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cuisine_type: '',
        avg_price: '',
        delivery_time: '',
        image_url: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/restaurants/', {
                ...formData,
                avg_price: parseFloat(formData.avg_price),
                is_approved: true // Auto-approving for development convenience
            });
            toast.success("Restaurant linked successfully!");
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to link restaurant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20 font-sans">
            <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 border border-gray-100 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand/5 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="bg-brand text-white p-4 rounded-3xl shadow-lg shadow-brand/20">
                            <Store size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-800 tracking-tight">Partner With Us</h1>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Register your restaurant</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Restaurant Name</label>
                                <div className="relative group">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
                                    <input
                                        placeholder="e.g. Pizza Palace"
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand/30 focus:bg-white transition-all text-gray-800 font-medium"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Cuisine Type</label>
                                <div className="relative group">
                                    <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
                                    <input
                                        placeholder="e.g. Italian, Chinese"
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand/30 focus:bg-white transition-all text-gray-800 font-medium"
                                        value={formData.cuisine_type}
                                        onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Address</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-4 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
                                <textarea
                                    placeholder="Enter your restaurant's physical location"
                                    required
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand/30 focus:bg-white transition-all text-gray-800 font-medium h-24 resize-none"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Avg. Price for Two (₹)</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
                                    <input
                                        type="number"
                                        placeholder="e.g. 500"
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand/30 focus:bg-white transition-all text-gray-800 font-medium"
                                        value={formData.avg_price}
                                        onChange={(e) => setFormData({ ...formData, avg_price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Time</label>
                                <div className="relative group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
                                    <input
                                        placeholder="e.g. 30-40 mins"
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand/30 focus:bg-white transition-all text-gray-800 font-medium"
                                        value={formData.delivery_time}
                                        onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Store Front Image URL</label>
                            <div className="relative group">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
                                <input
                                    placeholder="Paste an image URL from Unsplash or similar"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand/30 focus:bg-white transition-all text-gray-800 font-medium"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Quick Description</label>
                            <textarea
                                placeholder="Tell customers what's special about your place..."
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-brand/30 focus:bg-white transition-all text-gray-800 font-medium h-24 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand text-white py-5 rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-brand/20 hover:bg-red-700 hover:shadow-brand/40 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 disabled:opacity-70 mt-10"
                        >
                            {loading ? <Loader2 className="animate-spin" size={28} /> : <ArrowRight size={28} />}
                            <span>Register & Link Store</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRestaurant;
