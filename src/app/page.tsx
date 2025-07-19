import { Header } from "@/components/Header"
import { MainFlow } from "@/components/MainFlow"
import { Footer } from "@/components/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <MainFlow />
      </main>
      <Footer />
    </div>
  )
}
