"use client";
import {
  FaBars,
  FaTimes,
  FaCar,
  FaInfoCircle,
  FaUserCircle,
  FaSignInAlt,
} from "react-icons/fa";
import { RiLoginBoxLine } from "react-icons/ri";
import { MdEmail } from "react-icons/md";
import { useRef, useState, useEffect } from "react";
import GetStarted from "@/components/ctaOne";
import SignUp from "@/components/signup";
import Image from "next/image";
import Bground from "@/assets/hero-bg.png";
import Logo from "@/assets/logo.png";

export default function Hero() {
  const [hideNav, setHideNav] = useState(false);
  const navRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [hideMNav, setHideMNav] = useState(true);
  const [showPNav, setShowPNav] = useState(false);

  {
    /* ———————————————————————————————————— outside click nav ——— */
  }
  useEffect(() => {
    function outNav(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setHideNav(false);
      }
    }
    document.addEventListener("pointerdown", outNav);
    return () => {
      document.removeEventListener("pointerdown", outNav);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (showSignUp === true) {
      setHideNav(false);
    }
  }, [showSignUp]);

  useEffect(() => {
    const handleNav = () => {
      if (window.innerWidth >= 768) {
        setHideMNav(false);
        setShowPNav(true);
      } else {
        setHideMNav(true);
        setShowPNav(false);
      }
    };

    handleNav();

    window.addEventListener("resize", handleNav);
    return () => {
      window.removeEventListener("resize", handleNav);
    };
  }, []);

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-950">
      <Image
        src={Bground}
        alt="bground"
        className="w-full h-screen absolute -z-20 object-cover"
      />
      <div
        className={`fixed py-2 px-4 text-highlight w-full text-2xl font-header z-50 ${
          isScrolled ? "backdrop-blur-xs" : "bg-transparent"
        }`}
      >
        <div className="flex justify-between items-center md:px-16 lg:px-32 xl:px-64">
          <a href="#hero">
            <Image
              src={Logo}
              alt="logo"
              className="w-24 sm:w-28 md:w-32 h-auto"
            />
          </a>
          {hideMNav && (
            <div>
              <button onClick={() => setHideNav((prev) => !prev)}>
                <FaBars className="text-label text-xl sm:text-2xl md:text-3xl duration-200 hover:scale-110 active:scale-110 cursor-pointer" />
              </button>
            </div>
          )}
          {showPNav && (
            <div className="flex gap-4 cursor-pointer lg:gap-6 xl:gap-8 text-normal text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal">
              <div className="flex items-center justify-center group">
                <a
                  href="#cars"
                  className="relative flex items-center justify-center duration-200 group-hover:-translate-y-2 group-hover:scale-120 group-hover:text-[var(--color-highlight)]"
                >
                  <FaCar />
                </a>
                <a
                  href="#cars"
                  className="absolute flex items-center justify-center mt-20 opacity-0 duration-200 group-hover:opacity-100 px-4 rounded-full pointer-events-none"
                >
                  <span className="md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-highlight">
                    cars
                  </span>
                </a>
              </div>

              <div className="flex items-center justify-center group">
                <a
                  href="#about"
                  className="relative flex items-center justify-center duration-200 group-hover:-translate-y-2 group-hover:scale-120 group-hover:text-[var(--color-highlight)]"
                >
                  <FaInfoCircle />
                </a>
                <a
                  href="#about"
                  className="absolute flex items-center justify-center mt-20 opacity-0 duration-200 group-hover:opacity-100 px-4 rounded-full pointer-events-none"
                >
                  <span className="md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-highlight">
                    about
                  </span>
                </a>
              </div>

              <div className="flex items-center justify-center group">
                <a
                  href="#contact"
                  className="relative flex items-center justify-center duration-200 group-hover:-translate-y-2 group-hover:scale-120 group-hover:text-[var(--color-highlight)]"
                >
                  <MdEmail />
                </a>
                <a
                  href="#contact"
                  className="absolute flex items-center justify-center mt-20 opacity-0 duration-200 group-hover:opacity-100 px-4 rounded-full pointer-events-none"
                >
                  <span className="md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-highlight">
                    contact
                  </span>
                </a>
              </div>

              <div className="flex items-center justify-center group">
                <a
                  onClick={() => setShowSignUp(true)}
                  className="relative flex items-center justify-center duration-200 group-hover:-translate-y-2 group-hover:scale-120 group-hover:text-[var(--color-highlight)]"
                >
                  <FaSignInAlt />
                </a>
                <a
                  onClick={() => setShowSignUp((prev) => !prev)}
                  className="absolute flex items-center justify-center mt-20 opacity-0 duration-200 group-hover:opacity-100 px-4 rounded-full pointer-events-none"
                >
                  <span className="md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-highlight">
                    ignition
                  </span>
                </a>
              </div>

              <div className="flex items-center justify-center group">
                <a
                  href="/profile"
                  className="relative flex items-center justify-center duration-200 group-hover:-translate-y-2 group-hover:scale-120 group-hover:text-[var(--color-highlight)]"
                >
                  <FaUserCircle />
                </a>
                <a
                  href="/profile"
                  className="absolute flex items-center justify-center mt-20 opacity-0 duration-200 group-hover:opacity-100 px-4 rounded-full pointer-events-none"
                >
                  <span className="md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-highlight">
                    profile
                  </span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ———————————————————————————————————— nav section ——— */}
      {hideNav && (
        <div className="contents">
          <div className="inset-0 fixed backdrop-blur-xs pointer-events-none z-50"></div>
          <div
            ref={navRef}
            className="h-screen shadow-2xl fixed z-50 top-0 right-0 w-[60vw] bg-panel p-4"
          >
            <button onClick={() => setHideNav(false)}>
              <FaTimes className="cursor-pointer top-4 right-4 text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110" />
            </button>
            <div className="flex flex-col p-4 gap-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal z-[60] cursor-pointer">
              <a href="#cars">
                <p>cars</p>
              </a>
              <a href="#about">
                <p>about</p>
              </a>
              <a href="#contact">
                <p>contact</p>
              </a>
              <a onClick={() => setShowSignUp(true)} className="flex">
                <p>ignition</p>
              </a>
              <a href="/profile">
                <p>profile</p>
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center min-h-screen px-8 sm:px-16 md:px-32 lg:px-64 xl:px-80">
        <div className="flex flex-col lg:flex-row items-center w-4/5 sm:w-3/4">
          <div className="p-2 mb-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-header font-bold text-left leading-8 sm:leading-10 md:leading-13 lg:leading-16 xl:leading-20">
              modern renting, <br /> local trust
            </h1>
            <p className="text-normal text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal leading-4.5 sm:leading-6 md:leading-7 lg:leading-8 xl:leading-9">
              from daily rides to long-term needs, arqila makes renting simple
              and reliable
            </p>
            <a href="#cars">
              <GetStarted />
            </a>
          </div>
        </div>
      </div>

      {showSignUp && (
        <div className="fixed inset-0 backdrop-blur-xs z-[70] flex items-center justify-center">
          <SignUp onClose={() => setShowSignUp(false)} />
        </div>
      )}
    </div>
  );
}
