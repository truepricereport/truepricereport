"use client";

import { useEffect, useRef, useState } from "react";

interface GoogleMapProps {
  address: string;
  className?: string;
  latitude?: number;
  longitude?: number;
  streetViewUrl?: string | null; // Add prop for static Street View URL
}

export function GoogleMap({
  address,
  className = "",
  latitude,
  longitude,
  streetViewUrl, // Receive streetViewUrl prop
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [showStaticView, setShowStaticView] = useState(!!streetViewUrl); // State to toggle between map and static view

  useEffect(() => {
    // Only initialize map if not showing static view and google object is available
    if (!showStaticView && mapRef.current && window.google) {
      const initializeMap = () => {
        try {
          // Default location (Los Angeles) in case geocoding fails
          const defaultLocation = { lat: 34.0522, lng: -118.2437 };

          // Initialize map
          const map = new google.maps.Map(mapRef.current!, {
            zoom: 15,
            center: latitude && longitude ? { lat: latitude, lng: longitude } : defaultLocation,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });

          mapInstanceRef.current = map;

          // Geocode the address if needed
          if (address && address.trim() && !latitude && !longitude) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: address }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                const location = results[0].geometry.location;
                map.setCenter(location);

                // Add marker
                new google.maps.Marker({
                  position: location,
                  map: map,
                  title: address,
                  icon: {
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    scaledSize: new google.maps.Size(32, 32),
                  },
                });
              } else {
                console.log("Geocoding failed, using default location");
              }
            });
          } else if (latitude && longitude) {
            // Add marker
            new google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: map,
              title: address,
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new google.maps.Size(32, 32),
              },
            });
          }
        } catch (error) {
          console.error("Error initializing Google Map:", error);
          // Optionally show a different placeholder for map errors
        }
      };

      // Delay initialization slightly to ensure google object is fully ready
      const timer = setTimeout(initializeMap, 100);

      return () => clearTimeout(timer);
    }
  }, [showStaticView, address, latitude, longitude]); // Depend on showStaticView as well

  // Update showStaticView state when streetViewUrl prop changes
  useEffect(() => {
    setShowStaticView(!!streetViewUrl);
  }, [streetViewUrl]);

  // Placeholder if Google Maps is not available and no static view
  if (!window.google && !showStaticView) {
    return (
      <div
        className={`w-full h-64 rounded-lg border border-gray-300 ${className}`}
        style={{ minHeight: "250px" }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            border: "2px solid #ddd",
          }}
        >
          <div style={{ textAlign: "center", color: "#666" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🗺️</div>
            <div style={{ fontWeight: "bold" }}>Map Location</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              {address || "Address location"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-64 rounded-lg ${className}`} style={{ minHeight: "250px" }}>
      {showStaticView && streetViewUrl ? (
        // Display Static Street View Image
        <img
          src={streetViewUrl}
          alt="Street View of the address"
          className="w-full h-full object-cover rounded-lg shadow-md"
        />
      ) : (
        // Display Interactive Google Map
        <div
          ref={mapRef}
          className="w-full h-full rounded-lg border border-gray-300"
        />
      )}
    </div>
  );
}
