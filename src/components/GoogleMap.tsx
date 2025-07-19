"use client"

import { useEffect, useRef } from "react"
import { Loader } from "@googlemaps/js-api-loader"

interface GoogleMapProps {
  address: string
  className?: string
}

export function GoogleMap({ address, className = "" }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "demo",
          version: "weekly",
          libraries: ["places", "geocoding"]
        })

        await loader.load()

        if (!mapRef.current) return

        // Default location (Los Angeles) in case geocoding fails
        const defaultLocation = { lat: 34.0522, lng: -118.2437 }

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: defaultLocation,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        })

        mapInstanceRef.current = map

        // Geocode the address
        if (address && address.trim()) {
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const location = results[0].geometry.location
              map.setCenter(location)

              // Add marker
              new google.maps.Marker({
                position: location,
                map: map,
                title: address,
                icon: {
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new google.maps.Size(32, 32)
                }
              })
            } else {
              console.log("Geocoding failed, using default location")
            }
          })
        }

      } catch (error) {
        console.log("Google Maps not available, showing placeholder")
        // Show a placeholder for demo
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div style="
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
              border: 2px solid #ddd;
            ">
              <div style="text-align: center; color: #666;">
                <div style="font-size: 48px; margin-bottom: 8px;">🗺️</div>
                <div style="font-weight: bold;">Map Location</div>
                <div style="font-size: 12px; margin-top: 4px;">${address || 'Address location'}</div>
              </div>
            </div>
          `
        }
      }
    }

    initializeMap()
  }, [address])

  return (
    <div
      ref={mapRef}
      className={`w-full h-64 rounded-lg border border-gray-300 ${className}`}
      style={{ minHeight: "250px" }}
    />
  )
}
