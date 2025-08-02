/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleMap } from "@/components/GoogleMap"
import { TraditionalAutocomplete } from "@/components/AddressAutocomplete"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { PlaceDetails } from "../types/index";

// Define the props for the Step1 component
interface Step1Props {
  formData: any
  updateFormData: (data: any) => void
  onNext: () => void
  selectedAddress: string
  updateSelectedAddress: (address: string) => void
  onStep1NextSubmit: (addressData: any) => void
  placeDetails?: PlaceDetails
  latitude?: number
  longitude?: number
  streetViewUrl?: string | null
  onAddressUpdate: (data: { latitude: number; longitude: number; streetViewUrl: string | null }) => void
}

// Define the schema for Step1 form validation using Zod
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
  placeDetails,
  longitude,
  streetViewUrl,
  onAddressUpdate,
}: Step1Props) {
  // State variables for the "Update Address" button
  const [buttonText, setButtonText] = useState("Update Address");
  const [buttonColor, setButtonColor] = useState("bg-blue-600 hover:bg-blue-700");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Initialize react-hook-form
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

  // This effect populates the form when the initial data arrives.
  // It only runs when the core formData.step1 object changes, not on every selectedAddress change.
  useEffect(() => {
    console.log("Step1Log-formData.step1 changed, updating form values:", formData.step1);
    // Prioritize formData if available, otherwise use selectedAddress/placeDetails
    if (formData.step1 && Object.keys(formData.step1).length > 0) {
      setValue('streetAddress', formData.step1.streetAddress || "");
      setValue('unitNumber', formData.step1.unitNumber || "");
      setValue('city', formData.step1.city || "");
      setValue('state', formData.step1.state || "");
      setValue('zipcode', formData.step1.zipcode || "");
      setValue('country', formData.step1.country || "USA");
    } else if (placeDetails) {
       // Construct streetAddress from components, handling potential unit number
      const streetAddress = `${placeDetails.streetNumber} ${placeDetails.route}${placeDetails.unitNumber ? ` #${placeDetails.unitNumber}` : ''}`;
      setValue('streetAddress', streetAddress);
      setValue('unitNumber', placeDetails.unitNumber || "");
      setValue('city', placeDetails.city || "");
      setValue('state', placeDetails.state || "");
      setValue('zipcode', placeDetails.zipcode || "");
      setValue('country', placeDetails.country || "USA");
    } else {
       setValue('streetAddress', selectedAddress || "");
    }
  }, [formData.step1, setValue, selectedAddress, placeDetails]);

  // Handler for verifying the address using Google Geocoding API
  const handleVerifyAddress = async () => {
    console.log("Step1Log-Verifying address...");
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
    console.log("Step1Log-Current form values for verification:", values);

    // Update form values before geocoding (though values are already up-to-date from getValues())
    setValue('streetAddress', values.streetAddress);
    setValue('unitNumber', values.unitNumber);
    setValue('city', values.city);
    setValue('state', values.state);
    setValue('zipcode', values.zipcode);
    setValue('country', values.country);

    const fullAddress = `${values.streetAddress}${values.unitNumber ? ` #${values.unitNumber}` : ''}, ${values.city}, ${values.state} ${values.zipcode}, ${values.country}`;
    console.log("Step1Log-Full address for geocoding:", fullAddress);
    
    if (window.google) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          console.log("Step1Log-Geocoding successful:", results);
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
          console.log("Step1Log-Address updated with new coordinates and Street View URL.");

          // Update formData.step1 with the new address values
          updateFormData({
            step1: {
              ...values,
            },
          });

        } else {
          console.error("Step1Log-Geocoding failed:", status, results);
          alert('Could not verify the address. Please check the details and try again.');
        }
      });
    } else {
      console.warn("Step1Log-Google Maps API not loaded.");
      alert('Google Maps is not available. Please try again later.');
    }
  };

  // Handler for when an address is selected from the Autocomplete
  const handleAutocompleteSelect = (address: string, placeDetails?: PlaceDetails) => {
    console.log("Step1Log-Autocomplete selected:", address, placeDetails);
    updateSelectedAddress(address); // Update the main selectedAddress state

    if (placeDetails) {
      // Populate form fields with details from autocomplete
      const streetAddress = `${placeDetails.streetNumber} ${placeDetails.route}${placeDetails.unitNumber ? ` #${placeDetails.unitNumber}` : ''}`;
      setValue('streetAddress', streetAddress);
      setValue('unitNumber', placeDetails.unitNumber || "");
      setValue('city', placeDetails.city || "");
      setValue('state', placeDetails.state || "");
      setValue('zipcode', placeDetails.zipcode || "");
      setValue('country', placeDetails.country || "USA");
      handleVerifyAddress(); // Trigger address verification
    }
  };

  // Handler for proceeding to the next step
  const handleNext = async (data: z.infer<typeof step1Schema>) => {
    console.log("Step1Log-Proceeding to next step with form data:", data);
     // Reconstruct the full address from the form data
    const fullAddress = `${data.streetAddress}${data.unitNumber ? ` #${data.unitNumber}` : ''}, ${data.city}, ${data.state} ${data.zipcode}, ${data.country}`;
    console.log("Step1Log-Full address to update selectedAddress:", fullAddress);

    // Reconstruct the final address from form data to ensure it's up-to-date
    const finalAddress = {
      ...data,
      streetAddress: `${data.streetAddress}${data.unitNumber ? ` #${data.unitNumber}` : ''}`
    }
    console.log("Step1Log-Final address object for submission:", finalAddress);
    console.log("Step1Log-Final streetAddress for submission:", finalAddress.streetAddress);
    
    onStep1NextSubmit(finalAddress);
    updateFormData({ step1: finalAddress });
    onNext();
    console.log("Step1Log-Step1 form submitted and data updated.");
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
          {/* Display the currently selected address */}
          <h2 className="text-xl text-[#0f6c0c] mb-8">
            {selectedAddress || "Please confirm your address"}
          </h2>
        </div>

        {/* Google Map component to display the address location */}
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

        {/* Address confirmation form */}
        <form onSubmit={handleSubmit(handleNext)} className="space-y-4">
          {/* Street Address Input */}
          <div>
            <Label htmlFor="streetAddress" className="text-gray-700 font-medium">
              Street Address
              {errors.streetAddress && <span className="text-gray-500">*</span>}
            </Label>
            <TraditionalAutocomplete
              id="streetAddress"
              onAddressSelect={handleAutocompleteSelect}
              placeholder="Update or confirm your home address"
              className="w-full h-12 px-4 text-base border border-gray-300 rounded-md outline-none transition-all focus:border-green-600 focus:ring-2 focus:ring-green-600/20 mt-1"
               // We don't use {...register} directly on TraditionalAutocomplete.
            />
            {errors.streetAddress && <p className="text-red-500 text-sm mt-1">{errors.streetAddress.message}</p>}
          </div>

          {/* Unit Number Input (Optional) */}
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

          {/* City Input */}
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

          {/* State Input */}
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

          {/* Country Input */}
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

          {/* Zipcode Input */}
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
          
          {/* Button to verify address, with dynamic text and color */}
          <Button
            type="button"
            onClick={handleVerifyAddress}
            className={`w-full ${buttonColor} text-white px-8 py-3 rounded-md font-medium`}
            disabled={isButtonDisabled}
          >
            {buttonText}
          </Button>

          {/* Button to confirm and proceed to the next step */}
          <Button
            type="submit"
            className="bg-[#0f6c0c] hover:bg-[#0d5a0a] text-white px-8 py-3 rounded-md font-medium mt-8 w-full disabled:bg-gray-400"
          >
            CONFIRM
          </Button>

          {/* Disclaimer text */}
          <p className="text-sm text-gray-600 mt-6">
            By submitting my information in this form, I agree to be contacted by licensed providers. I also agree to be contacted via call or text manual and/or automatic to my cell phone provided, in order to receive the information requested above.
          </p>
        </form>
      </div>
    </div>
  )
}