import Navbar from "@/components/homepage/Navbar";
import Hero from "@/components/homepage/Hero";
import StatsStrip from "@/components/homepage/StatsStrip";
import Services from "@/components/homepage/Services";
import WhyUs from "@/components/homepage/Whyus";
import Reviews from "@/components/homepage/Reviews";
import CTABanner from "@/components/homepage/Ctabanner";
import Footer from "@/components/homepage/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <Services />
        <WhyUs />
        <Reviews />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}