"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface Step3Props {
  formData: any
  updateFormData: (data: any) => void
  onSubmit: () => void
  onPrevious: () => void
  selectedAddress: string
  latitude?: number
  longitude?: number
  streetViewUrl?: string | null
}

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

export function Step3({ formData, updateFormData, onSubmit, onPrevious, selectedAddress, latitude, longitude, streetViewUrl }: Step3Props) {
  const { register, handleSubmit, formState: { errors }, control } = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      firstName: formData.step3?.firstName || "",
      lastName: formData.step3?.lastName || "",
      phone: formData.step3?.phone || "",
      email: formData.step3?.email || ""
    }
  })

  const handleValidSubmit = (data: z.infer<typeof step3Schema>) => {
    updateFormData({ step3: data })
    onSubmit()
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

        {/* Static Street View Image */}
        {streetViewUrl && (
          <div className="mb-8">
            <img src={streetViewUrl} alt="Street View of the address" className="shadow-md rounded-md" />
          </div>
        )}

        <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4">
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

        <div className="flex gap-4 mt-8">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="flex-1 px-8 py-3 rounded-md font-medium"
          >
            Previous
          </Button>
          <Button
            onClick={handleSubmit(handleValidSubmit)}
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
