import Hero from "../components/Hero";
import FeaturedHotels from "../components/FeaturedHotels";
import FeaturedTransport from "../components/FeaturedTransport";
import AboutSection from "../components/AboutSection";
import Contact from "../components/Contact";

function Home() {
  return (
    <>
      <Hero />
      <FeaturedHotels />
      <FeaturedTransport />
      <AboutSection />
      <Contact />
    </>
  );
}

export default Home
