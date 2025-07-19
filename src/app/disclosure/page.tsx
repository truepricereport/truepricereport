import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function DisclosurePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#cecece] py-16 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-12">
          <h1 className="text-3xl font-bold text-[#0f6c0c] text-center mb-4">
            Disclosure Statement and Terms of Use
          </h1>
          <h2 className="text-xl text-gray-800 text-center mb-12">
            Last Revised on March 20, 2025
          </h2>

          <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
            <p>
              Welcome to TruePriceReport.com ("Website"). This Website is provided to assist customers in gathering real estate information, to assist in connecting them with real estate agents or brokerages to help determine the highest price of their home, and to otherwise enable connections with affiliates who may provide related goods and services. The terms "we," "us," "our," "Brenkus team," "The Brenkus Team," "TruePriceReport.com," refer to Brenkus Realty Network BS.16186.LLC. "Third-Party Service Provider" means any affiliated company through which Brenkus Realty Network BS.16186.LLC connects consumers to those affiliated providers in order for Third-Party Service Providers to provide information and services. This Website is offered to you conditioned upon your acceptance of all the terms and conditions as set forth below (collectively, the "Terms of Use" or "Agreement"). Our Privacy Policy, found on the Website, is incorporated herein by reference. By accessing or using this Website, inputting information about your home to find the highest price, submitting personal information about yourself and your home, you agree that these Terms of Use apply.
            </p>

            <p className="italic">
              When using information provided to you for any financial purpose, we advise that you consult a qualified professional such as a real estate agent or broker.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Use of TruePriceReport.com</h3>
            <p>As a condition of your use of TruePriceReport.com, you agree that:</p>
            <p>You are at least 18 years of age; You have legal authority to create a binding legal obligation.</p>
            <p>You will use TruePriceReport.com in accordance with these Terms of Use.</p>
            <p>
              You acknowledge that if your account shows signs of fraud, abuse, or suspicious activity, Brenkus Realty Network BS.16186.LLC reserves the right to take any necessary legal action and you may be liable for monetary losses to Brenkus Realty Network BS.16186.LLC, including litigation costs and damages; No joint venture, partnership, or employment relationship exists between you and TruePriceReport.com as a result of this Agreement or use of this Website; You acknowledge that TruePriceReport.com is a marketing website only and exists to connect users to real estate agents, brokerages, and affiliate companies.
            </p>
            <p>
              Brenkus Realty Network BS.16186.LLC retains the right to deny access to TruePriceReport.com and the services we offer, to anyone, at any time and for any reason.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Customer Support</h3>
            <p>For support inquiries, please contact us at: service@truepricereport.com</p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Legal Action: Disputes, Arbitration, and Indemnification</h3>
            <p>
              Brenkus Realty Network BS.16186.LLC is committed to customer satisfaction, and we will do our best to try to resolve your concerns. In the event you wish to pursue claims against Brenkus Realty Network BS.16186.LLC, you may seek relief through binding arbitration.
            </p>
            <p>
              Arbitrations will be conducted by the American Arbitration Association (AAA) under its rules. Any and all proceedings to resolve claims will be conducted only on an individual basis and not in a class, consolidated, or representative action.
            </p>
            <p>
              If any part of this Agreement is found to be invalid, illegal, or unenforceable, the validity, legality, and enforceability of the remaining provisions will not be affected or impaired. Our failure or delay in enforcing any provision of this Agreement at any time does not waive our right to enforce the same or any other provision(s) hereof in the future.
            </p>
            <p>
              You agree to defend and indemnify Brenkus Realty Network BS.16186.LLC, and any of its officers, directors, employees, and agents from and against any claims, causes of action, demands, recoveries, losses, damages, fines, penalties, costs, or expenses of any kind including, but not limited to, reasonable legal fees, brought by third parties as a result of: Your breach of this Agreement; Your violation of any law or the rights of a third party; your use of this Website.
            </p>
            <p>
              You are fully responsible for the content you submit on the Website. You are prohibited from posting or transmitting any unlawful, defamatory, threatening, obscene, or pornographic material, and/or any other material or content that would violate any law. You shall be solely liable for any damages resulting from any violation of the foregoing restrictions.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Links to Third-Party Sites and Liability Disclaimer</h3>
            <p>
              TruePriceReport.com may contain hyperlinks to websites operated by other parties or may connect you to Third-Party Service Providers. Brenkus Realty Network BS.16186.LLC is not responsible for the contents or practices of such websites and Third-Party Service Providers.
            </p>
            <p>
              The real estate agents, brokerages, and other suppliers providing services via this Website are not independent contractors nor employees of Brenkus Realty Network BS.16186.LLC. Brenkus Realty Network BS.16186.LLC is not liable for the acts, errors, omissions, representations, warranties, breaches, or negligence of any Third-Party Service Providers, real estate agents, brokers, or brokerages, or for any property damage, expenses, personal injuries, death, or other damages resulting therefrom.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
