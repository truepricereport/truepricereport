"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GoogleMapProps {
  address: string;
  className?: string;
  latitude?: number;
  longitude?: number;
  streetViewUrl?: string | null;
}

export function GoogleMap({
  address,
  className = "",
  latitude,
  longitude,
  streetViewUrl,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<'map' | 'street'>('map');

  // Check for Google Maps script loading
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google) setIsGoogleMapsLoaded(true);
    };

    checkGoogleMaps();
    window.addEventListener('load', checkGoogleMaps);
    return () => window.removeEventListener('load', checkGoogleMaps);
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (isGoogleMapsLoaded && mapRef.current && !mapInstanceRef.current) {
      try {
        const defaultLocation = { lat: 34.0522, lng: -118.2437 };
        const map = new google.maps.Map(mapRef.current!, {
          zoom: 15,
          center: latitude && longitude ? { lat: latitude, lng: longitude } : defaultLocation,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
        });

        mapInstanceRef.current = map;

        if (address && address.trim() && !latitude && !longitude) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const location = results[0].geometry.location;
              map.setCenter(location);
              new google.maps.Marker({ position: location, map, title: address, icon: { url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", scaledSize: new google.maps.Size(32, 32) } });
            }
          });
        } else if (latitude && longitude) {
          new google.maps.Marker({ position: { lat: latitude, lng: longitude }, map, title: address, icon: { url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", scaledSize: new google.maps.Size(32, 32) } });
        }
      } catch (error) {
        console.error("Error initializing Google Map:", error);
      }
    }
  }, [isGoogleMapsLoaded, address, latitude, longitude]);

  // Carousel timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (streetViewUrl) {
      timer = setInterval(() => {
        setCurrentView(prev => prev === 'map' ? 'street' : 'map');
      }, 5000); // Switch every 5 seconds
    }
    return () => clearInterval(timer);
  }, [streetViewUrl]);

  const toggleView = () => {
    setCurrentView(prev => prev === 'map' ? 'street' : 'map');
  };

  if (!isGoogleMapsLoaded) {
    return (
      <div className={`w-full h-64 rounded-lg border border-gray-300 ${className}`} style={{ minHeight: "250px" }}>
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", border: "2px solid #ddd" }}>
          <div style={{ textAlign: "center", color: "#666" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🗺️</div>
            <div style={{ fontWeight: "bold" }}>Map Location</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>{address || "Address location"}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-64 rounded-lg overflow-hidden ${className}`} style={{ minHeight: "250px" }}>
      {/* Map View */}
      <div
        ref={mapRef}
        className={`w-full h-full transition-opacity duration-500 ${currentView === 'map' ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Street View Image */}
      {streetViewUrl && (
        <img
          src={streetViewUrl}
          alt="Street View of the address"
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${currentView === 'street' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Navigation Arrows */}
      {streetViewUrl && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleView}
            className="absolute top-1/2 left-2 -translate-y-1/2 text-white bg-black bg-opacity-30 hover:bg-opacity-50"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleView}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-white bg-black bg-opacity-30 hover:bg-opacity-50"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  );
}
