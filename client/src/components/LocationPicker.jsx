import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, Search } from 'lucide-react';

const LocationPicker = ({ onLocationSelect, initialLocation = { lat: 19.0760, lng: 72.8777 } }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!apiKey || apiKey === 'your_google_maps_key') {
            console.warn("Google Maps API key is missing or invalid.");
            return;
        }

        const loader = new Loader({
            apiKey: apiKey,
            version: "weekly",
        });

        loader.load().then(() => {
            if (!mapRef.current) return;
            const google = window.google;
            if (!google) return;

            const newMap = new google.maps.Map(mapRef.current, {
                center: initialLocation,
                zoom: 15,
                disableDefaultUI: true,
                zoomControl: true,
            });

            const newMarker = new google.maps.Marker({
                position: initialLocation,
                map: newMap,
                draggable: true,
                icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            });

            newMarker.addListener('dragend', () => {
                const pos = newMarker.getPosition();
                onLocationSelect({ lat: pos.lat(), lng: pos.lng() });
            });

            newMap.addListener('click', (e) => {
                const pos = e.latLng;
                newMarker.setPosition(pos);
                onLocationSelect({ lat: pos.lat(), lng: pos.lng() });
            });

            setMap(newMap);
            setMarker(newMarker);
            onLocationSelect(initialLocation);
        }).catch(err => {
            console.error("Failed to load Google Maps:", err);
        });
    }, []);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data && data[0]) {
                const pos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                if (map && marker) {
                    map.setCenter(pos);
                    marker.setPosition(pos);
                }
                onLocationSelect(pos);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                if (map && marker) {
                    map.setCenter(pos);
                    marker.setPosition(pos);
                }
                onLocationSelect(pos);
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
                    <MapPin size={14} className="text-brand" />
                    <span>Restaurant Location</span>
                </label>
                <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline flex items-center space-x-1"
                >
                    <Navigation size={12} />
                    <span>Use Current Location</span>
                </button>
            </div>
            <div className="relative mb-3">
                <input
                    type="text"
                    placeholder="Search for area or landmark..."
                    className="w-full bg-bg border border-muted/20 rounded-xl py-2.5 pl-4 pr-12 text-xs text-dark outline-none focus:border-brand/30 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand hover:scale-110 transition-transform disabled:opacity-50"
                >
                    {isSearching ? <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"></div> : <Search size={16} />}
                </button>
            </div>

            <div className="w-full h-64 rounded-3xl overflow-hidden border-2 border-gray-100 shadow-inner relative bg-gray-50">
                {(!apiKey || apiKey === 'your_google_maps_key') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-8 text-center z-10 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl max-w-[200px]">
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest leading-relaxed">
                                Google Map Preview unavailable. <br />
                                <span className="text-brand">Use search or manual inputs instead.</span>
                            </p>
                        </div>
                    </div>
                )}
                <div ref={mapRef} className="w-full h-full" />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-100 shadow-sm pointer-events-none">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Drag pin to adjust</p>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
