"use client"

import { useState } from "react"
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
}

export function Step1({ formData, updateFormData, onNext, selectedAddress, updateSelectedAddress }: Step1Props) {
  const [localData, setLocalData] = useState<Step1Data>(() => ({
    streetAddress: selectedAddress || formData.step1.streetAddress || "",
    city: formData.step1.city || "",
    state: formData.step1.state || "",
    country: formData.step1.country || "USA",
    zipcode: formData.step1.zipcode || ""
  }))

  const handleInputChange = (field: keyof Step1Data, value: string) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    updateFormData({ step1: newData })

    // Update the displayed address for the map
    if (field === 'streetAddress' || field === 'city' || field === 'state') {
      const fullAddress = `${newData.streetAddress}, ${newData.city}, ${newData.state} ${newData.zipcode}`.trim()
      updateSelectedAddress(fullAddress)
    }
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-6 py-20 bg-cover bg-center"
      style={{ backgroundImage: `url('https://truepricereport.com/wp-content/plugins/mts-real-estate-equity/public/images/soldbybrenkus_bg.jpeg')` }}
    >
      <div className="bg-white bg-opacity-90 rounded-2xl p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <Image
            src="https://ext.same-assets.com/2983890396/2132483316.png"
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
          className="bg-[#0f6c0c] hover:bg-[#0d5a0a] text-white px-8 py-3 rounded-md font-medium mt-8 w-full"
        >
          Next
        </Button>

        <p className="text-sm text-gray-600 mt-6">
          By submitting my information in this form, I agree to be contacted by licensed providers. I also agree to be contacted via call or text manual and/or automatic to my cell phone provided, in order to receive the information requested above.
        </p>
      </div>
    </div>
  )
}
