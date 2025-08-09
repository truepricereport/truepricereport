"use client"

import { useEffect, useRef } from "react"
// Use types from @types/google.maps
declare global {
  interface Window {
    initMap?: () => void;
    google?: typeof google;
  }
}

import { PlaceDetails } from "../types/index";

interface TraditionalAutocompleteProps {
  id?: string;
  onAddressSelect: (address: string, placeDetails?: PlaceDetails) => void
  placeholder?: string
  className?: string
}

export function TraditionalAutocomplete({
  id,
  onAddressSelect,
  placeholder = "Enter your address",
  className
}: TraditionalAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null) as React.MutableRefObject<HTMLInputElement | null>;
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        // Load Google Maps script if not already loaded
        if (!window.google?.maps?.places) {
          const existingScript = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement | null
          if (!existingScript) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true
            scriptRef.current = script
            document.head.appendChild(script)
            await new Promise<void>((resolve, reject) => {
              script.onload = () => {
                console.log('Google Maps script loaded') // Add this line
                resolve()
              }
              script.onerror = () => reject(new Error("Failed to load Google Maps script"))
            })
          }
        }

        // Google Maps availability check and Autocomplete initialization
        if (window.google?.maps?.places?.Autocomplete && inputRef.current) {
          console.log('Initializing Autocomplete') // Add this line
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'formatted_address', 'geometry', 'name']
          })

          autocompleteRef.current = autocomplete

          // Add Las Vegas bias
          const lasVegasBounds = new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(36.0219, -115.3129),
            new window.google.maps.LatLng(36.3179, -114.9669)
          )
          autocomplete.setBounds(lasVegasBounds)

          // Listen for place selection
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()

            if (!place || !place.address_components) {
              alert('No place selected or incomplete data')
              return
            }

            const address = place.formatted_address || place.name || ''

            // Extract address components
            const getComponent = (type: string) => {
              const component = place.address_components?.find(comp =>
                comp.types.includes(type)
              )
              return component?.long_name || ""
            }

            // New function to extract unit number
            const getUnitNumber = () => {
              const component = place.address_components?.find(comp =>
                comp.types.includes("subpremise")
              )
              return component?.long_name || ""
            }

            const detailedAddress: PlaceDetails = {
              fullAddress: address,
              streetNumber: getComponent("street_number"),
              unitNumber: getUnitNumber(), // Added unitNumber
              route: getComponent("route"),
              city: getComponent("locality") || getComponent("administrative_area_level_2"),
              state: getComponent("administrative_area_level_1"),
              country: getComponent("country"),
              zipcode: getComponent("postal_code"),
              latitude: place.geometry?.location?.lat(),
              longitude: place.geometry?.location?.lng()
            }

            console.log('Selected place from traditional autocomplete:', detailedAddress)
            onAddressSelect(address, detailedAddress)
          })

          console.log('Traditional Google Places Autocomplete initialized')
        } else {
          console.warn('Google Maps Places Autocomplete not available, check API key and libraries')
        }
      } catch (error) {
        alert('Failed to initialize traditional autocomplete. Please check your internet connection and API key.')
        console.error('Failed to initialize traditional autocomplete:', error)
      }
    };

    initializeAutocomplete()

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
      // Remove script if it was added
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current)
        scriptRef.current = null
      }
    }
  }, [onAddressSelect])

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className={`w-full h-9 py-2 px-3 text-sm border border-gray-300 rounded-md outline-none transition-all focus:border-green-600 focus:ring-2 focus:ring-green-600/20 bg-transparent ${className || ''} box-border`}
      aria-autocomplete="list"
      role="combobox"
      autoComplete="off"
      aria-controls={undefined}
      aria-expanded={false}
      id={id}
    />
  )
}
