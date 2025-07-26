"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { TraditionalAutocomplete } from "@/components/AddressAutocomplete"
import { useState } from "react"

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
  onAddressSubmit: (address: string, placeDetails?: PlaceDetails) => void
}

export function HeroSection({ onAddressSubmit }: HeroSectionProps) {
  const [selectedAddress, setSelectedAddress] = useState("")

  const handleAddressSelect = (address: string, placeDetails?: PlaceDetails) => {
    setSelectedAddress(address)
    console.log("Selected address:", address)
    if (placeDetails) {
      console.log("Place details:", placeDetails)

      // The placeDetails now comes already formatted from PlaceAutocomplete component
      // Store detailed info for later use
      ;(window as unknown as Record<string, unknown>).selectedAddressDetails = placeDetails
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // If an address has been selected via the PlaceAutocomplete, use it
    if (selectedAddress) {
      const placeDetails = (window as unknown as Record<string, unknown>).selectedAddressDetails as PlaceDetails | undefined;
      onAddressSubmit(selectedAddress, placeDetails)
    } else {
      // Fallback: try to get value from any input in the form
      const addressInput = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement
      const currentAddress = addressInput?.value || "Demo Property Address"
      onAddressSubmit(currentAddress.trim())
    }
  }

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
          <TraditionalAutocomplete
            onAddressSelect={handleAddressSelect}
            placeholder="Enter your home address"
            className="flex-1 h-12 px-4 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0f6c0c] focus:border-transparent"
          />
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
