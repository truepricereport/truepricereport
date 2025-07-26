"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleMap } from "@/components/GoogleMap"

interface Step1Data {
  streetAddress: string
  city: string
  state: string
  country: string
  zipcode: string
}

interface FormData {
  step1: Step1Data
}

interface Step1Props {
  formData: FormData
  updateFormData: (data: { step1: Step1Data }) => void
  onNext: () => void
  selectedAddress: string
  updateSelectedAddress: (address: string) => void
  onStep1NextSubmit: (addressData: Step1Data) => void // New prop for Step 1 API call
  latitude?: number
  longitude?: number
}

export function Step1({ formData, updateFormData, onNext, selectedAddress, updateSelectedAddress, onStep1NextSubmit, latitude, longitude }: Step1Props) {
  const [localData, setLocalData] = useState<Step1Data>(() => ({
    streetAddress: selectedAddress || formData.step1.streetAddress || "",
    city: formData.step1.city || "",
    state: formData.step1.state || "",
    country: formData.step1.country || "USA",
    zipcode: formData.step1.zipcode || ""
  }))

  const [streetViewUrl, setStreetViewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (latitude && longitude) {
      getStreetViewImage(latitude, longitude);
    } else if (selectedAddress) {
      getStreetViewImageFromAddress(selectedAddress);
    }
  }, [selectedAddress, latitude, longitude]);

  const getStreetViewImageFromAddress = (address: string) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK" && results) {
        const coordinates = results[0].geometry.location;
        const lat = coordinates.lat();
        const lng = coordinates.lng();
        getStreetViewImage(lat, lng)
      } else {
        console.error("Geocode was not successful: " + status);
      }
    });
  };

  const getStreetViewImage = (latitude: number, longitude: number) => {
    const YOUR_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Replace with your actual API key
    if (YOUR_API_KEY) {
      const url = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=${YOUR_API_KEY}`;
      setStreetViewUrl(url);
    } else {
      console.error("Google Maps API key is missing.  Please set the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.");
    }
  };

  const handleInputChange = (field: keyof Step1Data, value: string) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    updateFormData({ step1: newData })

    // Update the displayed address for the map
    if (field === 'streetAddress' || field === 'city' || field === 'state') {
      const fullAddress = `${newData.streetAddress}, ${newData.city}, ${newData.state} ${newData.zipcode}`.trim()
      updateSelectedAddress(fullAddress)
      getStreetViewImageFromAddress(fullAddress);
    }
  }

  const handleNext = async () => {
    console.log("Step 1 CONFIRM button clicked. Triggering onStep1NextSubmit.")
    await onStep1NextSubmit(localData); // Await the API call
    onNext();
  }

  const isFormValid = localData.streetAddress && localData.city && localData.state && localData.zipcode;

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-6 py-20 bg-cover bg-center"
      style={{ backgroundImage: `url('https://truepricereport.s3.us-west-1.amazonaws.com/Homepagetruepricereportimage.jpeg')` }}
    >
      <div className="bg-white bg-opacity-90 rounded-2xl p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <Image
            src="https://truepricereport.s3.us-west-1.amazonaws.com/truepricereportlogo.png"
            alt="True Price Report"
            width={200}
            height={60}
            className="h-16 w-auto mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            This is Your Home, Correct?
          </h1>
          <h2 className="text-xl text-[#0f6c0c] mb-8">
            {selectedAddress || "Please confirm your address"}
          </h2>
        </div>

        {/* Street View Image Display */}
        {streetViewUrl && (
          <div className="mb-8">
            <img id="streetview-image" src={streetViewUrl} alt="Street View of the address" className="shadow-md rounded-md" />
          </div>
        )}

        {/* Google Map Display */}
        <div className="mb-8">
          <GoogleMap
            address={selectedAddress}
            className="shadow-md"
          />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-6">Step 1: Confirm Address</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="streetAddress" className="text-gray-700 font-medium">
              Street Address
            </Label>
            <Input
              id="streetAddress"
              value={localData.streetAddress}
              onChange={(e) => handleInputChange("streetAddress", e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="city" className="text-gray-700 font-medium">
              City
            </Label>
            <Input
              id="city"
              value={localData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="state" className="text-gray-700 font-medium">
              State
            </Label>
            <Input
              id="state"
              value={localData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="country" className="text-gray-700 font-medium">
              Country
            </Label>
            <Input
              id="country"
              value={localData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="zipcode" className="text-gray-700 font-medium">
              Zipcode
            </Label>
            <Input
              id="zipcode"
              value={localData.zipcode}
              onChange={(e) => handleInputChange("zipcode", e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </div>

        <Button
          onClick={handleNext}
          disabled={!isFormValid}
          className="bg-[#0f6c0c] hover:bg-[#0d5a0a] text-white px-8 py-3 rounded-md font-medium mt-8 w-full disabled:bg-gray-400"
        >
          CONFIRM
        </Button>

        <p className="text-sm text-gray-600 mt-6">
          By submitting my information in this form, I agree to be contacted by licensed providers. I also agree to be contacted via call or text manual and/or automatic to my cell phone provided, in order to receive the information requested above.
        </p>
      </div>
    </div>
  )
}
