"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleMap } from "@/components/GoogleMap"

interface Step3Data {
  firstName: string
  lastName: string
  phone: string
  email: string
}

interface FormData {
  step3: Step3Data
}

interface Step3Props {
  formData: FormData
  updateFormData: (data: { step3: Step3Data }) => void
  onSubmit: () => void
  onPrevious: () => void
  selectedAddress: string
}

export function Step3({ formData, updateFormData, onSubmit, onPrevious, selectedAddress }: Step3Props) {
  const [localData, setLocalData] = useState<Step3Data>(() => ({
    firstName: formData.step3.firstName || "",
    lastName: formData.step3.lastName || "",
    phone: formData.step3.phone || "",
    email: formData.step3.email || ""
  }))

  const handleInputChange = (field: keyof Step3Data, value: string) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    updateFormData({ step3: newData })
  }

  const handleSubmit = () => {
    if (localData.firstName && localData.lastName && localData.phone && localData.email) {
      onSubmit()
    }
  }

  const isFormValid = localData.firstName && localData.lastName && localData.phone && localData.email

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

        <h3 className="text-xl font-bold text-gray-900 mb-6">Step 3: Confirm Your Information</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="firstName" className="text-gray-700 font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              value={localData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName" className="text-gray-700 font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={localData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-gray-700 font-medium">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={localData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={localData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="mt-1"
              required
            />
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
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="bg-[#0f6c0c] hover:bg-[#0d5a0a] text-white flex-1 px-8 py-3 rounded-md font-medium disabled:bg-gray-400"
          >
            Submit
          </Button>
        </div>

        <p className="text-sm text-gray-600 mt-6">
          By submitting my information in this form, I agree to be contacted by licensed providers. I also agree to be contacted via call or text manual and/or automatic to my cell phone provided, in order to receive the information requested above.
        </p>

        <p className="text-sm text-gray-600 mt-4">
          Upon submission of your information, you will be directed to a home value report sponsored by a Nevada based licensed Sponsor of TruePriceReport to obtain feedback, verify accuracy, answer specific questions related to the report. If you are not based in Nevada or researching Real Estate out of Nevada you may request a local Licensee when contacted. You may opt out of contact at any time. The report is generated using several data aggregators of public information and cannot be guaranteed to be accurate, which is why we will call to correct if you feel price is inaccurate, however the automatic price should not be relied upon for making any financial decisions.
        </p>
      </div>
    </div>
  )
}
