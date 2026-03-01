import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'user'
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData);
            toast.success("Account created! Please log in.");
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.msg || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Signup</h2>
                    <p className="text-gray-500 mt-2 text-sm italic">Join us for a world of flavors!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            className="input-field pl-10"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            className="input-field pl-10"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Phone Number"
                            className="input-field pl-10"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            className="input-field pl-10"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center space-x-4 py-2">
                        <span className="text-sm font-medium text-gray-700">I am a:</span>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="user"
                                checked={formData.role === 'user'}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="text-brand focus:ring-brand"
                            />
                            <span className="text-sm">Customer</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="owner"
                                checked={formData.role === 'owner'}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="text-brand focus:ring-brand"
                            />
                            <span className="text-sm">Restaurant Owner</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                        <span>Create Account</span>
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-8">
                    Already have an account? <Link to="/login" className="text-brand font-bold hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
