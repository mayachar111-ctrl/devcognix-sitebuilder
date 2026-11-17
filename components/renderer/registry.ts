import type { ComponentType } from "react";
import type { SectionType } from "@/lib/schema";
import Navbar from "@/components/sections/Navbar";
import HeroCentered from "@/components/sections/HeroCentered";
import HeroSplit from "@/components/sections/HeroSplit";
import HeroGradient from "@/components/sections/HeroGradient";
import LogoStrip from "@/components/sections/LogoStrip";
import FeaturesGrid from "@/components/sections/FeaturesGrid";
import FeatureRows from "@/components/sections/FeatureRows";
import Stats from "@/components/sections/Stats";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import Faq from "@/components/sections/Faq";
import CtaBanner from "@/components/sections/CtaBanner";
import Gallery from "@/components/sections/Gallery";
import Team from "@/components/sections/Team";
import Process from "@/components/sections/Process";
import Contact from "@/components/sections/Contact";
import Newsletter from "@/components/sections/Newsletter";
import BlogCards from "@/components/sections/BlogCards";
import Video from "@/components/sections/Video";
import Footer from "@/components/sections/Footer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SECTION_COMPONENTS: Record<SectionType, ComponentType<{ props: any }>> = {
  navbar: Navbar,
  "hero-centered": HeroCentered,
  "hero-split": HeroSplit,
  "hero-gradient": HeroGradient,
  "logo-strip": LogoStrip,
  "features-grid": FeaturesGrid,
  "feature-rows": FeatureRows,
  stats: Stats,
  testimonials: Testimonials,
  pricing: Pricing,
  faq: Faq,
  "cta-banner": CtaBanner,
  gallery: Gallery,
  team: Team,
  process: Process,
  contact: Contact,
  newsletter: Newsletter,
  "blog-cards": BlogCards,
  video: Video,
  footer: Footer,
};
