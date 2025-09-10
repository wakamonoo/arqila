"use client";
import Image from "next/image";
import Logo from "@/assets/wkmn.png";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer({ setShowSignUp }) {
  return (
    <div className="bg-panel mt-4 sm:mt-8 md:mt-16 lg:mt-32 xl:mt-64 flex justify-between px-4 gap-2 py-8 sm:p-16 md:p-24 lg:px-32 xl:px-48 2xl:px-84 w-full">
      <div className="w-[40%] flex flex-col">
        <h1 className="text-xl sm:text-2xl md:text-3xl text-highlight font-extrabold">
          Modern Renting, Local Trust!
        </h1>
        <button className="bg-highlight mt-2 group duration-200 cursor-pointer hover:bg-[var(--color-secondary)] p-4 rounded-full w-fit">
          <p className="text-normal text-second duration-200 group-hover:text-[var(--color-highlight)] text-base sm:text-xl md:text-2xl uppercase font-bold">
            GET STARTED
          </p>
        </button>
      </div>
      <div className="w-[15%] text-base sm:text-xl md:text-2xl flex flex-col">
        <a
          href="#cars"
          className="cursor-pointer hover:text-[var(--color-highlight)] focus:text-[var(--color-highlight)]"
        >
          <p>cars</p>
        </a>
        <a
          href="#about"
          className="cursor-pointer hover:text-[var(--color-highlight)] focus:text-[var(--color-highlight)]"
        >
          <p>about</p>
        </a>
        <a
          href="#contact"
          className="cursor-pointer hover:text-[var(--color-highlight)] focus:text-[var(--color-highlight)]"
        >
          <p>contact</p>
        </a>
        <button
          onClick={() => setShowSignUp(true)}
          className="flex cursor-pointer hover:text-[var(--color-highlight)] focus:text-[var(--color-highlight)]"
        >
          <p>ignition</p>
        </button>
        <a
          href="/chat"
          className="cursor-pointer hover:text-[var(--color-highlight)] focus:text-[var(--color-highlight)]"
        >
          arqchat
        </a>
        <a
          href="/profile"
          className="cursor-pointer hover:text-[var(--color-highlight)] focus:text-[var(--color-highlight)]"
        >
          <p>profile</p>
        </a>
      </div>
      <div className="w-[45%] flex flex-col items-center">
        <div className="flex gap-1 justify-center items-center w-full p-2">
          <a href="https://wakamonoo.vercel.app/">
            <Image
              src={Logo}
              alt="wkmn"
              className="w-16 sm:w-24 md:w-32 h-auto cursor-pointer"
            />
          </a>
          <p className="font-bold text-xs sm:text-sm md:text-base">
            GET IN TOUCH WITH ME!
          </p>
          <div className="flex flex-wrap gap-1 pl-2 sm:pl-4">
            <a
              href="https://www.facebook.com/joven.serdanbataller"
              className="text-2xl sm:text-3xl md:text-4xl cursor-pointer duration-150 hover:-translate-y-2 hover:text-[var(--color-highlight)] focus:-translate-y-2 focus:text-[var(--color-highlight)]"
            >
              <FaFacebook className="text-2xl sm:text-3xl md:text-4xl cursor-pointer duration-150 hover:-translate-y-2 hover:text-[var(--color-highlight)] focus:-translate-y-2 focus:text-[var(--color-highlight)]" />
            </a>
            <a href="https://www.instagram.com/wakamonoooo/">
              <FaInstagram className="text-2xl sm:text-3xl md:text-4xl cursor-pointer duration-150 hover:-translate-y-2 hover:text-[var(--color-highlight)] focus:-translate-y-2 focus:text-[var(--color-highlight)]" />
            </a>
            <a href="https://www.linkedin.com/in/joven-bataller-085761350/">
              <FaLinkedin className="text-2xl sm:text-3xl md:text-4xl cursor-pointer duration-150 hover:-translate-y-2 hover:text-[var(--color-highlight)] focus:-translate-y-2 focus:text-[var(--color-highlight)]" />
            </a>
            <a href="https://github.com/wakamonoo">
              <FaGithub className="text-2xl sm:text-3xl md:text-4xl cursor-pointer duration-150 hover:-translate-y-2 hover:text-[var(--color-highlight)] focus:-translate-y-2 focus:text-[var(--color-highlight)]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
