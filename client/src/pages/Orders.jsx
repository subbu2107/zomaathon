import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../store/AuthContext';
import { ShoppingBag, Clock, CheckCircle2, Truck, Package, XCircle, ChevronRight, MapPin, Navigation } from 'lucide-react';
import DeliveryTracker from '../components/DeliveryTracker';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await API.get('/orders/history');
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
            socket.emit('join', { room: `user_${user.id}` });
        } else {
            setLoading(false);
            navigate('/login');
        }

        socket.on('order_status_update', (data) => {
            setOrders(prev => prev.map(o =>
                o.id === data.order_id ? { ...o, status: data.status } : o
            ));
            toast.info(`Order #${data.order_id} is now ${data.status}!`);
        });

        return () => {
            socket.off('order_status_update');
        };
    }, [user]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock className="text-yellow-500" />;
            case 'Preparing': return <Package className="text-orange-500" />;
            case 'Out for Delivery': return <Truck className="text-blue-500" />;
            case 'Delivered': return <CheckCircle2 className="text-green-500" />;
            case 'Cancelled': return <XCircle className="text-red-500" />;
            default: return <ShoppingBag className="text-gray-500" />;
        }
    };

    const getStatusStep = (status) => {
        const steps = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
        return steps.indexOf(status);
    };

    const downloadReceipt = (order) => {
        try {
            const doc = new jsPDF();

            doc.setFillColor(235, 53, 67); // Red
            doc.rect(0, 0, 210, 10, 'F');

            doc.setFontSize(26);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(235, 53, 67);
            doc.text("Zomathon", 14, 25);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(150, 150, 150);
            doc.text("Your meal is our passion", 14, 32);

            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.text(`RECEIPT: #${order.id}`, 196, 25, { align: 'right' });
            doc.text(`DATE: ${new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium' })}`, 196, 32, { align: 'right' });

            doc.setDrawColor(220, 220, 220);
            doc.line(14, 40, 196, 40);

            doc.setFontSize(12);
            doc.setTextColor(40, 40, 40);
            doc.setFont("helvetica", "bold");
            doc.text("ORDER FROM", 14, 52);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(order.restaurant_name, 14, 58);

            doc.setFont("helvetica", "bold");
            doc.text("DELIVERED TO", 120, 52);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(user?.full_name || "Valued Customer", 120, 58);
            if (order.created_at) {
                const time = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                doc.setTextColor(120, 120, 120);
                doc.text(`Time: ${time}`, 120, 64);
                doc.setTextColor(40, 40, 40);
            }

            const tableColumn = ["Item Description", "Qty", "Price", "Subtotal"];
            const tableRows = [];

            order.items?.forEach(item => {
                const rowData = [
                    item.name,
                    item.quantity.toString(),
                    `Rs. ${item.price.toFixed(2)}`,
                    `Rs. ${(item.quantity * item.price).toFixed(2)}`
                ];
                tableRows.push(rowData);
            });

            autoTable(doc, {
                startY: 75,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: {
                    fillColor: [235, 53, 67],
                    textColor: 255,
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: { fontSize: 9, halign: 'center' },
                columnStyles: { 0: { halign: 'left', cellWidth: 'auto' } },
                margin: { left: 14, right: 14 }
            });

            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);

            doc.text("Payment Method:", 14, finalY);
            doc.text(order.payment_method || "Online", 50, finalY);

            doc.text("Status:", 14, finalY + 7);
            doc.text(order.status, 50, finalY + 7);

            doc.setFillColor(245, 245, 245);
            doc.rect(140, finalY - 5, 56, 20, 'F');
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(40, 40, 40);
            doc.text("GRAND TOTAL", 145, finalY + 3);
            doc.setFontSize(14);
            doc.setTextColor(235, 53, 67);
            doc.text(`Rs. ${order.total_amount.toFixed(2)}`, 191, finalY + 10, { align: 'right' });

            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(150, 150, 150);
            doc.text("This is a computer generated invoice and requires no signature.", 105, 280, { align: 'center' });
            doc.text("Thank you for your order! Hope to see you again soon.", 105, 285, { align: 'center' });

            doc.save(`Zomathon_Receipt_#${order.id}.pdf`);
            toast.success(`Order Receipt #${order.id} downloaded!`);
        } catch (err) {
            console.error("PDF generation failed:", err);
            toast.error("Failed to generate receipt. Please try again.");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-brand font-bold">Loading your orders...</div>;

    return (
        <div className="px-4 md:px-20 py-12 bg-bg min-h-screen text-dark transition-colors duration-300">
            <h1 className="text-3xl font-black text-dark mb-10 flex items-center space-x-4 tracking-tight">
                <ShoppingBag size={40} className="text-brand" />
                <span>My Orders</span>
            </h1>

            <div className="space-y-12 max-w-4xl">
                {orders.length === 0 ? (
                    <div className="text-center py-32 bg-muted/5 rounded-3xl border border-muted/10">
                        <ShoppingBag size={64} className="mx-auto text-muted/20 mb-6" />
                        <p className="text-muted font-bold italic text-xl">You haven't ordered anything yet!</p>
                        <button onClick={() => navigate('/')} className="btn-primary mt-8">Explore Restaurants</button>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="card p-8 bg-bg border border-muted/10 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                            <div className="flex flex-col md:flex-row justify-between mb-8 pb-8 border-b border-muted/10 border-dashed">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-[10px] uppercase font-black text-muted tracking-[0.3em] opacity-60">Order ID:</span>
                                        <span className="font-mono font-bold text-brand bg-brand/10 px-3 py-1 rounded-lg text-xs">#{order.id}</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-dark leading-tight group-hover:text-brand transition-colors">{order.restaurant_name}</h2>
                                    <div className="flex items-center text-muted text-sm space-x-3 font-medium">
                                        <Clock size={16} />
                                        <span>{new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                </div>
                                <div className="mt-6 md:mt-0 text-right flex flex-col justify-between items-end">
                                    <div className={`inline-flex items-center space-x-2 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 shadow-sm' :
                                        order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 shadow-sm' : 'bg-brand text-white shadow-xl shadow-brand/20'
                                        }`}>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(order.status)}
                                            <span>{order.status}</span>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-dark mt-4">₹{order.total_amount}</p>
                                </div>
                            </div>

                            {order.status !== 'Cancelled' && (
                                <div className="mb-12 px-2">
                                    <div className="relative flex justify-between">
                                        {['Pending', 'Preparing', 'Out for Delivery', 'Delivered'].map((step, idx) => (
                                            <div key={step} className="flex flex-col items-center relative z-10 w-24">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 transform ${getStatusStep(order.status) >= idx ? 'bg-brand text-white shadow-2xl shadow-brand/30 rotate-[10deg] scale-110' : 'bg-muted/10 text-muted/40'
                                                    }`}>
                                                    {idx === 0 && <Clock size={20} />}
                                                    {idx === 1 && <Package size={20} />}
                                                    {idx === 2 && <Truck size={20} />}
                                                    {idx === 3 && <CheckCircle2 size={20} />}
                                                </div>
                                                <span className={`text-[9px] mt-4 font-black uppercase tracking-[0.2em] text-center w-full ${getStatusStep(order.status) >= idx ? 'text-brand' : 'text-muted/40'
                                                    }`}>{step}</span>
                                            </div>
                                        ))}
                                        <div className="absolute top-6 left-0 w-full h-1.5 bg-muted/5 -z-10 rounded-full"></div>
                                        <div
                                            className="absolute top-6 left-0 h-1.5 bg-gradient-to-r from-brand to-brand/60 transition-all duration-1000 ease-in-out -z-10 rounded-full shadow-[0_0_10px_rgba(235,53,67,0.3)]"
                                            style={{ width: `${(getStatusStep(order.status) / 3) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {order.status === 'Out for Delivery' && (
                                <div className="mb-12">
                                    <h3 className="text-xs font-black uppercase text-brand tracking-widest mb-4 ml-2">Live Delivery Track</h3>
                                    <DeliveryTracker orderId={order.id} />
                                </div>
                            )}

                            <div className="space-y-4 bg-muted/5 p-8 rounded-3xl border border-muted/10 shadow-inner">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm group/item">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-brand/10 text-brand px-2 py-1 rounded-lg text-xs font-black">
                                                {item.quantity} x
                                            </div>
                                            <span className="text-dark font-bold group-hover/item:translate-x-1 transition-transform">{item.name}</span>
                                        </div>
                                        <span className="text-muted font-black">₹{item.price}</span>
                                    </div>
                                ))}
                                <div className="pt-6 mt-6 border-t border-muted/10 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center text-xs text-muted font-medium bg-muted/5 px-4 py-2 rounded-full">
                                        <MapPin size={14} className="mr-2 text-brand" />
                                        <span>Delivered to your registered address</span>
                                    </div>
                                    <button
                                        onClick={() => downloadReceipt(order)}
                                        className="text-brand font-black text-xs uppercase tracking-widest flex items-center group/btn py-2 px-4 hover:bg-brand/5 rounded-xl transition-all"
                                    >
                                        <span>Download Receipt</span>
                                        <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Orders;
