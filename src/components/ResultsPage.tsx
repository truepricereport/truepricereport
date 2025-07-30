 "use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { GoogleMap } from "@/components/GoogleMap"
import { MessagePopup } from './MessagePopup'

interface FormData {
    selectedAddress: string
    latitude?: number
    longitude?: number
    streetViewUrl?: string | null; // Added streetViewUrl to FormData
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
        unitNumber: string | null
    }
    step3: {
        firstName: string
        lastName: string
        phone: string
        email: string
    }
    unitNumbers?: string[] // add unitNumbers to form data
}

interface ResultsPageProps {
    formData: FormData
    onUpdateDescription: (descriptionPart: string) => void
    streetViewUrl?: string | null; // Added streetViewUrl prop
}

export function ResultsPage({ formData, onUpdateDescription, streetViewUrl }: ResultsPageProps) {
    const firstName = formData.step3?.firstName || "Friend"
    const address = formData.step1?.streetAddress || "Your Property"
    const latitude = formData?.latitude // Keep for GoogleMap component
    const longitude = formData?.longitude // Keep for GoogleMap component

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

    const [showMessagePopup, setShowMessagePopup] = useState(false)
    const [cashOfferClicked, setCashOfferClicked] = useState(false);
    const [refinanceClicked, setRefinanceClicked] = useState(false);
    const [contactAgentClicked, setContactAgentClicked] = useState(false);

    // Function to close the message popup
    const closeMessagePopup = () => {
        setShowMessagePopup(false)
    }

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (formData.step1.valuationStatusAvailable === false || formData.step1.valuationStatusAvailable === null) {
            timer = setTimeout(() => {
                setShowMessagePopup(true);
            }, 20000); // 20 seconds
        }

        // Cleanup function to clear the timeout if the component unmounts or the valuation status changes
        return () => clearTimeout(timer);
    }, [formData.step1.valuationStatusAvailable]);

    // Function to handle sending the combined message
    const handleSendMessage = (message: string) => {
        onUpdateDescription(message);
        setShowMessagePopup(false);
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
                        width={200}
                        height={60}
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

                {/* Static Street View Image - Display here */}
                 {streetViewUrl && (
                    <div className="mb-8">
                        <img src={streetViewUrl} alt="Street View of the address" className="shadow-md rounded-md" />
                    </div>
                )}

                {/* Conditionally render Google Map (still uses lat/lng from formData) */}
                {formData.step1.valuationStatusAvailable === true ? (
                    <div className="mb-8">
                        <GoogleMap
                            address={formData.selectedAddress}
                            latitude={latitude}
                            longitude={longitude}
                            className="shadow-md"
                        />
                    </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Home Value Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Your Home value {formData.step1.valuationStatusAvailable === true ? "(Estimated)" : ""}
                        </h2>

                        {formData.step1.valuationStatusAvailable === true ? (
                            <div className="mb-8">
                                <span className="text-5xl font-bold text-[#0f6c0c]">$</span>
                                <span className="text-4xl font-bold text-gray-900 ml-2">
                                    {formData.step1.priceEstimate?.replace('$', '')}
                                </span>
                            </div>
                        ) : (
                            <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 text-xl font-semibold">
                                Valuation unavailable through standard tools. This property requires manual analysis — contact us for a personalized valuation.
                            </div>
                        )}

                        {/* Conditionally render buttons */}
                        {formData.step1.valuationStatusAvailable === true && (
                            <div className="space-y-3">
                                <Button
                                    className="w-full bg-[#2ec481] hover:bg-[#26a86b] text-white py-3 rounded-md font-medium"
                                    onClick={() => {
                                        onUpdateDescription("I am interested in getting a Cash Offer.");
                                        setCashOfferClicked(true);
                                    }}
                                    disabled={cashOfferClicked}
                                >
                                    Get a Cash Offer
                                </Button>
                                <Button
                                    className="w-full bg-[#2ec481] hover:bg-[#26a86b] text-white py-3 rounded-md font-medium"
                                    onClick={() => {
                                        onUpdateDescription("I am interested in Refinancing.");
                                        setRefinanceClicked(true);
                                    }}
                                    disabled={refinanceClicked}
                                >
                                    Refinance
                                </Button>
                                <Button
                                    className="w-full bg-[#2ec481] hover:bg-[#26a46b] text-white py-3 rounded-md font-medium"
                                    onClick={() => {
                                        onUpdateDescription("I am interested in contacting a Real Estate Agent.");
                                        setContactAgentClicked(true);
                                    }}
                                    disabled={contactAgentClicked}
                                >
                                    Contact Real Estate Agent
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Property Details */}
                <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Property Details</h3>
                    <p>Some properties require enhanced valuation tools due to unique characteristics or market activity. Contact us to learn more.</p>
                    <div className="flex flex-wrap justify-center">
                        {formData.step2.beds && (
                            <div className="bg-gray-50 rounded-lg p-4 w-1/2">
                                <div className="text-2xl font-bold text-[#0f6c0c] text-sm">{formData.step2.beds}</div>
                                <div className="text-gray-600">Bedrooms</div>
                            </div>
                        )}
                        {formData.step2.baths && (
                            <div className="bg-gray-50 rounded-lg p-4 w-1/2">
                                <div className="text-2xl font-bold text-[#0f6c0c] text-sm">{formData.step2.baths}</div>
                                <div className="text-gray-600">Bathrooms</div>
                            </div>
                        )}
                        {formData.step2.yearBuilt && (
                            <div className="bg-gray-50 rounded-lg p-4 w-1/2">
                                <div className="text-2xl font-bold text-[#0f6c0c] text-sm">{formData.step2.yearBuilt}</div>
                                <div className="text-gray-600">Year Built</div>
                            </div>
                        )}
                        {formData.step2.squareFoot && (
                            <div className="bg-gray-50 rounded-lg p-4 w-1/2">
                                <div className="text-2xl font-bold text-[#0f6c0c] text-sm">{formData.step2.squareFoot}</div>
                                <div className="text-gray-600">Square Footage</div>
                            </div>
                        )}
                        {formData.step1.valuationStatusAvailable && formData.step1.lowEstimate && (
                            <div className="bg-gray-50 rounded-lg p-4 w-1/2">
                                <div className="text-2xl font-bold text-[#0f6c0c] text-sm">{formData.step1.lowEstimate}</div>
                                <div className="text-gray-600">Low Estimate</div>
                            </div>
                        )}
                        {formData.step1.valuationStatusAvailable && formData.step1.highEstimate && (
                            <div className="bg-gray-50 rounded-lg p-4 w-1/2">
                                <div className="text-2xl font-bold text-[#0f6c0c] text-sm">{formData.step1.highEstimate}</div>
                                <div className="text-gray-600">High Estimate</div>
                            </div>
                        )}

                        {formData.step2.unitNumber && (
                            <div className="bg-gray-50 rounded-lg p-4 w-1/2">
                                <div className="text-2xl font-bold text-[#0f6c0c] text-sm">{formData.step2.unitNumber || '-'}</div>
                                <div className="text-gray-600">Unit Number</div>
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
                {showMessagePopup && (formData.step1.valuationStatusAvailable === false || formData.step1.valuationStatusAvailable === null) && (
                    <MessagePopup
                        onUpdateDescription={handleSendMessage}
                        popupTitle={(formData.step1.valuationStatusAvailable === false || formData.step1.valuationStatusAvailable === null) ? 'Contact Us For Personalized Valuation' : 'Send a Message'}
                        onClose={closeMessagePopup}
                        defaultMessage={(formData.step1.valuationStatusAvailable === false || formData.step1.valuationStatusAvailable === null) ? 'I am interested in a personalized valuation.' : ''}
                        isValuationUnavailable={(formData.step1.valuationStatusAvailable === false || formData.step1.valuationStatusAvailable === null)}
                    />
                )}
            </div>
        </div>
    )
}
