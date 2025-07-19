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

  const goToStep2 = () => setCurrentStep("step2")
  const goToStep3 = () => setCurrentStep("step3")
  const goToStep1 = () => setCurrentStep("step1")
  const goToStep2FromStep3 = () => setCurrentStep("step2")

  const handleFinalSubmit = () => {
    // Here you would typically send the form data to your backend
    console.log("Final form data:", formData)
    setCurrentStep("results")
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
      return <ResultsPage formData={formData} />

    default:
      return <HeroSection onAddressSubmit={handleAddressSubmit} />
  }
}
