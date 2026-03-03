import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Navigation } from 'lucide-react';

const DeliveryTracker = ({ orderId, restaurantLocation, deliveryLocation }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn("Google Maps API Key is missing. Delivery Tracker will show a placeholder.");
            return;
        }

        const loader = new Loader({
            apiKey: apiKey,
            version: "weekly",
        });

        loader.load().then(() => {
            const google = window.google;
            if (!google || !mapRef.current) return;

            const newMap = new google.maps.Map(mapRef.current, {
                center: restaurantLocation || { lat: 19.0760, lng: 72.8777 },
                zoom: 15,
                styles: [
                    { "featureType": "poi", "stylers": [{ "visibility": "off" }] }
                ]
            });
            setMap(newMap);

            new google.maps.Marker({
                position: restaurantLocation,
                map: newMap,
                icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                title: 'Restaurant'
            });

            new google.maps.Marker({
                position: deliveryLocation,
                map: newMap,
                icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                title: 'Your Location'
            });

            const bikeMarker = new google.maps.Marker({
                position: restaurantLocation,
                map: newMap,
                icon: 'https://cdn-icons-png.flaticon.com/32/713/713401.png', // Bike icon
                title: 'Delivery Partner'
            });
            setMarker(bikeMarker);
        }).catch((err) => {
            console.error("Map initialization failed:", err);
        });
    }, [restaurantLocation, deliveryLocation]);

    useEffect(() => {
        if (!map || !marker || !restaurantLocation?.lat || !deliveryLocation?.lat) return;

        let fraction = 0;
        const interval = setInterval(() => {
            if (fraction >= 1) {
                clearInterval(interval);
                return;
            }
            fraction += 0.01;
            try {
                const lat = restaurantLocation.lat + (deliveryLocation.lat - restaurantLocation.lat) * fraction;
                const lng = restaurantLocation.lng + (deliveryLocation.lng - restaurantLocation.lng) * fraction;
                marker.setPosition({ lat, lng });
            } catch (err) {
                console.error("Error updating marker position:", err);
                clearInterval(interval);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [map, marker, restaurantLocation, deliveryLocation]);

    return (
        <div className="w-full h-64 rounded-3xl overflow-hidden shadow-inner border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center group relative cursor-pointer">
            {!map && (
                <div className="text-center px-10 animate-fade-in py-12">
                    <div className="bg-white p-4 rounded-full text-gray-300 mx-auto mb-4 w-fit shadow-sm">
                        <Navigation size={32} className="animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Live Tracking Unavailable</p>
                    <p className="text-[8px] font-bold text-gray-300 tracking-tighter uppercase whitespace-normal max-w-[200px] leading-3 italic">
                        The delivery map is currently in development mode or the API key is missing. Rest assured, your order is on the way!
                    </p>
                </div>
            )}
            <div ref={mapRef} className={`w-full h-full ${!map ? 'hidden' : 'block'}`} />
        </div>
    );
};

export default DeliveryTracker;
