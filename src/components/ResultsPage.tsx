"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { GoogleMap } from "@/components/GoogleMap"

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

interface ResultsPageProps {
  formData: FormData
}

export function ResultsPage({ formData }: ResultsPageProps) {
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

  const estimatedValue = "$450,000" // This would typically come from an API

  return (
    <div className="bg-[#cecece] min-h-[80vh] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
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
              Your Home value (Estimated)
            </h2>
            <div className="mb-8">
              <span className="text-5xl font-bold text-[#0f6c0c]">$</span>
              <span className="text-4xl font-bold text-gray-900 ml-2">
                {estimatedValue.replace('$', '')}
              </span>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-[#2ec481] hover:bg-[#26a86b] text-white py-3 rounded-md font-medium"
                onClick={() => alert("Get a Cash Offer feature would be implemented here")}
              >
                Get a Cash Offer
              </Button>
              <Button
                className="w-full bg-[#2ec481] hover:bg-[#26a86b] text-white py-3 rounded-md font-medium"
                onClick={() => alert("Refinance feature would be implemented here")}
              >
                Refinance
              </Button>
              <Button
                className="w-full bg-[#2ec481] hover:bg-[#26a86b] text-white py-3 rounded-md font-medium"
                onClick={() => alert("Contact Real Estate Agent feature would be implemented here")}
              >
                Contact Real Estate Agent
              </Button>
            </div>
          </div>

          {/* Property Map */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <GoogleMap
              address={address}
              className="w-full h-80 rounded-lg"
            />
          </div>
        </div>

        {/* Property Details */}
        {formData.step2 && (
          <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Property Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step2.beds}</div>
                <div className="text-gray-600">Bedrooms</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step2.baths}</div>
                <div className="text-gray-600">Bathrooms</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0f6c0c]">2,100</div>
                <div className="text-gray-600">Sq Ft</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#0f6c0c]">1995</div>
                <div className="text-gray-600">Year Built</div>
              </div>
            </div>
          </div>
        )}

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
