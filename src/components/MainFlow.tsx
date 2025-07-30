/**
 * This is the main flow of the application.
 */

"use client"

import { useState } from "react"
import { HeroSection } from "./HeroSection"
import { Step1 } from "./Step1"
import { Step2 } from "./Step2"
import { Step3 } from "./Step3"
import { ResultsPage } from "./ResultsPage"

type FlowStep = "hero" | "step1" | "step2" | "step3" | "results"

interface PlaceDetails {
  fullAddress: string
  streetNumber: string
  unitNumber: string // include unitNumber
  route: string
  city: string
  state: string
  country: string
  zipcode: string
  latitude?: number
  longitude?: number
}

interface FormData {
  selectedAddress: string
  latitude?: number
  longitude?: number
  streetViewUrl?: string | null; // Added streetViewUrl to formData
  step1: {
    streetAddress: string
    city: string
    state: string
    country: string
    zipcode: string;
    priceEstimate?: string;
    lowEstimate?: string;
    highEstimate?: string;
    valuationStatus?: "available" | "unavailable";
    unitNumber?: string;
  }
  step2: {
    beds: string
    baths: string
    yearBuilt: string
    squareFoot: string
    unitNumber: string | null // add unitNumber in formdata
  }
  step3: {
    firstName: string
    lastName: string
    phone: string
    email: string
  }
  unitNumbers?: string[] // add unitNumbers to form data
}

interface LeadInfo {
  email: string
  initialDescription: string
}

export function MainFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("hero")
  const [formData, setFormData] = useState<FormData>({
    selectedAddress: "",
    latitude: undefined,
    longitude: undefined,
    streetViewUrl: null, // Initialize streetViewUrl in state
    step1: {
      streetAddress: "",
      city: "",
      state: "",
      country: "USA",
      zipcode: ""
    },
    step2: {
      beds: "",
      baths: "",
      yearBuilt: "",
      squareFoot: "",
      unitNumber: null,
    },
    step3: {
      firstName: "",
      lastName: "",
      phone: "",
      email: ""
    },
    unitNumbers: []
  })
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null) // To store email and initial description

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const updateSelectedAddress = (address: string) => {
    setFormData(prev => ({ ...prev, selectedAddress: address }))
  }

  const handleAddressSubmit = (address: string, placeDetails?: PlaceDetails, streetViewUrl?: string | null) => { // Modified to accept streetViewUrl
    // Get detailed address info if available

    let step1Data = { ...formData.step1, streetAddress: address }

    if (placeDetails) {
      // Auto-populate Step 1 fields with detailed address components
      step1Data = {
        streetAddress: `${placeDetails.streetNumber} ${placeDetails.route}`.trim() || address,
        city: placeDetails.city || "",
        state: placeDetails.state || "",
        country: placeDetails.country || "USA",
        zipcode: placeDetails.zipcode || "",
        unitNumber: placeDetails.unitNumber || ""
      }

      setFormData(prev => ({
        ...prev,
        selectedAddress: address,
        latitude: placeDetails.latitude,
        longitude: placeDetails.longitude,
        streetViewUrl: streetViewUrl, // Store streetViewUrl in formData
        step1: step1Data
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        selectedAddress: address,
        streetViewUrl: streetViewUrl, // Store streetViewUrl even if no placeDetails
        step1: step1Data
      }))
    }

    setCurrentStep("step1")
  }

  const handleAddressUpdate = (newAddressData: {
    latitude: number;
    longitude: number;
    streetViewUrl: string | null;
  }) => {
    setFormData(prev => ({
      ...prev,
      ...newAddressData,
    }));
  };
  
  const sendLeadToBrivity = async (payload: any, isUpdate: boolean = false) => {
    console.log(`Sending lead data to Brivity (isUpdate: ${isUpdate}):`, payload)
    try {
      const awsApiGatewayUrl = process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL;
      if (!awsApiGatewayUrl) {
        console.error("AWS API Gateway URL is not set. Please check NEXT_PUBLIC_AWS_API_GATEWAY_URL environment variable.");
        return { success: false, error: "AWS API Gateway URL not configured." };
      }

      // Actual fetch call to AWS API Gateway proxy
      const response = await fetch(awsApiGatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json()
      console.log("Brivity API Response via Proxy:", data)

      if (response.ok) {
        return { success: true, data }
      } else {
        console.error("Brivity API Error via Proxy:", data)
        return { success: false, error: data }
      }
    } catch (error) {
      console.error("Error sending lead to Brivity via Proxy:", error)
      return { success: false, error }
    }
  }

  const handleStep1NextSubmit = async (addressData: FormData['step1']) => {
    console.log("Attempting to fetch property info for Step 1 CONFIRM button:", addressData);
    
    // Immediately transition to Step 2
    goToStep2();

    try {
      const corelogicApiGatewayUrl = process.env.NEXT_PUBLIC_CORELOGIC_API_GATEWAY_URL;
      if (!corelogicApiGatewayUrl) {
        console.error("CoreLogic API Gateway URL is not set. Please check NEXT_PUBLIC_CORELOGIC_API_GATEWAY_URL environment variable.");
        alert("Property estimation service not configured.");
        return { success: false, error: "CoreLogic API Gateway URL not configured." };
      }

      const payload = {
        streetAddress: addressData.streetAddress,
        zipcode: addressData.zipcode,
      };

      console.log("Sending property info payload to CoreLogic proxy:", payload);

      const response = await fetch(corelogicApiGatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("CoreLogic API Response via Proxy:", data);

      let unitNumbers: string[] = []; // Initialize unitNumbers

      if (response.status === 200) {
        // Valuation available
        unitNumbers = data.unitNumbers || []; // Extract unitNumbers from the response

        setFormData(prev => ({
          ...prev,
          step1: {
            ...prev.step1,
            priceEstimate: data.priceEstimate || undefined,
            lowEstimate: data.lowEstimate || undefined,
            highEstimate: data.highEstimate || undefined,
            valuationStatus: "available"
          },
          unitNumbers: unitNumbers // Store unitNumbers in formData
        }));
      } else if (response.status === 404 || response.status === 500) { // Also handle 500
        // Valuation unavailable or internal server error
        setFormData(prev => ({
          ...prev,
          step1: {
            ...prev.step1,
            priceEstimate: undefined,
            lowEstimate: undefined,
            highEstimate: undefined,
            valuationStatus: "unavailable"
          },
          unitNumbers: [] // Ensure unitNumbers is always an array
        }));
        // Log 500 errors to the console, but do not show an alert
        if (response.status === 500) {
           console.error(`An internal server error occurred while fetching property estimate. Status: ${response.status}`);
        }
      } else {
        // Handle other unexpected status codes
        console.error("CoreLogic API Error via Proxy:", data);
        alert(`Failed to get property estimate. Unexpected error: ${response.status}`);
        return { success: false, error: data };
      }

      if (response.ok || response.status === 404 || response.status === 500) { // Proceed for 200, 404, and 500
        return { success: true, data };
      } else {
         console.error("CoreLogic API Error via Proxy:", data);
         alert(`Failed to get property estimate. Unexpected error: ${response.status}`);
        return { success: false, error: data };
      }

    } catch (error) {
      console.error("Error fetching property info via CoreLogic proxy:", error);
      alert("Error fetching property estimate.");
      return { success: false, error };
    }
  };

  const handleFinalSubmit = async () => {
    console.log("Final form data:", formData)

    const initialDescription = `Property Details - Bedrooms: ${formData.step2.beds}, Bathrooms: ${formData.step2.baths}, Year Built: ${formData.step2.yearBuilt}, Square Foot: ${formData.step2.squareFoot} Price Estimate: ${formData.step1.priceEstimate}, Low Estimate: ${formData.step1.lowEstimate}, High Estimate: ${formData.step1.highEstimate}${formData.step2.unitNumber ? ", Unit Number: " + formData.step2.unitNumber : ""}`;

    const payload = {
      // primary_agent_id is now handled securely by the Lambda function
      lead_type: "lead from webpage trueprice report",
      status: "new",
      source: "TruepriceReport",
      first_name: formData.step3.firstName,
      last_name: formData.step3.lastName,
      email: formData.step3.email,
      phone: formData.step3.phone,
      street_address: formData.step1.streetAddress,
      city: formData.step1.city,
      locality: formData.step1.state,
      postal_code: formData.step1.zipcode,
      country: formData.step1.country,
      description: initialDescription
    }

    const result = await sendLeadToBrivity(payload)
    if (result.success) {
        setLeadInfo({
            email: formData.step3.email, // Use email from payload if available
            initialDescription: ''
        })
      setCurrentStep("results")
    } else {
      alert("Failed to submit lead. Please try again.")
    }
  }

  const handleUpdateDescription = async (newDescriptionPart: string) => {
    if (leadInfo) {
      const payload = {
        // primary_agent_id is now handled securely by the Lambda function
        email: leadInfo.email,
        description: newDescriptionPart
      }
      const result = await sendLeadToBrivity(payload, true)
      if (result.success) {
        console.log("Description updated successfully.")
      } else {
        console.error("Failed to update description.")
      }
    } else {
      console.warn("No lead info found to update description.")
    }
  }

  const goToStep2 = () => setCurrentStep("step2")
  const goToStep3 = () => setCurrentStep("step3")
  const goToStep1 = () => setCurrentStep("step1")
  const goToStep2FromStep3 = () => setCurrentStep("step2")

  switch (currentStep) {
    case "hero":
      return <HeroSection onAddressSubmit={handleAddressSubmit} />

    case "step1":
      return (
        <Step1
          formData={formData}
          updateFormData={updateFormData}
          onNext={goToStep2}
          selectedAddress={formData.selectedAddress}
          updateSelectedAddress={updateSelectedAddress}
          onStep1NextSubmit={handleStep1NextSubmit}
          streetViewUrl={formData.streetViewUrl} // Pass streetViewUrl to Step1
          onAddressUpdate={handleAddressUpdate} // Pass the new handler to Step1
        />
      )

    case "step2":
      return (
        <Step2
          formData={formData}
          updateFormData={updateFormData}

          onNext={goToStep3}
          onPrevious={goToStep1}
          selectedAddress={formData.selectedAddress}
          latitude={formData.latitude}
          longitude={formData.longitude}
          unitNumbers={formData.unitNumbers}
          streetViewUrl={formData.streetViewUrl} // Pass streetViewUrl to Step2
        />
      )

    case "step3":
      return (
        <Step3
          formData={formData}
          updateFormData={updateFormData}
          onSubmit={handleFinalSubmit}
          onPrevious={goToStep2FromStep3}
          selectedAddress={formData.selectedAddress}
          latitude={formData.latitude}
          longitude={formData.longitude}
          streetViewUrl={formData.streetViewUrl} // Pass streetViewUrl to Step3
        />
      )

    case "results":
      return <ResultsPage formData={formData} onUpdateDescription={handleUpdateDescription} streetViewUrl={formData.streetViewUrl} /> // Pass streetViewUrl to ResultsPage

    default:
      return <HeroSection onAddressSubmit={handleAddressSubmit} />
  }
}
