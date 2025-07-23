"use client"

import { useState } from "react"
import { HeroSection } from "./HeroSection"
import { Step1 } from "./Step1"
import { Step2 } from "./Step2"
import { Step3 } from "./Step3"
import { ResultsPage } from "./ResultsPage"

type FlowStep = "hero" | "step1" | "step2" | "step3" | "results"

interface FormData {
  selectedAddress: string
  step1: {
    streetAddress: string
    city: string
    state: string
    country: string
    zipcode: string
  }
  step2: {
    beds: string
    baths: string
  }
  step3: {
    firstName: string
    lastName: string
    phone: string
    email: string
  }
}

interface LeadInfo {
  email: string
  initialDescription: string
}

export function MainFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("hero")
  const [formData, setFormData] = useState<FormData>({
    selectedAddress: "",
    step1: {
      streetAddress: "",
      city: "",
      state: "",
      country: "USA",
      zipcode: ""
    },
    step2: {
      beds: "",
      baths: ""
    },
    step3: {
      firstName: "",
      lastName: "",
      phone: "",
      email: ""
    }
  })
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null) // To store email and initial description

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const updateSelectedAddress = (address: string) => {
    setFormData(prev => ({ ...prev, selectedAddress: address }))
  }

  const handleAddressSubmit = (address: string) => {
    // Get detailed address info if available
    const details = (window as unknown as Record<string, unknown>).selectedAddressDetails as {
      streetNumber: string
      route: string
      city: string
      state: string
      country: string
      zipcode: string
    } | undefined

    let step1Data = { ...formData.step1, streetAddress: address }

    if (details) {
      // Auto-populate Step 1 fields with detailed address components
      step1Data = {
        streetAddress: `${details.streetNumber} ${details.route}`.trim() || address,
        city: details.city || "",
        state: details.state || "",
        country: details.country || "USA",
        zipcode: details.zipcode || ""
      }
    }

    setFormData(prev => ({
      ...prev,
      selectedAddress: address,
      step1: step1Data
    }))
    setCurrentStep("step1")
  }

  const sendLeadToBrivity = async (payload: any, isUpdate: boolean = false) => {
    console.log(`Sending lead data to Brivity (isUpdate: ${isUpdate}):`, payload)
    try {
      const response = await fetch("https://secure.brivity.com/api/v2/leads", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Token token=${process.env.NEXT_PUBLIC_BRIVITY_API_TOKEN}` // Ensure this env var is set
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      console.log("Brivity API Response:", data)

      if (response.ok) {
        // For initial lead creation (not updates or Step 1 submits where email might not be available yet)
        if (!isUpdate && payload.email) {
          const initialDescription = `Property Details - Bedrooms: ${formData.step2.beds}, Bathrooms: ${formData.step2.baths}`
          setLeadInfo({
            email: payload.email, // Use email from payload if available
            initialDescription: initialDescription
          })
          console.log("Lead info stored:", { email: payload.email, initialDescription })
        }
        return { success: true, data }
      } else {
        console.error("Brivity API Error:", data)
        return { success: false, error: data }
      }
    } catch (error) {
      console.error("Error sending lead to Brivity:", error)
      return { success: false, error }
    }
  }

  const handleStep1NextSubmit = async (addressData: FormData['step1']) => {
    console.log("Step 1 'Next' button data:", addressData)
    const payload = {
      lead_type: "lead from webpage trueprice report",
      source: "TruepriceReport",
      street_address: addressData.streetAddress,
      city: addressData.city,
      locality: addressData.state,
      postal_code: addressData.zipcode,
      country: addressData.country,
      description: "Address provided on Step 1"
    }
    // We are not expecting an email here yet, so we don't store leadInfo
    await sendLeadToBrivity(payload, false) // Consider this an initial lead capture
  }

  const handleFinalSubmit = async () => {
    console.log("Final form data:", formData)

    const initialDescription = `Property Details - Bedrooms: ${formData.step2.beds}, Bathrooms: ${formData.step2.baths}`

    const payload = {
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
      setCurrentStep("results")
    } else {
      alert("Failed to submit lead. Please try again.")
    }
  }

  const handleUpdateDescription = async (newDescriptionPart: string) => {
    if (leadInfo) {
      const updatedDescription = `${leadInfo.initialDescription}. ${newDescriptionPart}`
      const payload = {
        email: leadInfo.email,
        description: updatedDescription
      }
      const result = await sendLeadToBrivity(payload, true)
      if (result.success) {
        // Optionally update the stored initialDescription to reflect the new state if needed for further updates
        setLeadInfo(prev => prev ? { ...prev, initialDescription: updatedDescription } : null)
        console.log("Description updated successfully.")
      } else {
        console.error("Failed to update description.")
      }
    } else {
      console.warn("No lead info found to update description.")
    }
  }


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
          onStep1NextSubmit={handleStep1NextSubmit} // Pass the new handler
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
        />
      )

    case "results":
      return <ResultsPage formData={formData} onUpdateDescription={handleUpdateDescription} />

    default:
      return <HeroSection onAddressSubmit={handleAddressSubmit} />
  }
}

const goToStep2 = () => setCurrentStep("step2")
const goToStep3 = () => setCurrentStep("step3")
const goToStep1 = () => setCurrentStep("step1")
const goToStep2FromStep3 = () => setCurrentStep("step2")
