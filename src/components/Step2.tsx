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
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface Step2Props {
  formData: any //FormData
  updateFormData: (data: any) => void //(data: { step2: Step2Data }) => void
  onNext: () => void
  onPrevious: () => void
  selectedAddress: string
  latitude?: number
  longitude?: number
  unitNumbers?: string[]
  streetViewUrl?: string | null
}

const step2Schema = z.object({
  beds: z.string().min(1, { message: 'Number of beds is required' }),
  baths: z.string().min(1, { message: 'Number of baths is required' }),
  yearBuilt: z.string().min(1, { message: 'Year built is required' }),
  squareFoot: z.string().min(1, { message: 'Square footage is required' }),
  unitNumber: z.string().nullable(),
})

export function Step2({ formData, updateFormData, onNext, onPrevious, selectedAddress, unitNumbers, latitude, longitude, streetViewUrl }: Step2Props) {
  const { register, handleSubmit, formState: { errors }, control, setValue } = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      beds: formData.step2?.beds || "",
      baths: formData.step2?.baths || "",
      yearBuilt: formData.step2?.yearBuilt || "",
      squareFoot: formData.step2?.squareFoot || "",
      unitNumber: formData.step2?.unitNumber || null,
    }
  })

  useEffect(() => {
    // Triggered when unitNumbers changes
    console.log("Unit numbers updated:", unitNumbers)
  }, [unitNumbers])

  const handleNext = (data: z.infer<typeof step2Schema>) => {
    updateFormData({ step2: data })
    onNext()
  }

  const bedsOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9+"]
  const bathsOptions = ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.7", "8", "8.5", "9+"] // Corrected 7.7 to 7.5
  const yearBuiltOptions = Array.from({ length: 124 }, (_, i) => String(2025 - i)) // Years from 1900 to 2024
  const squareFootOptions = ["500-1000", "1000-1500", "1500-2000", "2000-2500", "2500-3000", "3000+"]

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

        <form onSubmit={handleSubmit(handleNext)} className="space-y-6">
          <div>
            <Label htmlFor="yearBuilt" className="text-gray-700 font-medium">
              Year Built{" "}
              {errors.yearBuilt && <span className="text-gray-500">*</span>}
            </Label>
            <Controller
              name="yearBuilt"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
              )}
            />
            {errors.yearBuilt && <p className="text-red-500 text-sm mt-1">{errors.yearBuilt.message}</p>}
          </div>

          <div>
            <Label htmlFor="squareFoot" className="text-gray-700 font-medium">
              Square Footage{" "}
              {errors.squareFoot && <span className="text-gray-500">*</span>}
            </Label>
            <Controller
              name="squareFoot"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
              )}
            />
            {errors.squareFoot && <p className="text-red-500 text-sm mt-1">{errors.squareFoot.message}</p>}
          </div>

          <div>
            <Label htmlFor="beds" className="text-gray-700 font-medium">
              Beds{" "}
              {errors.beds && <span className="text-gray-500">*</span>}
            </Label>
            <Controller
              name="beds"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
              )}
            />
            {errors.beds && <p className="text-red-500 text-sm mt-1">{errors.beds.message}</p>}
          </div>

          <div>
            <Label htmlFor="baths" className="text-gray-700 font-medium">
              Baths{" "}
              {errors.baths && <span className="text-gray-500">*</span>}
            </Label>
            <Controller
              name="baths"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
              )}
            />
            {errors.baths && <p className="text-red-500 text-sm mt-1">{errors.baths.message}</p>}
          </div>
          {/* Unit Number Dropdown */}
          {unitNumbers && unitNumbers.length > 0 && (
            <div>
              <Label htmlFor="unitNumber" className="text-gray-700 font-medium">
                Unit Number
              </Label>
              <Controller
                name="unitNumber"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
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
                )}
              />
            </div>
          )}
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
            onClick={handleSubmit(handleNext)}
            className="bg-[#0f6c0c] hover:bg-[#0d5a0a] text-white flex-1 px-8 py-3 rounded-md font-medium disabled:bg-gray-400"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
