import { Nav } from "@/components/Layout/Nav";
import { Hero } from "@/components/Hero/Hero";
import { Marquee } from "@/components/Layout/Marquee";
import { HowItWorks } from "@/components/Sections/HowItWorks";
import { ChatDemo } from "@/components/Sections/ChatDemo";
import { Pricing } from "@/components/Sections/Pricing";
import { FinalCta } from "@/components/Sections/FinalCta";
import { Footer } from "@/components/Layout/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Marquee />
      <HowItWorks />
      <ChatDemo />
      <Pricing />
      <FinalCta />
      <Footer />
    </>
  );
}
