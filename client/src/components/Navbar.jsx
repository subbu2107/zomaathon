import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import useDarkMode from '../hooks/useDarkMode';
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/?search=${searchQuery}`);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur-md border-b border-muted/10 px-4 py-3 md:px-20 flex items-center justify-between transition-all duration-300">
            <Link to="/" className="text-3xl font-black text-brand italic">Zomathon</Link>

            <div className="hidden md:flex items-center flex-1 mx-10 bg-bg border border-muted/20 rounded-lg shadow-sm px-4 py-2 space-x-4">
                <div className="flex items-center text-muted space-x-2 border-r border-muted/20 pr-4">
                    <MapPin size={20} className="text-brand" />
                    <span className="text-sm">Mumbai, India</span>
                </div>
                <div className="flex items-center flex-1 text-muted">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search for restaurant, cuisine or a dish"
                        className="w-full bg-transparent border-none outline-none px-3 text-dark text-sm placeholder:text-muted/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full hover:bg-muted/10 text-muted transition-colors"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {user ? (
                    <div className="flex items-center space-x-6">
                        <Link to="/cart" className="relative text-muted hover:text-brand transition-colors">
                            <ShoppingCart size={24} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>
                        <div className="group relative">
                            <button className="flex items-center space-x-2 text-dark font-medium">
                                <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <span className="hidden md:block">{user.full_name?.split(' ')[0]}</span>
                            </button>
                            <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                                <div className="bg-bg rounded-lg shadow-xl border border-muted/10 transition-all overflow-hidden">
                                    <Link to="/profile" className="block px-4 py-2 hover:bg-muted/5 text-dark">My Profile</Link>
                                    <Link to="/orders" className="block px-4 py-2 hover:bg-muted/5 text-dark">Orders</Link>
                                    {user.role === 'owner' && (
                                        <Link to="/dashboard" className="block px-4 py-2 hover:bg-muted/5 text-brand font-bold">Owner Dashboard</Link>
                                    )}
                                    <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-brand/5 text-brand border-t border-muted/10 flex items-center space-x-2">
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center space-x-4">
                        <Link to="/login" className="text-muted font-medium hover:text-brand transition-colors">Log in</Link>
                        <Link to="/register" className="btn-primary">Sign up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
