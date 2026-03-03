import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, Loader2, User, Store, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Login = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialType = queryParams.get('type') === 'partner' ? 'partner' : 'customer';

    const [loginType, setLoginType] = useState(initialType); // 'customer' or 'partner'
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = await login(formData.email, formData.password);

            if (loginType === 'partner' && userData.role !== 'owner') {
                toast.error("This account is not a partner account.");
                return;
            }

            toast.success("Welcome back to Zomathon!");

            if (userData.role === 'owner') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 px-4 py-20 transition-colors duration-500">
            <div className={`max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border transition-all duration-500 transform ${loginType === 'partner' ? 'border-brand/20 shadow-brand/10' : 'border-gray-100'}`}>
                <div className="text-center mb-8">
                    <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 ${loginType === 'partner' ? 'bg-brand text-white rotate-[10deg]' : 'bg-gray-100 text-brand outline outline-8 outline-gray-50'}`}>
                        {loginType === 'partner' ? <Store size={40} /> : <User size={40} />}
                    </div>
                    <h2 className="text-4xl font-black text-gray-800 tracking-tight">
                        {loginType === 'partner' ? 'Partner Portal' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-400 mt-2 font-medium">
                        {loginType === 'partner' ? 'Manage your restaurant & orders' : 'Log in to start ordering delicious food'}
                    </p>
                </div>

                <div className="flex p-1.5 bg-gray-100/80 rounded-2xl mb-10 shadow-inner relative overflow-hidden backdrop-blur-sm">
                    <div
                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-xl shadow-lg transition-all duration-500 ease-out z-0 ${loginType === 'partner' ? 'translate-x-[calc(100%+0.75rem)]' : 'translate-x-0'}`}
                    ></div>
                    <button
                        onClick={() => {
                            setLoginType('customer');
                            navigate('/login?type=customer', { replace: true });
                        }}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black transition-all z-10 ${loginType === 'customer' ? 'text-brand' : 'text-gray-400 hover:text-gray-500'}`}
                    >
                        <User size={18} />
                        <span>Customer</span>
                    </button>
                    <button
                        onClick={() => {
                            setLoginType('partner');
                            navigate('/login?type=partner', { replace: true });
                        }}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black transition-all z-10 ${loginType === 'partner' ? 'text-brand' : 'text-gray-400 hover:text-gray-500'}`}
                    >
                        <ShieldCheck size={18} />
                        <span>Restaurant</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand/30 focus:bg-white transition-all text-gray-800 font-medium"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand/30 focus:bg-white transition-all text-gray-800 font-medium"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand text-white py-4 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-brand/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-3 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : null}
                        <span>{loginType === 'customer' ? 'Log In' : 'Partner Sign In'}</span>
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-10 font-bold">
                    {loginType === 'customer' ? (
                        <>New to Zomathon? <Link to="/register" className="text-brand hover:underline underline-offset-4">Create Account</Link></>
                    ) : (
                        <>Want to list your restaurant? <Link to="/register" className="text-brand hover:underline underline-offset-4">Partner With Us</Link></>
                    )}
                </p>
            </div>
        </div>
    );
};

export default Login;
