import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../store/AuthContext';
import { Users, Store, ShieldCheck, PieChart, CheckCircle, XCircle, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Admin = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalRestaurants: 0, pendingApprovals: 0 });
    const [activeTab, setActiveTab] = useState('restaurants');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchAdminData();
        }
    }, [user]);

    const fetchAdminData = async () => {
        try {
            const [resUsers, resRest] = await Promise.all([
                API.get('/auth/profile'), // Note: In production, create a dedicated admin users list endpoint
                API.get('/restaurants/')
            ]);

            setUsers([{ id: 1, full_name: "Admin User", email: "admin@zomathon.com", role: "admin" }]);
            setRestaurants(resRest.data);

            setStats({
                totalUsers: 1,
                totalRestaurants: resRest.data.length,
                pendingApprovals: resRest.data.filter(r => !r.is_approved).length
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await API.post(`/restaurants/`, { id, is_approved: true });
            toast.success("Restaurant approved!");
            fetchAdminData();
        } catch (err) {
            toast.error("Approval failed");
        }
    };

    if (user?.role !== 'admin') return <div className="py-20 text-center text-red-500 font-bold text-2xl uppercase tracking-widest">Unauthorized Access</div>;
    if (loading) return <div className="h-screen flex items-center justify-center text-brand font-bold">Initializing Admin Console...</div>;

    return (
        <div className="px-4 md:px-20 py-10 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-1">Control Center</h1>
                    <p className="text-slate-500 font-medium">Manage the Zomathon ecosystem</p>
                </div>
                <div className="flex items-center space-x-2 bg-brand text-white px-4 py-2 rounded-xl shadow-lg shadow-red-100 font-bold text-sm">
                    <ShieldCheck size={18} />
                    <span>Administrator Verified</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className="bg-blue-50 text-blue-500 p-3 rounded-2xl"><Users size={24} /></div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Users</p>
                        <p className="text-2xl font-black text-slate-900">{stats.totalUsers}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className="bg-purple-50 text-purple-500 p-3 rounded-2xl"><Store size={24} /></div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Restaurants</p>
                        <p className="text-2xl font-black text-slate-900">{stats.totalRestaurants}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className="bg-orange-50 text-orange-500 p-3 rounded-2xl"><PieChart size={24} /></div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending</p>
                        <p className="text-2xl font-black text-slate-900">{stats.pendingApprovals}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className="bg-green-50 text-green-500 p-3 rounded-2xl"><CheckCircle size={24} /></div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Orders</p>
                        <p className="text-2xl font-black text-slate-900">12</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="flex flex-col md:flex-row items-center border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('restaurants')}
                        className={`px-8 py-6 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'restaurants' ? 'text-brand bg-red-50/50 border-b-2 border-brand' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Restaurant Management
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-8 py-6 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'text-brand bg-red-50/50 border-b-2 border-brand' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        User Directory
                    </button>
                    <div className="flex-1 px-8 py-4 md:py-0">
                        <div className="relative w-full max-w-sm ml-auto">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Global Search..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-slate-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {activeTab === 'restaurants' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                        <th className="pb-4 font-black">Restaurant</th>
                                        <th className="pb-4 font-black">Owner</th>
                                        <th className="pb-4 font-black">Status</th>
                                        <th className="pb-4 font-black">Rating</th>
                                        <th className="pb-4 font-black text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {restaurants.map((res) => (
                                        <tr key={res.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                                                        <img src={res.image_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="font-bold text-slate-800">{res.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm font-medium text-slate-600">ID: {res.owner_id}</td>
                                            <td className="py-4 text-sm">
                                                {res.is_approved ? (
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">Approved</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-tighter">Pending Approval</span>
                                                )}
                                            </td>
                                            <td className="py-4 text-sm font-bold text-slate-600">{res.rating} ⭐</td>
                                            <td className="py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {!res.is_approved && (
                                                        <button onClick={() => handleApprove(res.id)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><CheckCircle size={18} /></button>
                                                    )}
                                                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                        <th className="pb-4 font-black">User</th>
                                        <th className="pb-4 font-black">Email</th>
                                        <th className="pb-4 font-black">Role</th>
                                        <th className="pb-4 font-black text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">{u.full_name[0]}</div>
                                                    <span className="font-bold text-slate-800">{u.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-slate-500">{u.email}</td>
                                            <td className="py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
