import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#cecece] py-16 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-12">
          <h1 className="text-3xl font-bold text-[#0f6c0c] text-center mb-4">
            Privacy Policy
          </h1>
          <h2 className="text-xl text-gray-800 text-center mb-12">
            Last Updated: March 20, 2025
          </h2>

          <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
            <p>
              The Brenkus Team | Keller Williams Realty The Marketplace ("Brenkus Realty Network") and its subsidiaries (collectively "we," "our," or "us") are dedicated to protecting your privacy. This Privacy Policy outlines how we collect, use, share, and safeguard your personal information.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Scope of Policy</h3>
            <p>
              This Privacy Policy applies to personally identifiable information collected through the www.truepricereport.com website and any other platforms, applications, products, or services provided by The Brenkus Team | Keller Williams Realty The Marketplace on behalf of itself or its affiliates and clients (collectively, the "Services"). If you disagree with any part of this Privacy Policy, please discontinue the use of our Services immediately.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h3>
            <p>We collect information you provide directly, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, phone number(s), and property address</li>
              <li>Location data</li>
              <li>Web browser, operating system, and device details, including IP address</li>
              <li>Website usage data, such as pages visited and search preferences</li>
              <li>Real estate-related information, including financing details and transaction history</li>
            </ul>
            <p>
              If you engage with a licensed real estate provider or affiliate, they may collect additional data to enhance your service experience. Our collection methods include information provided during registration, inquiries, participation in promotions, and interactions with our platform.
            </p>
            <p>
              We also collect data via cookies, tracking pixels, and third-party analytics tools to improve functionality and user experience. Users can adjust browser settings to manage cookies, but disabling them may affect certain features.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h3>
            <p>We utilize collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our Services</li>
              <li>Address user inquiries and concerns</li>
              <li>Customize content and recommendations</li>
              <li>Maintain commercial relationships</li>
              <li>Facilitate transactions and fulfill Service requests</li>
              <li>Conduct lawful business operations</li>
            </ul>
            <p>We may combine information across different Services for better personalization and analysis.</p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Information Sharing</h3>
            <p>
              Your data may be shared with affiliates and business partners to facilitate real estate-related services. Additionally, we engage third-party service providers, such as email and customer support tools, to enhance our offerings. We do not sell personally identifiable information to advertisers.
            </p>
            <p>
              Aggregated, non-identifiable data may be shared publicly or with affiliates for analytical purposes. In cases of business transfers (e.g., mergers or sales), user data may be included as part of the transaction.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Legal Disclosures</h3>
            <p>
              We may disclose personally identifiable information if required by law, in response to legal processes, or to protect the rights, safety, or property of users, The Brenkus Team | Keller Williams Realty The Marketplace, or others.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Third-Party Websites</h3>
            <p>
              Our website may contain links to external websites not governed by this Privacy Policy. Users should review the privacy policies of any linked sites they visit, as we do not control their data practices.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Children's Privacy</h3>
            <p>
              Our Services are not directed at individuals under 18 years old, and we do not knowingly collect data from minors. If we become aware of such a collection, we will take steps to delete the information.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Data Security</h3>
            <p>
              We implement industry-standard security measures to protect user data. While we strive to safeguard your information, no online transmission is completely secure. Users should take necessary precautions when sharing personal information online.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Access, Correction, and Deletion of Data</h3>
            <p>
              Users may request access to, correction of, or deletion of their personal data. However, some data may be retained for legal or business reasons. Requests for updates or deletions can be submitted through our contact information below.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Jurisdiction-Specific Rights</h3>

            <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3">California Residents (CCPA)</h4>
            <p>
              California residents may have additional rights regarding personal information under the California Consumer Privacy Act (CCPA), including requests for data access and deletion.
            </p>

            <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3">European Union Residents (GDPR)</h4>
            <p>EU residents have additional rights under the General Data Protection Regulation (GDPR), including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Objecting to or restricting data processing</li>
              <li>Withdrawing consent for data usage</li>
              <li>Requesting a copy of personal data</li>
              <li>Filing complaints with data protection authorities</li>
            </ul>
            <p>To exercise jurisdiction-specific rights, please contact us using the details below.</p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Policy Updates</h3>
            <p>
              This Privacy Policy may be updated periodically. Significant changes will be communicated via our website and, where applicable, through direct notifications.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Contact Information</h3>
            <p>
              For privacy-related inquiries, contact us at: <strong>service@truepricereport.com</strong>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
