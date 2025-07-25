import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#767676] text-white py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span>True Price Report</span>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/disclosure" className="hover:underline">
            Disclosure
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm">Powered By:</span>
          <Image
            src="https://truepricereport.s3.us-west-1.amazonaws.com/truepricereportMLSlogo.png"
            alt="MLS Realtor Logo"
            width={120}
            height={38}
            className="h-8 w-auto"
          />
        </div>
      </div>
    </footer>
  )
}
