import { Hero1 } from "./assets/HeaderImage/HeroSectionImage/HeroSectionImage";

const HeroSection = () => {
  return (
    <section className="w-full bg-white overflow-hidden">
      
      {/* ================= HERO IMAGE ================= */}
      <div className="w-full">
        <img
          src={Hero1}
          alt="ProdTrack Production and Quality Dashboard"
          className="
            w-full
            h-auto
            block
            object-contain
          "
        />
      </div>

    </section>
  );
};

export default HeroSection;