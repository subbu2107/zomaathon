import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [restaurantId, setRestaurantId] = useState(null);

    const addToCart = (item, resId) => {
        if (restaurantId && restaurantId !== resId) {
            if (window.confirm("Adding items from another restaurant will clear your current cart. Proceed?")) {
                setCartItems([{ ...item, quantity: 1 }]);
                setRestaurantId(resId);
            }
            return;
        }

        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        setRestaurantId(resId);
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => {
            const newCart = prev.filter(i => i.id !== itemId);
            if (newCart.length === 0) setRestaurantId(null);
            return newCart;
        });
    };

    const updateQuantity = (itemId, delta) => {
        setCartItems(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
        setRestaurantId(null);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, restaurantId, addToCart, removeFromCart, updateQuantity, clearCart, subtotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
