import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6 text-brand">
                    <AlertCircle size={80} strokeWidth={1.5} />
                </div>
                <h1 className="text-6xl font-black text-gray-800 mb-4 tracking-tighter">404</h1>
                <h2 className="text-2xl font-bold text-gray-600 mb-6 capitalize">Page Not Found</h2>
                <p className="text-gray-400 mb-10 font-medium">The page you're looking for doesn't exist or has been moved.</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-brand text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:bg-red-700 transition-all active:scale-95 flex items-center mx-auto space-x-3"
                >
                    <Home size={20} />
                    <span>Back to Home</span>
                </button>
            </div>
        </div>
    );
};

export default NotFound;
