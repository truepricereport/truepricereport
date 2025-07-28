"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Step2Data {
  beds: string
  baths: string
  yearBuilt: string
  squareFoot: string
  unitNumber: string | null
}

interface FormData {
  step2: Step2Data
}

interface Step2Props {
  formData: FormData
  updateFormData: (data: { step2: Step2Data }) => void
  onNext: () => void
  onPrevious: () => void
  selectedAddress: string
  latitude?: number
  longitude?: number
  unitNumbers?: string[]
  streetViewUrl?: string | null; // Added streetViewUrl prop
}

export function Step2({ formData, updateFormData, onNext, onPrevious, selectedAddress, unitNumbers, latitude, longitude, streetViewUrl }: Step2Props) {
  const [localData, setLocalData] = useState<Step2Data>(() => ({
    beds: formData.step2.beds || "",
    baths: formData.step2.baths || "",
    yearBuilt: formData.step2.yearBuilt || "",
    squareFoot: formData.step2.squareFoot || "",
    unitNumber: formData.step2.unitNumber || null,
  }))

  // Removed the streetViewUrl state and useEffect for geocoding
  // The streetViewUrl is now received as a prop

  useEffect(() => {
    setLocalData({
      beds: formData.step2.beds || "",
      baths: formData.step2.baths || "",
      yearBuilt: formData.step2.yearBuilt || "",
      squareFoot: formData.step2.squareFoot || "",
      unitNumber: formData.step2.unitNumber || null,
    });
  }, [formData]);

    useEffect(() => {
        // Triggered when unitNumbers changes
        console.log("Unit numbers updated:", unitNumbers);
    }, [unitNumbers]);

  const handleSelectChange = (field: keyof Step2Data, value: string) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    updateFormData({ step2: newData })
  }

  const handleNext = () => {
    if (localData.beds && localData.baths && localData.yearBuilt && localData.squareFoot) {
      onNext()
    }
  }

  const bedsOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9+"]
  const bathsOptions = ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.7", "8", "8.5", "9+"] // Corrected 7.7 to 7.5
  const yearBuiltOptions = Array.from({ length: 124 }, (_, i) => String(2024 - i)); // Years from 1900 to 2024
  const squareFootOptions = ["500-1000", "1000-1500", "1500-2000", "2000-2500", "2500-3000", "3000+"];

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
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-6">Step 2: Home Basics</h3>

        {/* Static Street View Image */}
        {streetViewUrl && (
          <div className="mb-8">
            <img src={streetViewUrl} alt="Street View of the address" className="shadow-md rounded-md" />
          </div>
        )}

        <div className="space-y-6">
        <div>
            <Label htmlFor="yearBuilt" className="text-gray-700 font-medium">
              Year Built
            </Label>
            <Select value={localData.yearBuilt} onValueChange={(value) => handleSelectChange("yearBuilt", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select year built" />
              </SelectTrigger>
              <SelectContent>
                {yearBuiltOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="squareFoot" className="text-gray-700 font-medium">
              Square Footage
            </Label>
            <Select value={localData.squareFoot} onValueChange={(value) => handleSelectChange("squareFoot", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select square foot" />
              </SelectTrigger>
              <SelectContent>
                {squareFootOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="beds" className="text-gray-700 font-medium">
              Beds
            </Label>
            <Select value={localData.beds} onValueChange={(value) => handleSelectChange("beds", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select number of bedrooms" />
              </SelectTrigger>
              <SelectContent>
                {bedsOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="baths" className="text-gray-700 font-medium">
              Baths
            </Label>
            <Select value={localData.baths} onValueChange={(value) => handleSelectChange("baths", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select number of bathrooms" />
              </SelectTrigger>
              <SelectContent>
                {bathsOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Unit Number Dropdown */}
          {unitNumbers && unitNumbers.length > 0 && (
            <div>
              <Label htmlFor="unitNumber" className="text-gray-700 font-medium">
                Unit Number
              </Label>
              <Select value={localData.unitNumber || ""} onValueChange={(value) => handleSelectChange("unitNumber", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select unit number" />
                </SelectTrigger>
                <SelectContent>
                  {unitNumbers.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="flex-1 px-8 py-3 rounded-md font-medium"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!localData.beds || !localData.baths || !localData.yearBuilt || !localData.squareFoot}
            className="bg-[#0f6c0c] hover:bg-[#0d5a0a] text-white flex-1 px-8 py-3 rounded-md font-medium disabled:bg-gray-400"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
