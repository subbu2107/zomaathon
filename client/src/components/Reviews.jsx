import { useState, useEffect } from 'react';
import API from '../services/api';
import { Star, MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Reviews = ({ restaurantId }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [restaurantId]);

    const fetchReviews = async () => {
        try {
            const res = await API.get(`/interactions/reviews/${restaurantId}`);
            setReviews(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/interactions/reviews', { restaurant_id: restaurantId, rating, comment });
            toast.success("Review posted!");
            setComment('');
            fetchReviews();
        } catch (err) {
            toast.error("Failed to post review. Please login.");
        } finally { setSubmitting(false); }
    };

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
                <MessageSquare className="text-brand" />
                <span>Reviews & Ratings</span>
            </h2>

            <form onSubmit={handleSubmit} className="card p-6 mb-10 bg-white border border-slate-100 shadow-sm">
                <p className="text-sm font-bold text-slate-700 mb-4">How was your experience?</p>
                <div className="flex items-center space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            className={`${rating >= s ? 'text-yellow-400' : 'text-slate-200'} transition-colors`}
                        >
                            <Star fill={rating >= s ? "currentColor" : "none"} size={24} />
                        </button>
                    ))}
                </div>
                <textarea
                    placeholder="Write your feedback here..."
                    className="input-field h-24 mb-4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                ></textarea>
                <button disabled={submitting} className="btn-primary w-full flex items-center justify-center space-x-2 uppercase tracking-widest text-xs py-3">
                    {submitting ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                    <span>Post Review</span>
                </button>
            </form>

            <div className="space-y-6">
                {reviews.map((r) => (
                    <div key={r.id} className="p-6 bg-white rounded-2xl border border-slate-50 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">U</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">User #{r.user_id}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">{new Date(r.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex bg-green-700 text-white px-2 py-0.5 rounded text-[10px] font-black items-center space-x-1">
                                <span>{r.rating}</span>
                                <Star size={10} fill="currentColor" />
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{r.comment}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reviews;
