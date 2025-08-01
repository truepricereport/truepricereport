/**
 * This is the main flow of the application. It manages the state and progression
 * through different steps of the property estimation process, from address input
 * to displaying results.
 */

"use client"

import { useState } from "react"
import { HeroSection } from "./HeroSection"
import { Step1 } from "./Step1"
import { Step2 } from "./Step2"
import { Step3 } from "./Step3"
import { ResultsPage } from "./ResultsPage"
import { PlaceDetails } from "../types/index";

// Define the different steps in the application flow
type FlowStep = "hero" | "step1" | "step2" | "step3" | "results"

// Define the structure of the form data collected across all steps
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
    valuationStatusAvailable: boolean | null;
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
  unitNumbers?: string[] // add unitNumbers to form data, for properties with multiple units
}

// Define the structure for lead information sent to external services (e.g., Brivity)
interface LeadInfo {
  email: string
  initialDescription: string
}

export function MainFlow() {
  // State to manage the current step in the application flow
  const [currentStep, setCurrentStep] = useState<FlowStep>("hero")
  // State to store all form data collected throughout the steps
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
      zipcode: "",
      priceEstimate: undefined,
      lowEstimate: undefined,
      highEstimate: undefined,
      valuationStatusAvailable: null,
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
  // State to store lead information after submission, used for subsequent updates
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null)

  // Function to update any part of the formData state
  const updateFormData = (data: Partial<FormData>) => {
    console.log("updateFormData-mainFlowLog-Updating form data:", data);
    setFormData(prev => ({ ...prev, ...data }))
  }

  // Function to update the selected address, specifically used by autocomplete
  const updateSelectedAddress = (address: string) => {
    console.log("updateSelectedAddress-mainFlowLog-Updating selected address:", address);
    setFormData(prev => ({ ...prev, selectedAddress: address }))
  }

  // Handler for when an address is submitted from the HeroSection
  const handleAddressSubmit = (address: string, placeDetails?: PlaceDetails, streetViewUrl?: string | null) => {
    console.log("handleAddressSubmit-mainFlowLog-Address submitted from HeroSection:", address, "Place Details:", placeDetails, "Street View URL:", streetViewUrl);

    let step1Data = { ...formData.step1, streetAddress: address }

    if (placeDetails) {
      // If place details are available, populate Step 1 fields with more specific data
      step1Data = {
        streetAddress: `${placeDetails.streetNumber} ${placeDetails.route}`.trim() || address,
        city: placeDetails.city || "",
        state: placeDetails.state || "",
        country: placeDetails.country || "USA",
        zipcode: placeDetails.zipcode || "",
        unitNumber: placeDetails.unitNumber || "",
        valuationStatusAvailable: null, // Reset valuation status on new address submit
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
      // If no detailed place details, just update the selected address and street view URL
      setFormData(prev => ({
        ...prev,
        selectedAddress: address,
        streetViewUrl: streetViewUrl, // Store streetViewUrl even if no placeDetails
        step1: step1Data
      }))
    }

    setCurrentStep("step1") // Move to Step 1
    console.log("handleAddressSubmit-mainFlowLog-Moved to Step 1 after address submission.");
  }

  // Handler to update latitude, longitude, and streetViewUrl, typically from Step1's address verification
  const handleAddressUpdate = (newAddressData: {
    latitude: number;
    longitude: number;
    streetViewUrl: string | null;
  }) => {
    console.log("handleAddressUpdate-mainFlowLog-Address data updated (latitude, longitude, streetViewUrl):", newAddressData);
    setFormData(prev => ({
      ...prev,
      ...newAddressData,
    }));
  };
  
  // Function to send lead data to Brivity CRM via AWS API Gateway
  const sendLeadToBrivity = async (payload: any, isUpdate: boolean = false) => {
    console.log(`sendLeadToBrivity-mainFlowLog-Sending lead data to Brivity (isUpdate: ${isUpdate}):`, payload)
    try {
      const awsApiGatewayUrl = process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL;
      if (!awsApiGatewayUrl) {
        console.error("sendLeadToBrivity-mainFlowLog-AWS API Gateway URL is not set. Please check NEXT_PUBLIC_AWS_API_GATEWAY_URL environment variable.");
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
      console.log("sendLeadToBrivity-mainFlowLog-Brivity API Response via Proxy:", data)

      if (response.ok) {
        console.log("sendLeadToBrivity-mainFlowLog-Lead successfully sent/updated in Brivity.");
        return { success: true, data }
      } else {
        console.error("sendLeadToBrivity-mainFlowLog-Brivity API Error via Proxy:", data)
        return { success: false, error: data }
      }
    } catch (error) {
      console.error("sendLeadToBrivity-mainFlowLog-Error sending lead to Brivity via Proxy:", error)
      return { success: false, error }
    }
  }

  // Handler for submitting Step 1 data (address confirmation)
  const handleStep1NextSubmit = async (addressData: FormData['step1']) => {
    console.log("handleStep1NextSubmit-mainFlowLog-Attempting to fetch property info for Step 1 CONFIRM button:", addressData);
    console.log("handleStep1NextSubmit-mainFlowLog-streetAddress from Step 1 CONFIRM button:", addressData.streetAddress);
    
    // Immediately transition to Step 2, to provide a faster user experience
    goToStep2();

    try {
      const corelogicApiGatewayUrl = process.env.NEXT_PUBLIC_CORELOGIC_API_GATEWAY_URL;
      if (!corelogicApiGatewayUrl) {
        console.error("handleStep1NextSubmit-mainFlowLog-CoreLogic API Gateway URL is not set. Please check NEXT_PUBLIC_CORELOGIC_API_GATEWAY_URL environment variable.");
        alert("Property estimation service not configured.");
        return { success: false, error: "CoreLogic API Gateway URL not configured." };
      }

      const payload = {
        streetAddress: addressData.streetAddress,
        zipcode: addressData.zipcode,
      };

      console.log("handleStep1NextSubmit-mainFlowLog-Sending property info payload to CoreLogic proxy:", payload);

      const response = await fetch(corelogicApiGatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("handleStep1NextSubmit-mainFlowLog-CoreLogic API Response via Proxy:", data);
      console.log("handleStep1NextSubmit-MainFlowLog - CoreLogic API response.status:", response.status);

      let unitNumbers: string[] = []; // Initialize unitNumbers
      let priceEstimate: string | undefined;
      let lowEstimate: string | undefined;
      let highEstimate: string | undefined;

      if (response.status === 200) {
        // Valuation available
        unitNumbers = data.unitNumbers || []; // Extract unitNumbers from the response
        priceEstimate = data.priceEstimate || undefined;
        lowEstimate = data.lowEstimate || undefined;
        highEstimate = data.highEstimate || undefined;

        setFormData(prev => ({
          ...prev,
          step1: {
            ...prev.step1,
            priceEstimate: data.priceEstimate || undefined,
            lowEstimate: data.lowEstimate || undefined,
            highEstimate: data.highEstimate || undefined,
            valuationStatusAvailable: true,
          },
          priceEstimate: priceEstimate, // Also update top-level price estimates for easier access
          lowEstimate: lowEstimate,
          highEstimate: highEstimate,
          unitNumbers: unitNumbers // Store unitNumbers in formData
        }));
        console.log("handleStep1NextSubmit-mainFlowLog-Property valuation data received and stored.");
      } else if (response.status === 404 || response.status === 500) { // Also handle 500
        // Valuation unavailable or internal server error
        setFormData(prev => ({
          ...prev,
          step1: {
            ...prev.step1,
            priceEstimate: undefined,
            lowEstimate: undefined,
            highEstimate: undefined,
            valuationStatusAvailable: false
          },
          unitNumbers: [] // Ensure unitNumbers is always an array even if valuation is unavailable
        }));
        // Log 500 errors to the console, but do not show an alert to the user for 500
        if (response.status === 500) {
           console.error(`handleStep1NextSubmit-mainFlowLog-An internal server error occurred while fetching property estimate. Status: ${response.status}`);
        } else {
          console.warn(`handleStep1NextSubmit-mainFlowLog-Property valuation not available for this address. Status: ${response.status}`);
        }
      } else {
        // Handle other unexpected status codes
        console.error("handleStep1NextSubmit-mainFlowLog-CoreLogic API Error via Proxy (unexpected status):", data);
        alert(`Failed to get property estimate. Unexpected error: ${response.status}`);
        return { success: false, error: data };
      }

      if (response.ok || response.status === 404 || response.status === 500) { // Proceed for 200, 404, and 500
        return { success: true, data };
      } else {
         console.error("handleStep1NextSubmit-mainFlowLog-CoreLogic API Error via Proxy (final check):", data);
         alert(`Failed to get property estimate. Unexpected error: ${response.status}`);
        return { success: false, error: data };
      }

    } catch (error) {
      console.error("handleStep1NextSubmit-mainFlowLog-Error fetching property info via CoreLogic proxy:", error);
      alert("Error fetching property estimate.");
      return { success: false, error };
    }
  };

  // Handler for the final submission of all form data (from Step 3)
  const handleFinalSubmit = async () => {
    console.log("handleFinalSubmit-mainFlowLog-Final form data for submission:", formData)

    // Construct an initial description string for the lead based on collected data
    const initialDescription = `Property Details - Bedrooms: ${formData.step2.beds}, Bathrooms: ${formData.step2.baths}, Year Built: ${formData.step2.yearBuilt}, Square Foot: ${formData.step2.squareFoot} Price Estimate: ${formData.step1.priceEstimate}, Low Estimate: ${formData.step1.lowEstimate}, High Estimate: ${formData.step1.highEstimate}${formData.step2.unitNumber ? ", Unit Number: " + formData.step2.unitNumber : ""}`;
    console.log("handleFinalSubmit-mainFlowLog-Initial lead description:", initialDescription);

    // Prepare the payload for sending to Brivity
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
            email: formData.step3.email, // Store the email for potential future updates
            initialDescription: '' // Initial description is sent, clear it from leadInfo state
        })
      setCurrentStep("results") // Move to the Results page
      console.log("handleFinalSubmit-mainFlowLog-Lead submitted successfully, transitioning to results.");
    } else {
      alert("Failed to submit lead. Please try again.")
      console.error("handleFinalSubmit-mainFlowLog-Failed to submit lead.");
    }
  }

  // Handler for updating the lead description in Brivity (e.g., from ResultsPage)
  const handleUpdateDescription = async (newDescriptionPart: string) => {
    console.log("handleUpdateDescription-mainFlowLog-Attempting to update lead description with:", newDescriptionPart);
    if (leadInfo) {
      const payload = {
        // primary_agent_id is now handled securely by the Lambda function
        email: leadInfo.email, // Use the stored email to identify the lead
        description: newDescriptionPart // The new part of the description to add
      }
      const result = await sendLeadToBrivity(payload, true) // Call sendLeadToBrivity with isUpdate = true
      if (result.success) {
        console.log("handleUpdateDescription-mainFlowLog-Description updated successfully.");
      } else {
        console.error("handleUpdateDescription-mainFlowLog-Failed to update description.");
      }
    } else {
      console.warn("handleUpdateDescription-mainFlowLog-No lead info found to update description. Lead might not have been submitted yet.");
    }
  }

  // Navigation functions between steps
  const goToStep2 = () => { console.log("goToStep2-mainFlowLog-Navigating to Step 2."); setCurrentStep("step2"); }
  const goToStep3 = () => { console.log("goToStep3-mainFlowLog-Navigating to Step 3."); setCurrentStep("step3"); }
  const goToStep1 = () => { console.log("goToStep1-mainFlowLog-Navigating to Step 1."); setCurrentStep("step1"); }
  const goToStep2FromStep3 = () => { console.log("goToStep2FromStep3-mainFlowLog-Navigating to Step 2 from Step 3."); setCurrentStep("step2"); }

  // Render the appropriate component based on the current step
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
          onSubmit={() => setCurrentStep("results")}
          onPrevious={goToStep2FromStep3}
          selectedAddress={formData.selectedAddress}
          latitude={formData.latitude}
          longitude={formData.longitude}
          streetViewUrl={formData.streetViewUrl} // Pass streetViewUrl to Step3
          sendLeadToBrivity={sendLeadToBrivity} // Pass sendLeadToBrivity to Step3
        />
      )

    case "results":
      console.log("MainFlowLog - Rendering ResultsPage with streetViewURL:", formData.streetViewUrl);
      return <ResultsPage formData={formData} onUpdateDescription={handleUpdateDescription} streetViewUrl={formData.streetViewUrl} /> // Pass streetViewUrl to ResultsPage

    default:
      // Fallback to HeroSection if currentStep is an unrecognized value
      return <HeroSection onAddressSubmit={handleAddressSubmit} />
  }
}
