"use client";
import Hero from "../sections/hero";
import Cars from "../sections/cars";
import About from "@/sections/about";
import Contact from "@/sections/contact";
import Footer from "@/sections/footer";
import { useState } from "react";

export default function Home() {
  const [showSignUp, setShowSignUp] = useState(false);
  return (
    <>
      <section id="hero">
        <Hero showSignUp={showSignUp} setShowSignUp={setShowSignUp} />
      </section>

      <section id="cars">
        <Cars />
      </section>

      <section id="about">
        <About />
      </section>

      <section id="contact">
        <Contact />
      </section>

      <section>
        <Footer setShowSignUp={setShowSignUp} />
      </section>
    </>
  );
}
