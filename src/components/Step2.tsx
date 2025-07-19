"use client"

import { useState } from "react"
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
import { GoogleMap } from "@/components/GoogleMap"

interface Step2Data {
  beds: string
  baths: string
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
}

export function Step2({ formData, updateFormData, onNext, onPrevious, selectedAddress }: Step2Props) {
  const [localData, setLocalData] = useState<Step2Data>(() => ({
    beds: formData.step2.beds || "",
    baths: formData.step2.baths || ""
  }))

  const handleSelectChange = (field: keyof Step2Data, value: string) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    updateFormData({ step2: newData })
  }

  const handleNext = () => {
    if (localData.beds && localData.baths) {
      onNext()
    }
  }

  const bedsOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9+"]
  const bathsOptions = ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9+"]

  return (
    <div className="bg-[#cecece] min-h-[80vh] flex items-center justify-center px-6 py-20">
      <div className="bg-white rounded-2xl p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <Image
            src="https://ext.same-assets.com/2983890396/2132483316.png"
            alt="True Price Report"
            width={200}
            height={60}
            className="h-16 w-auto mx-auto mb-6"
          />
        </div>

        {/* Google Map Display */}
        <div className="mb-8">
          <GoogleMap
            address={selectedAddress}
            className="shadow-md"
          />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-6">Step 2: Home Basics</h3>

        <div className="space-y-6">
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
            disabled={!localData.beds || !localData.baths}
            className="bg-[#0f6c0c] hover:bg-[#0d5a0a] text-white flex-1 px-8 py-3 rounded-md font-medium disabled:bg-gray-400"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
