import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import About from "@/components/home/About";
import GalleryPreview from "@/components/home/GalleryPreview";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <WhyChooseUs />
      <About />
      <GalleryPreview />
    </main>
  );
}