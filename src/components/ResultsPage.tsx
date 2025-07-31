 "use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { GoogleMap } from "@/components/GoogleMap"
import { MessagePopup } from './MessagePopup'

// Define the structure of the form data passed to ResultsPage
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

// Define the props for the ResultsPage component
interface ResultsPageProps {
    formData: FormData
    onUpdateDescription: (descriptionPart: string) => void
    streetViewUrl?: string | null; // Added streetViewUrl prop
}

export function ResultsPage({ formData, onUpdateDescription, streetViewUrl }: ResultsPageProps) {
    console.log("ResultsPage rendered with formData:", formData);
    console.log("Street View URL in ResultsPage:", streetViewUrl);

    const firstName = formData.step3?.firstName || "Friend"
    const address = formData.step1?.streetAddress || "Your Property"
    const latitude = formData?.latitude // Keep for GoogleMap component
    const longitude = formData?.longitude // Keep for GoogleMap component

    // Determine the appropriate greeting based on the current time
    const currentHour = new Date().getHours()
    let greeting = "Good Day!"
    if (currentHour < 12) {
        greeting = "Good Morning!"
    } else if (currentHour < 18) {
        greeting = "Good Afternoon!"
    } else {
        greeting = "Good Night!"
    }
    console.log("Greeting determined:", greeting);

    // State variables for managing the message popup and button click states
    const [showMessagePopup, setShowMessagePopup] = useState(false)
    const [cashOfferClicked, setCashOfferClicked] = useState(false);
    const [refinanceClicked, setRefinanceClicked] = useState(false);
    const [contactAgentClicked, setContactAgentClicked] = useState(false);

    // Function to close the message popup
    const closeMessagePopup = () => {
        console.log("Closing message popup.");
        setShowMessagePopup(false)
    }

    // Effect to show a message popup after a delay if valuation is unavailable
    useEffect(() => {
        let timer: NodeJS.Timeout;
        console.log("Valuation status available in useEffect:", formData.step1.valuationStatusAvailable);

        if (formData.step1.valuationStatusAvailable === false || formData.step1.valuationStatusAvailable === null) {
            console.log("Setting timeout for message popup (20 seconds) due to unavailable/null valuation.");
            timer = setTimeout(() => {
                setShowMessagePopup(true);
            }, 20000); // 20 seconds
        }

        // Cleanup function to clear the timeout if the component unmounts or the valuation status changes
        return () => {
            console.log("Clearing message popup timeout.");
            clearTimeout(timer);
        };
    }, [formData.step1.valuationStatusAvailable]);

    // Function to handle sending the combined message via onUpdateDescription prop
    const handleSendMessage = (message: string) => {
        console.log("Sending message to update description:", message);
        onUpdateDescription(message);
        setShowMessagePopup(false);
        console.log("Message sent and popup closed.");
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

                {/* Static Street View Image - Display here if available */}
                 {streetViewUrl && (
                    <div className="mb-8">
                        <img src={streetViewUrl} alt="Street View of the address" className="shadow-md rounded-md" />
                    </div>
                )}

                {/* Conditionally render Google Map if valuation is available */}
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
                    {/* Home Value Card Section */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Your Home value {formData.step1.valuationStatusAvailable === true ? "(Estimated)" : ""}
                        </h2>

                        {/* Display price estimate if available, otherwise display message about unavailability */}
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

                        {/* Conditionally render action buttons if valuation is available */}
                        {formData.step1.valuationStatusAvailable === true && (
                            <div className="space-y-3">
                                <Button
                                    className="w-full bg-[#2ec481] hover:bg-[#26a86b] text-white py-3 rounded-md font-medium"
                                    onClick={() => {
                                        console.log("Get a Cash Offer button clicked.");
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
                                        console.log("Refinance button clicked.");
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
                                        console.log("Contact Real Estate Agent button clicked.");
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

                {/* Property Details Section */}
                <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Property Details</h3>
                    <p className="mb-4">Some properties require enhanced valuation tools due to unique characteristics or market activity. Contact us to learn more.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {formData.step2.beds && (
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step2.beds}</div>
                                <div className="text-gray-600">Bedrooms</div>
                            </div>
                        )}
                        {formData.step2.baths && (
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step2.baths}</div>
                                <div className="text-gray-600">Bathrooms</div>
                            </div>
                        )}
                        {formData.step2.yearBuilt && (
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step2.yearBuilt}</div>
                                <div className="text-gray-600">Year Built</div>
                            </div>
                        )}
                        {formData.step2.squareFoot && (
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step2.squareFoot}</div>
                                <div className="text-gray-600">Square Footage</div>
                            </div>
                        )}
                        {formData.step1.valuationStatusAvailable && formData.step1.lowEstimate && (
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step1.lowEstimate}</div>
                                <div className="text-gray-600">Low Estimate</div>
                            </div>
                        )}
                        {formData.step1.valuationStatusAvailable && formData.step1.highEstimate && (
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step1.highEstimate}</div>
                                <div className="text-gray-600">High Estimate</div>
                            </div>
                        )}

                        {formData.step2.unitNumber && (
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-[#0f6c0c]">{formData.step2.unitNumber || '-'}</div>
                                <div className="text-gray-600">Unit Number</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Start Over Button */}
                <div className="mt-8 text-center">
                    <Button
                        variant="outline"
                        onClick={() => { console.log("Start Over button clicked. Reloading page."); window.location.reload(); }}
                        className="px-8 py-3"
                    >
                        Start Over
                    </Button>
                </div>

                {/* Message Popup Component (conditionally rendered) */}
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
