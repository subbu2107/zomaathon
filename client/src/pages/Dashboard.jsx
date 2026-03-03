import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../store/AuthContext';
import { Package, Utensils, DollarSign, List, Plus, Trash2, Edit, Save, X, Check, Loader2, Store, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', price: '', category: '', description: '', is_veg: true });

    useEffect(() => {
        if (user?.role === 'owner' || user?.role === 'admin') {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const resData = await API.get('/restaurants/my');
            const myRes = resData.data[0]; // Assuming one restaurant per owner for now
            if (myRes) {
                setRestaurant(myRes);
                const ordersRes = await API.get(`/orders/restaurant/${myRes.id}`);
                setOrders(ordersRes.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        if (restaurant) {
            socket.emit('join', { room: `restaurant_${restaurant.id}` });

            socket.on('new_order', (newOrder) => {
                setOrders(prev => [newOrder, ...prev]);
                toast.success(`You have a new order: #${newOrder.id}!`);
            });
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('new_order');
        };
    }, [restaurant]);

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await API.put(`/orders/${orderId}/status`, { status });
            toast.success(`Order status updated to ${status}`);
            fetchDashboardData();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm("Are you sure you want to remove this item?")) return;
        try {
            await API.delete(`/menu/${itemId}`);
            toast.success("Item removed from menu");
            fetchDashboardData();
        } catch (err) {
            toast.error("Failed to delete item");
        }
    };

    const handleCreateMenuItem = async (e) => {
        e.preventDefault();
        if (!restaurant?.id) {
            toast.error("No restaurant linked to your account. Please create one first.");
            return;
        }
        try {
            const itemData = {
                ...newItem,
                price: parseFloat(newItem.price),
                restaurant_id: restaurant.id
            };
            await API.post('/menu/', itemData);
            toast.success("Menu item added!");
            setIsMenuModalOpen(false);
            setNewItem({ name: '', price: '', category: '', description: '', is_veg: true });
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to add item");
        }
    };

    if (user?.role !== 'owner' && user?.role !== 'admin') {
        return (
            <div className="py-20 text-center px-10 bg-bg min-h-screen flex items-center justify-center transition-colors duration-300">
                <div className="bg-bg p-12 rounded-[3rem] shadow-2xl max-w-lg border border-red-50 ring-1 ring-red-100">
                    <h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter mb-4">Access Denied</h2>
                    <p className="text-gray-500 font-medium">This portal is reserved for Restaurant Partners and Administrators only.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-bg transition-colors duration-300">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-brand font-black tracking-widest uppercase animate-pulse">Loading Platform</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-20 py-10 bg-bg min-h-screen transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-dark tracking-tight">Owner Dashboard</h1>
                    <p className="text-muted font-bold uppercase text-[10px] tracking-[0.2em]">{restaurant?.name || "No Restaurant Linked"}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 bg-bg p-2 px-4 rounded-xl shadow-sm border border-muted/10">
                        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-xs font-black text-muted uppercase tracking-widest">
                            {isConnected ? 'Live Sync' : 'Disconnected'}
                        </span>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="bg-bg p-3 rounded-2xl shadow-sm border border-muted/10 hover:bg-muted/5 transition-all active:scale-95 text-muted hover:text-brand"
                    >
                        <Loader2 size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-bg p-8 rounded-[2.5rem] shadow-xl shadow-black/5 flex items-center space-x-6 border border-muted/10">
                    <div className="bg-brand/10 p-5 rounded-3xl text-brand"><DollarSign size={28} /></div>
                    <div>
                        <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Total Earnings</p>
                        <p className="text-3xl font-black text-dark">₹{orders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + o.total_amount, 0).toFixed(0)}</p>
                    </div>
                </div>
                <div className="bg-bg p-8 rounded-[2.5rem] shadow-xl shadow-black/5 flex items-center space-x-6 border border-muted/10">
                    <div className="bg-blue-500/10 p-5 rounded-3xl text-blue-500"><Package size={28} /></div>
                    <div>
                        <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Total Orders</p>
                        <p className="text-3xl font-black text-dark">{orders.length}</p>
                    </div>
                </div>
                <div className="bg-bg p-8 rounded-[2.5rem] shadow-xl shadow-black/5 flex items-center space-x-6 border border-muted/10">
                    <div className="bg-green-500/10 p-5 rounded-3xl text-green-500"><Utensils size={28} /></div>
                    <div>
                        <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Menu Items</p>
                        <p className="text-3xl font-black text-dark">{restaurant?.menu?.length || 0}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-10 mb-10 border-b border-muted/10">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`pb-5 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'orders' ? 'text-brand' : 'text-muted hover:text-dark'}`}
                >
                    Incoming Orders
                    {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand rounded-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`pb-5 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'menu' ? 'text-brand' : 'text-muted hover:text-dark'}`}
                >
                    Menu Management
                    {activeTab === 'menu' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand rounded-full"></div>}
                </button>
            </div>

            {activeTab === 'orders' && (
                <div className="space-y-6">
                    {!restaurant ? (
                        <div className="bg-bg p-24 text-center rounded-[3.5rem] border-2 border-dashed border-muted/20 shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-5 duration-700">
                            <div className="bg-brand/10 p-10 rounded-[2.5rem] text-brand mb-10 ring-8 ring-brand/5">
                                <Store size={64} />
                            </div>
                            <h2 className="text-4xl font-black text-dark tracking-tight mb-4">Grow your business</h2>
                            <p className="text-muted mb-12 max-w-sm font-bold text-sm leading-relaxed uppercase tracking-wider">Register your restaurant to start accepting delicious orders today!</p>
                            <button
                                onClick={() => navigate('/dashboard/create-restaurant')}
                                className="bg-brand text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-2xl shadow-brand/20 hover:shadow-brand/40 active:scale-95 flex items-center space-x-4"
                            >
                                <span>Register Now</span>
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-bg p-32 text-center rounded-[3rem] border-2 border-dashed border-muted/20">
                            <Package className="mx-auto text-muted/20 mb-6 animate-bounce" size={64} />
                            <p className="text-muted font-black uppercase tracking-widest text-xs">Waiting for your first order...</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-bg p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-muted/10 group">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center space-x-6">
                                        <div className="bg-muted/5 p-4 rounded-2xl group-hover:bg-brand/5 transition-colors">
                                            <Package className="text-muted group-hover:text-brand transition-colors" size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-3 mb-1">
                                                <span className="font-mono font-black text-muted/30">#{order.id}</span>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="font-black text-xl text-dark tracking-tight">₹{order.total_amount}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 w-full md:w-auto">
                                        {order.status === 'Pending' && (
                                            <button onClick={() => handleUpdateStatus(order.id, 'Preparing')} className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">Accept</button>
                                        )}
                                        {order.status === 'Preparing' && (
                                            <button onClick={() => handleUpdateStatus(order.id, 'Out for Delivery')} className="flex-1 md:flex-none bg-orange-500 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 active:scale-95">Dispatch</button>
                                        )}
                                        {order.status === 'Out for Delivery' && (
                                            <button onClick={() => handleUpdateStatus(order.id, 'Delivered')} className="flex-1 md:flex-none bg-green-500 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-100 active:scale-95">Delivered</button>
                                        )}
                                        <button className="bg-muted/5 p-3 rounded-2xl text-muted/40 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'menu' && restaurant && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center bg-bg p-6 rounded-3xl shadow-sm border border-muted/10">
                        <div>
                            <h3 className="text-xl font-black text-dark tracking-tight">Active Menu</h3>
                            <p className="text-xs font-bold text-muted uppercase tracking-widest">Manage your offerings</p>
                        </div>
                        <button
                            onClick={() => setIsMenuModalOpen(true)}
                            className="bg-brand text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center space-x-3 hover:bg-red-700 transition-all shadow-xl shadow-brand/20 active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Add New Item</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {restaurant.menu?.map((item) => (
                            <div key={item.id} className="bg-bg p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-muted/10 group relative">
                                <div className="flex items-center space-x-5">
                                    <div className="relative">
                                        <div className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center p-0.5 ${item.is_veg ? 'border-green-600' : 'border-red-600'}`}>
                                            <div className={`w-full h-full rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-dark tracking-tight truncate pr-10">{item.name}</h4>
                                        <p className="text-brand font-black text-sm mb-1">₹{item.price}</p>
                                        <span className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">{item.category}</span>
                                    </div>
                                </div>
                                <div className="absolute top-6 right-6 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    <button className="p-2.5 bg-muted/10 rounded-xl text-muted/50 hover:text-brand hover:bg-brand/5 transition-all"><Edit size={16} /></button>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="p-2.5 bg-muted/10 rounded-xl text-muted/50 hover:text-red-500 hover:bg-red-50/10 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'menu' && !restaurant && (
                <div className="bg-bg p-24 text-center rounded-[3.5rem] border-2 border-dashed border-muted/20 shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center">
                    <div className="bg-muted/5 p-10 rounded-[2.5rem] text-muted/20 mb-10">
                        <Utensils size={64} />
                    </div>
                    <h2 className="text-3xl font-black text-dark tracking-tight mb-2">Build your menu</h2>
                    <p className="text-muted max-w-sm font-bold text-xs uppercase tracking-widest leading-relaxed">Please register your restaurant first to unlock menu management.</p>
                </div>
            )}

            {isMenuModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-bg rounded-[3rem] w-full max-w-xl p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-muted/20">
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setIsMenuModalOpen(false)} className="bg-muted/10 p-3 rounded-2xl text-muted hover:text-dark transition-colors"><X /></button>
                        </div>

                        <div className="mb-10 text-center">
                            <h3 className="text-3xl font-black text-dark tracking-tight">Create Item</h3>
                            <p className="text-muted font-black uppercase text-[10px] tracking-[0.2em] mt-1">Add to your restaurant menu</p>
                        </div>

                        <form onSubmit={handleCreateMenuItem} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">Item Name</label>
                                <input
                                    placeholder="e.g. Signature Burger"
                                    className="w-full bg-bg border-2 border-muted/10 rounded-2xl py-4 px-6 outline-none focus:border-brand/30 transition-all text-dark font-bold"
                                    required
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-bg border-2 border-muted/10 rounded-2xl py-4 px-6 outline-none focus:border-brand/30 transition-all text-dark font-bold"
                                        required
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        className="w-full bg-bg border-2 border-muted/10 rounded-2xl py-4 px-6 outline-none focus:border-brand/30 transition-all text-dark font-bold appearance-none cursor-pointer"
                                        required
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        <option value="" disabled className="bg-bg text-dark">Select Category</option>
                                        <option value="Pizza" className="bg-bg text-dark">Pizza</option>
                                        <option value="Burger" className="bg-bg text-dark">Burger</option>
                                        <option value="Thali" className="bg-bg text-dark">Thali</option>
                                        <option value="Biryani" className="bg-bg text-dark">Biryani</option>
                                        <option value="Rolls" className="bg-bg text-dark">Rolls</option>
                                        <option value="Cake" className="bg-bg text-dark">Cake</option>
                                        <option value="Beverages" className="bg-bg text-dark">Beverages</option>
                                        <option value="Desserts" className="bg-bg text-dark">Desserts</option>
                                        <option value="North Indian" className="bg-bg text-dark">North Indian</option>
                                        <option value="South Indian" className="bg-bg text-dark">South Indian</option>
                                        <option value="Chinese" className="bg-bg text-dark">Chinese</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    placeholder="Briefly describe the ingredients or taste..."
                                    className="w-full bg-bg border-2 border-muted/10 rounded-2xl py-4 px-6 outline-none focus:border-brand/30 transition-all text-dark font-bold h-24 resize-none"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center justify-between bg-muted/5 p-6 rounded-3xl">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-8 h-8 flex items-center justify-center border-2 rounded-lg ${newItem.is_veg ? 'border-green-600 bg-green-50 text-green-600' : 'border-red-600 bg-red-50 text-red-600'}`}>
                                        <div className={`w-3 h-3 rounded-full ${newItem.is_veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                    </div>
                                    <span className="font-black text-sm text-dark uppercase tracking-widest">Pure Vegetarian</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={newItem.is_veg}
                                        onChange={(e) => setNewItem({ ...newItem, is_veg: e.target.checked })}
                                    />
                                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>

                            <button type="submit" className="w-full bg-brand text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand/20 hover:bg-red-700 transition-all active:scale-[0.98] mt-4">Add to Menu</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
