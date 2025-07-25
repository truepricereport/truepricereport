"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

interface FormData {
  selectedAddress: string
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

interface ResultsPageProps {
  formData: FormData
  onUpdateDescription: (descriptionPart: string) => void
}

export function ResultsPage({ formData, onUpdateDescription }: ResultsPageProps) {
  const firstName = formData.step3?.firstName || "Friend"
  const address = formData.step1?.streetAddress || "Your Property"

  // Get current time to determine greeting
  const currentHour = new Date().getHours()
  let greeting = "Good Day!"
  if (currentHour < 12) {
    greeting = "Good Morning!"
  } else if (currentHour < 18) {
    greeting = "Good Afternoon!"
  } else {
    greeting = "Good Night!"
  }

  const handleCashOfferClick = () => {
    console.log("Get a Cash Offer button clicked.")
    onUpdateDescription("I am interested in getting a Cash Offer.")
  }

  const handleRefinanceClick = () => {
    console.log("Refinance button clicked.")
    onUpdateDescription("I am interested in Refinancing.")
  }

  const handleContactAgentClick = () => {
    console.log("Contact Real Estate Agent button clicked.")
    onUpdateDescription("I am interested in contacting a Real Estate Agent.")
  }

  return (
    <div
      className="min-h-[80vh] py-16 px-6 bg-cover bg-center"
      style={{ backgroundImage: `url('https://truepricereport.s3.us-west-1.amazonaws.com/Homepagetruepricereportimage.jpeg')` }}
    >
      <div className="max-w-6xl mx-auto bg-white bg-opacity-90 rounded-2xl p-8 shadow-lg">
        <div className="mb-8">
          <Image
            src="https://truepricereport.s3.us-west-1.amazonaws.com/truepricereportlogo.png"
            alt="True Price Report"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {greeting} {firstName}
          </h1>
          <p className="text-lg text-gray-700 mb-2">
            Below is the TruePriceReport for:
          </p>
          <p className="text-xl font-semibold text-gray-900">
            {address}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Home Value Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Home value {formData.step1.valuationStatus === "available" ? "(Estimated)" : ""}
            </h2>

            {formData.step1.valuationStatus === "available" ? (
              <div className="mb-8">
                <span className="text-5xl font-bold text-[#0f6c0c]">$</span>
                <span className="text-4xl font-bold text-gray-900 ml-2">
                  {formData.step1.priceEstimate?.replace('$', '')}
                </span>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800">
                Valuation unavailable through standard tools. This property may require advanced analysis — contact us for a premium valuation.
              </div>
            )}

            <div className="space-y-3">
              <Button
                className="w-full bg-[#2ec481] hover:bg-[#26a86b] text-white py-3 rounded-md font-medium"
                onClick={handleCashOfferClick}
              >
                Get a Cash Offer
              </Button>
              <Button
                className="w-full bg-[#2ec481] hover:bg-[#26a86b] text-white py-3 rounded-md font-medium"
                onClick={handleRefinanceClick}
              >
                Refinance
              </Button>
              <Button
                className="w-full bg-[#2ec481] hover:bg-[#26a46b] text-white py-3 rounded-md font-medium"
                onClick={handleContactAgentClick}>
                Contact Real Estate Agent
              </Button>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Property Details</h3>
          <p>Some properties require enhanced valuation tools due to unique characteristics or market activity. Contact us to learn more.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {formData.step2.beds && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step2.beds}</div>
                <div className="text-gray-600">Bedrooms</div>
              </div>
            )}
            {formData.step2.baths && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step2.baths}</div>
                <div className="text-gray-600">Bathrooms</div>
              </div>
            )}
            {formData.step1.valuationStatus === "available" && formData.step1.lowEstimate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step1.lowEstimate}</div>
                <div className="text-gray-600">Low Estimate</div>
              </div>
            )}
            {formData.step1.valuationStatus === "available" && formData.step1.highEstimate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step1.highEstimate}</div>
                <div className="text-gray-600">High Estimate</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="px-8 py-3"
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  )
}
