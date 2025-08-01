"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Define the props for the Step3 component
interface Step3Props {
  formData: any
  updateFormData: (data: any) => void
  onSubmit: () => void
  onPrevious: () => void
  selectedAddress: string
  latitude?: number
  longitude?: number
  streetViewUrl?: string | null
  sendLeadToBrivity: (payload: any) => Promise<any>; // Add sendLeadToBrivity prop
}

// Define the schema for Step3 form validation using Zod
const step3Schema = z.object({
  firstName: z.string()
    .min(1, { message: 'First name is required' })
    .max(50, { message: 'First name cannot exceed 50 characters' }),
  lastName: z.string()
    .min(1, { message: 'Last name is required' })
    .max(50, { message: 'Last name cannot exceed 50 characters' }),
    phone: z.string()
    .regex(/^(?:\+1)?\d{10}$|^\d{10}$/, { message: 'Invalid phone number format (e.g., +1(xxx)xxx-xxxx)' })
    .nonempty({ message: 'Phone number is required' }),
    email: z.string().email({ message: 'Invalid email format' }),
})

export function Step3({ formData, updateFormData, onSubmit, onPrevious, selectedAddress, latitude, longitude, streetViewUrl, sendLeadToBrivity }: Step3Props) {
  // Initialize react-hook-form with Zod resolver and default values from formData
  const { register, handleSubmit, formState: { errors }, control } = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: useMemo(() => ({
      firstName: formData.step3?.firstName || "",
      lastName: formData.step3?.lastName || "",
      phone: formData.step3?.phone || "",
      email: formData.step3?.email || ""
    }), [formData.step3])
  })

  // Handler for successful form submission
  const handleValidSubmit = async (data: z.infer<typeof step3Schema>) => {
    console.log("Step3 form valid and submitting data:", data);
    updateFormData({ step3: data })

    // Prepare the payload for sending to Brivity
    const payload = {
      // primary_agent_id is now handled securely by the Lambda function
      lead_type: "lead from webpage trueprice report",
      status: "new",
      source: "TruepriceReport",
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      street_address: formData.step1.streetAddress,
      city: formData.step1.city,
      locality: formData.step1.state,
      postal_code: formData.step1.zipcode,
      country: formData.step1.country,
      description: `Property Details - Bedrooms: ${formData.step2.beds}, Bathrooms: ${formData.step2.baths}, Year Built: ${formData.step2.yearBuilt}, Square Foot: ${formData.step2.squareFoot} Price Estimate: ${formData.step1.priceEstimate}, Low Estimate: ${formData.step1.lowEstimate}, High Estimate: ${formData.step1.highEstimate}${formData.step2.unitNumber ? ", Unit Number: " + formData.step2.unitNumber : ""}`
    }

    // Send lead data to Brivity asynchronously
    sendLeadToBrivity(payload);

    onSubmit(); // Transition to the Results page immediately
    console.log("Step3 data updated and proceeding to final submission.");
  }

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

        <h3 className="text-xl font-bold text-gray-900 mb-6">Step 3: Confirm Your Information</h3>

        {/* Display static Street View Image if available */}
        {streetViewUrl && (
          <div className="mb-8">
            <img src={streetViewUrl} alt="Street View of the address" className="shadow-md rounded-md" />
          </div>
        )}

        {/* Form for personal information */}
        <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4">
          {/* First Name Input */}
          <div>
            <Label htmlFor="firstName" className="text-gray-700 font-medium">
              First Name{" "}
              {errors.firstName && <span className="text-gray-500">*</span>}
            </Label>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  id="firstName"
                  className="mt-1"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>

          {/* Last Name Input */}
          <div>
            <Label htmlFor="lastName" className="text-gray-700 font-medium">
              Last Name{" "}
              {errors.lastName && <span className="text-gray-500">*</span>}
            </Label>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  id="lastName"
                  className="mt-1"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>

          {/* Phone Number Input */}
          <div>
            <Label htmlFor="phone" className="text-gray-700 font-medium">
              Phone{" "}
              {errors.phone && <span className="text-gray-500">*</span>}
            </Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  id="phone"
                  type="tel"
                  className="mt-1"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          {/* Email Input */}
          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email{" "}
              {errors.email && <span className="text-gray-500">*</span>}
            </Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  id="email"
                  type="email"
                  className="mt-1"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
        </form>

        {/* Navigation buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={() => { console.log("Previous button clicked in Step3."); onPrevious(); }}
            variant="outline"
            className="flex-1 px-8 py-3 rounded-md font-medium"
          >
            Previous
          </Button>
          <Button
            onClick={() => { console.log("Submit button clicked in Step3."); handleSubmit(handleValidSubmit)(); }}
            className="bg-[#0f6c0c] hover:bg-[#0d5a0a] text-white flex-1 px-8 py-3 rounded-md font-medium disabled:bg-gray-400"
          >
            Submit
          </Button>
        </div>

        {/* Disclaimer texts */}
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
