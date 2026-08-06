import Hero from "@/components/HeroSection";
import JobStats from "@/components/JobStats";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden ">
      {/* 🌟 Seamless Globe & Atmospheric Glow Container */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[28%] sm:top-[22%] md:top-[18%] w-full max-w-7xl h-[800px] pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Atmosphere Blue Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-indigo-600/30 via-blue-500/15 to-transparent rounded-full blur-3xl opacity-80" />

        {/* Globe Image (/public/globe.png) */}
        <div className="relative w-full h-full opacity-80 mix-blend-screen">
          <Image
            src="/globe.png"
            alt="HireSphere Global Background"
            fill
            className="object-contain object-top"
            priority
          />
        </div>
      </div>

      {/* Page Content Rendered Above Background */}
      <div className="relative z-10">
        <Hero />
        <JobStats />
      </div>
    </div>
  );
}
