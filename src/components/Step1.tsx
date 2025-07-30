'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleMap } from "@/components/GoogleMap"
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface Step1Props {
  formData: any
  updateFormData: (data: any) => void
  onNext: () => void
  selectedAddress: string
  updateSelectedAddress: (address: string) => void
  onStep1NextSubmit: (addressData: any) => void
  latitude?: number
  longitude?: number
  streetViewUrl?: string | null
  onAddressUpdate: (data: { latitude: number; longitude: number; streetViewUrl: string | null }) => void
}

const step1Schema = z.object({
  streetAddress: z.string()
    .min(1, { message: 'Street address is required' })
    .max(100, { message: 'Street address cannot exceed 100 characters' }),
  unitNumber: z.string().optional(),
  city: z.string()
    .min(1, { message: 'City is required' })
    .max(100, { message: 'City cannot exceed 100 characters' }),
  state: z.string()
    .min(1, { message: 'State is required' })
    .max(100, { message: 'State cannot exceed 100 characters' }),
  country: z.string()
    .min(1, { message: 'Country is required' })
    .max(100, { message: 'Country cannot exceed 100 characters' }),
  zipcode: z.string()
    .min(5, { message: 'Zip code must be at least 5 digits' })
    .max(5, { message: 'Zip code cannot exceed 5 digits' })
    .regex(/^\d{5}$/, { message: 'Invalid zip code format (e.g., 12345)' }),
})

export function Step1({
  formData,
  updateFormData,
  onNext,
  selectedAddress,
  updateSelectedAddress,
  onStep1NextSubmit,
  latitude,
  longitude,
  streetViewUrl,
  onAddressUpdate,
}: Step1Props) {
  const [buttonText, setButtonText] = useState("Update Address");
  const [buttonColor, setButtonColor] = useState("bg-blue-600 hover:bg-blue-700");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, getValues, control } = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      streetAddress: formData.step1?.streetAddress || "",
      unitNumber: formData.step1?.unitNumber || "",
      city: formData.step1?.city || "",
      state: formData.step1?.state || "",
      country: formData.step1?.country || "USA",
      zipcode: formData.step1?.zipcode || ""
    }
  })

  // Watch all fields to reconstruct the full address.
  const watchedFields = useWatch({ control });

  // This effect populates the form when the initial data arrives.
  // It only runs when the core formData.step1 object changes, not on every selectedAddress change.
  useEffect(() => {
    setValue('streetAddress', formData.step1.streetAddress || selectedAddress || "");
    setValue('city', formData.step1.city || "");
    setValue('state', formData.step1.state || "");
    setValue('zipcode', formData.step1.zipcode || "");
    setValue('country', formData.step1.country || "USA");
  }, [formData.step1, setValue]);

  // This effect reconstructs the address and updates the parent state (for display).
  // This is what was causing the loop, but it's now safe because the effect above is more controlled.
  useEffect(() => {
    const { streetAddress, unitNumber, city, state, zipcode, country } = watchedFields;
    // Only update if the necessary fields are present
    if (streetAddress && city && state && zipcode && country) {
        const displayAddress = `${streetAddress}${unitNumber ? ` #${unitNumber}` : ''}, ${city}, ${state} ${zipcode}, ${country}`;
        // To prevent the loop, we check if the update is actually needed.
        if (displayAddress !== selectedAddress) {
            updateSelectedAddress(displayAddress);
        }
    }
  }, [watchedFields, updateSelectedAddress, selectedAddress]);

  const handleVerifyAddress = async () => {
    setButtonText("Address Updated 10");
    setButtonColor("bg-green-600 hover:bg-green-700");
    setIsButtonDisabled(true);

    let countdown = 10;
    const intervalId = setInterval(() => {
      countdown--;
      setButtonText(`Address Updated ${countdown}`);
      if (countdown === 0) {
        clearInterval(intervalId);
        setButtonText("Update Address Again");
        setButtonColor("bg-blue-600 hover:bg-blue-700");
        setIsButtonDisabled(false);
      }
    }, 1000);

    const values = getValues();
    // Update form values before geocoding
    setValue('streetAddress', values.streetAddress);
    setValue('unitNumber', values.unitNumber);
    setValue('city', values.city);
    setValue('state', values.state);
    setValue('zipcode', values.zipcode);
    setValue('country', values.country);

    const fullAddress = `${values.streetAddress}${values.unitNumber ? ` #${values.unitNumber}` : ''}, ${values.city}, ${values.state} ${values.zipcode}, ${values.country}`;
    
    if (window.google) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          const YOUR_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          const newStreetViewUrl = YOUR_API_KEY ? `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&key=${YOUR_API_KEY}`: null;
          
          onAddressUpdate({
            latitude: lat,
            longitude: lng,
            streetViewUrl: newStreetViewUrl,
          });
          updateSelectedAddress(fullAddress);
        } else {
          alert('Could not verify the address. Please check the details and try again.');
        }
      });
    } else {
      alert('Google Maps is not available. Please try again later.');
    }
  };

  const handleNext = async (data: z.infer<typeof step1Schema>) => {
    // Reconstruct the final address from form data to ensure it's up-to-date
    const finalAddress = {
      ...data,
      streetAddress: `${data.streetAddress}${data.unitNumber ? ` #${data.unitNumber}` : ''}`
    }
    
    await onStep1NextSubmit(finalAddress);
    updateFormData({ step1: finalAddress });
    onNext();
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            This is Your Home, Correct?
          </h1>
          <h2 className="text-xl text-[#0f6c0c] mb-8">
            {selectedAddress || "Please confirm your address"}
          </h2>
        </div>

        <div className="mb-8">
          <GoogleMap
            key={selectedAddress}
            address={selectedAddress}
            latitude={latitude}
            longitude={longitude}
            className="shadow-md"
            streetViewUrl={streetViewUrl}
          />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-6">Step 1: Confirm Address</h3>

        <form onSubmit={handleSubmit(handleNext)} className="space-y-4">
          <div>
            <Label htmlFor="streetAddress" className="text-gray-700 font-medium">
              Street Address
              {errors.streetAddress && <span className="text-gray-500">*</span>}
            </Label>
            <Input
              id="streetAddress"
              className="mt-1"
              {...register("streetAddress")}
            />
            {errors.streetAddress && <p className="text-red-500 text-sm mt-1">{errors.streetAddress.message}</p>}
          </div>

          <div>
            <Label htmlFor="unitNumber" className="text-gray-700 font-medium">
              Unit Number (Optional)
            </Label>
            <Input
              id="unitNumber"
              className="mt-1"
              {...register("unitNumber")}
            />
          </div>

          <div>
            <Label htmlFor="city" className="text-gray-700 font-medium">
              City
              {errors.city && <span className="text-gray-500">*</span>}
            </Label>
            <Input
              id="city"
              className="mt-1"
              {...register("city")}
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <Label htmlFor="state" className="text-gray-700 font-medium">
              State
              {errors.state && <span className="text-gray-500">*</span>}
            </Label>
            <Input
              id="state"
              className="mt-1"
              {...register("state")}
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
          </div>

          <div>
            <Label htmlFor="country" className="text-gray-700 font-medium">
              Country
              {errors.country && <span className="text-gray-500">*</span>}
            </Label>
            <Input
              id="country"
              className="mt-1"
              {...register("country")}
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
          </div>

          <div>
            <Label htmlFor="zipcode" className="text-gray-700 font-medium">
              Zipcode
              {errors.zipcode && <span className="text-gray-500">*</span>}
            </Label>
            <Input
              id="zipcode"
              className="mt-1"
              {...register("zipcode")}
            />
            {errors.zipcode && <p className="text-red-500 text-sm mt-1">{errors.zipcode.message}</p>}
          </div>
          
          <Button
            type="button"
            onClick={handleVerifyAddress}
            className={`w-full ${buttonColor} text-white px-8 py-3 rounded-md font-medium`}
            disabled={isButtonDisabled}
          >
            {buttonText}
          </Button>

          <Button
            type="submit"
            className="bg-[#0f6c0c] hover:bg-[#0d5a0a] text-white px-8 py-3 rounded-md font-medium mt-8 w-full disabled:bg-gray-400"
          >
            CONFIRM
          </Button>

          <p className="text-sm text-gray-600 mt-6">
            By submitting my information in this form, I agree to be contacted by licensed providers. I also agree to be contacted via call or text manual and/or automatic to my cell phone provided, in order to receive the information requested above.
          </p>
        </form>
      </div>
    </div>
  )
}
