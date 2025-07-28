"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { TraditionalAutocomplete } from "@/components/AddressAutocomplete"
import { useState, useEffect } from "react"

interface PlaceDetails {
  fullAddress: string
  streetNumber: string
  route: string
  city: string
  state: string
  country: string
  zipcode: string
  latitude?: number
  longitude?: number
}

interface HeroSectionProps {
  onAddressSubmit: (address: string, placeDetails?: PlaceDetails, streetViewUrl?: string | null) => void // Modified to include streetViewUrl
}

export function HeroSection({ onAddressSubmit }: HeroSectionProps) {
  const [selectedAddress, setSelectedAddress] = useState("")
  const [latitude, setLatitude] = useState<number | undefined>(undefined)
  const [longitude, setLongitude] = useState<number | undefined>(undefined)
  const [streetViewUrl, setStreetViewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (latitude && longitude) {
      getStreetViewImage(latitude, longitude)
    } else {
        setStreetViewUrl(null); // Clear image if no coordinates
    }
  }, [latitude, longitude])

  const getStreetViewImage = (latitude: number, longitude: number) => {
    const YOUR_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Replace with your actual API key
    if (YOUR_API_KEY) {
      const url = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=${YOUR_API_KEY}`;
      setStreetViewUrl(url);
    } else {
      console.error("Google Maps API key is missing.  Please set the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.");
      setStreetViewUrl(null);
    }
  };

  const geocodeAddressForStreetView = (address: string) => {
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.error("Google Maps Geocoder not loaded.");
      setStreetViewUrl(null);
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        setLatitude(location.lat());
        setLongitude(location.lng());
      } else {
        console.error("Geocode was not successful for Street View: " + status);
        setStreetViewUrl(null);
      }
    });
  };

  const handleAddressSelect = (address: string, placeDetails?: PlaceDetails) => {
    setSelectedAddress(address);
    console.log("Selected address:", address);

    // Always attempt to geocode the selected address for Street View
    if (address) {
      geocodeAddressForStreetView(address);
    } else {
      setLatitude(undefined);
      setLongitude(undefined);
      setStreetViewUrl(null);
    }

    // Still store placeDetails if available for the main flow (Step 1, etc.)
    if (placeDetails) {
        console.log("Place details from autocomplete:", placeDetails)
      ;(window as unknown as Record<string, unknown>).selectedAddressDetails = placeDetails;
      // If placeDetails has coords, they will be used for the main flow,
      // but the street view in Hero will use coords from geocoding for consistency with Step 1.
      // If placeDetails does NOT have coords, we will rely on the geocoding result for the main flow too.
      // This needs careful handling in MainFlow to prioritize placeDetails coords if available.
    } else {
         ;(window as unknown as Record<string, unknown>).selectedAddressDetails = undefined; // Clear stored details
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Prioritize placeDetails if available from autocomplete
    const placeDetailsFromAutocomplete = (window as unknown as Record<string, unknown>).selectedAddressDetails as PlaceDetails | undefined;

    if (selectedAddress) {
      if(placeDetailsFromAutocomplete) {
         onAddressSubmit(selectedAddress, placeDetailsFromAutocomplete, streetViewUrl); // Pass streetViewUrl
      } else if (latitude && longitude) {
          // If no placeDetails from autocomplete, but geocoding in Hero gave us coords,
          // construct minimal placeDetails to pass for the main flow.
          // This assumes the geocoded coords are the ones we want to carry forward.
           const geocodedPlaceDetails: PlaceDetails = {
                fullAddress: selectedAddress,
                streetNumber: '', // Geocoding might not break this down reliably
                route: '',
                city: '',
                state: '',
                country: '',
                zipcode: '',
                latitude: latitude,
                longitude: longitude
           };
           onAddressSubmit(selectedAddress, geocodedPlaceDetails, streetViewUrl); // Pass streetViewUrl
      } else {
           // Fallback to just the address string if no coords from autocomplete or geocoding
           onAddressSubmit(selectedAddress, undefined, streetViewUrl); // Pass streetViewUrl
      }
    } else {
      // Fallback: try to get value from any input in the form
      const addressInput = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
      const currentAddress = addressInput?.value || "Demo Property Address";
      onAddressSubmit(currentAddress.trim(), undefined, streetViewUrl); // Pass streetViewUrl
    }
  };

  return (
    <section
      className="min-h-[80vh] flex items-center justify-center px-6 py-20 bg-cover bg-center"
      style={{ backgroundImage: `url('https://truepricereport.s3.us-west-1.amazonaws.com/Homepagetruepricereportimage.jpeg')` }}
    >
      <div className="bg-white bg-opacity-90 rounded-2xl p-12 max-w-2xl w-full text-center shadow-lg">
        <div className="mb-8">
          <Image
            src="https://truepricereport.s3.us-west-1.amazonaws.com/truepricereportlogo.png"
            alt="True Price Report"
            width={200}
            height={60}
            className="h-16 w-auto mx-auto mb-8"
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Get Your FREE Report to find out:
        </h1>

        <ul className="text-left text-gray-700 space-y-2 mb-10 max-w-lg mx-auto text-base leading-relaxed">
          <li>• What's My Home Worth Today?</li>
          <li>• How Is the Market Affecting My Property Value?</li>
          <li>• What could I walk away with if I sold it on the Market?</li>
          <li>• Will my home profit as a rental?</li>
          <li>• What Would a Cash Offer Look Like?</li>
        </ul>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="flex-1">
                {/* Street View Image Display */}
                {streetViewUrl && (
                    <div className="mb-4">
                        <img src={streetViewUrl} alt="Street View of the address" className="shadow-md rounded-md w-full" />
                    </div>
                )}
                <TraditionalAutocomplete
                    onAddressSelect={handleAddressSelect}
                    placeholder="Enter your home address"
                    className="w-full h-12 px-4 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0f6c0c] focus:border-transparent"
                />
            </div>
          <Button
            type="submit"
            className="bg-[#0f6c0c] hover:bg-[#0d5a0a] text-white h-12 px-8 rounded font-medium whitespace-nowrap"
          >
            Submit
          </Button>
        </form>
      </div>
    </section>
  )
}
