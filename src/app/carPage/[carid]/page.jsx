"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaGasPump,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import { MdAcUnit, MdGarage, MdMessage } from "react-icons/md";
import Image from "next/image";
import { GiCarSeat, GiGearStick, GiPriceTag } from "react-icons/gi";
import Chat from "@/components/chat.jsx";
import Loader from "@/components/loader";
import { auth } from "@/firebase/firebaseConfig";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://arqila.onrender.com"
    : "http://localhost:4000";

export default function CarPage() {
  const { carid } = useParams();
  const [car, setCar] = useState(null);
  const [user, setUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loader, setLoader] = useState(false);
  const chatRef = useRef();
  const botRef = useRef();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((loggedIn) => {
      if(loggedIn) {
        setCurrentUser({
          uid: loggedIn.uid,
          name: loggedIn.displayName,
          email: loggedIn.email,
          photo: loggedIn.photoURL,
        });
      } else {
        setCurrentUser(null);
      }
    });
    return() => {
      unsubscribe();
    }
  }, [])

  useEffect(() => {
    const carFetch = async () => {
      setLoader(true);
      try {
        const res = await fetch(`${BASE_URL}/api/cars/carsDisplay/${carid}`);
        const data = await res.json();
        setCar(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoader(false);
      }
    };
    carFetch();
  }, [carid]);

  useEffect(() => {
    const userFetch = async () => {
      try {
        if (!car || !car.uid) return;
        const res = await fetch(`${BASE_URL}/api/users/users/${car.uid}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };
    userFetch();
  }, [car]);

  useEffect(() => {
    const handleOutClick = (e) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(e.target) &&
        botRef.current &&
        !botRef.current.contains(e.target)
      ) {
        setShowChat(false);
      }
    };

    document.addEventListener("pointerdown", handleOutClick);
    return () => {
      document.removeEventListener("pointerdown", handleOutClick);
    };
  }, []);

  if (loader) {
    return (
      <div className="flex justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full p-24 sm:px-32 md:px-48 lg:px-64 xl:px-82">
        <Loader />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex flex-col left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <MdGarage className="w-[32vw] sm:w-[24vw] md:w-[16vw] h-auto" />
        <p className="text-sm sm:text-base md:text-2xl text-label font-normal">
          sorry but no info for this car
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="pt-12 sm:px-24 md:px-32  lg:px-48 xl:px-64">
        <a href="/">
          <FaArrowLeft className="absolute cursor-pointer left-[6vw] text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110" />
        </a>

        <div className="flex flex-col items-center justify-center mb-2 sm:mb-4 md:mb-8">
          <Image
            src={car.image}
            alt="car"
            width={0}
            height={0}
            sizes="100vw"
            className="w-40 sm:w-56 md:w-64 lg:w-72 xl:w-80 h-28 sm:h-36 md:h-44 lg:h-52 xl:h-60 object-cover rounded"
          />
          <h2 className="text-normal text-center font-heading text-xl sm:text-2xl md:text-3xl font-semibold uppercase border-b-4 border-[var(--color-highlight)]">
            {car.car}
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full">
          <div className="flex flex-col items-center">
            <div className="flex justify-start w-full px-8 mt-4">
              <h2 className="text-base sm:text-xl md:text-2xl font-heading border-b-4 border-[var(--color-highlight)]">
                Car Specifications:
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-1 w-full px-8 divide-y divide-gray-500 pt-4 pb-4">
              <div className="flex justify-between py-2 items-center">
                <div className="flex items-center justify-center gap-1">
                  <FaCalendarAlt className="text-label text-2xl sm:text-3xl md:text-4xl" />
                  <p className="text-base sm:text-xl md:text-2xl">Year Model</p>
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold">
                  {car.year}
                </p>
              </div>

              <div className="flex justify-between py-2 items-center">
                <div className="flex items-center justify-center gap-1">
                  <GiPriceTag className="text-label text-2xl sm:text-3xl md:text-4xl" />
                  <p className="text-base sm:text-xl md:text-2xl">
                    Starting at
                  </p>
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold">
                  ₱{car.price}
                </p>
              </div>

              <div className="flex justify-between py-2 items-center">
                <div className="flex items-center justify-center gap-1">
                  <FaGasPump className="text-label text-2xl sm:text-3xl md:text-4xl" />
                  <p className="text-base sm:text-xl md:text-2xl">Fuel Type</p>
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold capitalize">
                  {car.fuel}
                </p>
              </div>

              <div className="flex justify-between py-2 items-center">
                <div className="flex items-center justify-center gap-1">
                  <GiGearStick className="text-label text-2xl sm:text-3xl md:text-4xl" />
                  <p className="text-base sm:text-xl md:text-2xl">
                    Transmission
                  </p>
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold capitalize">
                  {car.transmission}
                </p>
              </div>

              <div className="flex justify-between py-2 items-center">
                <div className="flex items-center justify-center gap-1">
                  <MdAcUnit className="text-label text-2xl sm:text-3xl md:text-4xl" />
                  <p className="text-base sm:text-xl md:text-2xl">
                    Airconditioning
                  </p>
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold capitalize">
                  {car.aircon}
                </p>
              </div>

              <div className="flex justify-between py-2 items-center">
                <div className="flex items-center justify-center gap-1">
                  <GiCarSeat className="text-label text-2xl sm:text-3xl md:text-4xl" />
                  <p className="text-base sm:text-xl md:text-2xl">
                    Seat Capacity
                  </p>
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold capitalize">
                  {car.seat}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-start w-full px-8 mt-4">
              <h2 className="text-base sm:text-xl md:text-2xl border-b-4 border-[var(--color-highlight)]">
                The Owner
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-1 w-full px-8 divide-y divide-gray-500 pt-4 pb-4">
              <div className="flex justify-between py-2 items-center">
                <div className="flex items-center justify-center gap-1">
                  <FaUser className="text-label text-2xl sm:text-3xl md:text-4xl" />
                  <p className="text-base sm:text-xl md:text-2xl">Name</p>
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold capitalize">
                  {user?.name}
                </p>
              </div>

              <div className="flex justify-between py-2 items-center">
                <div className="flex items-center justify-center gap-1">
                  <FaMapMarkerAlt className="text-label text-2xl sm:text-3xl md:text-4xl" />
                  <p className="text-base sm:text-xl md:text-2xl">Address</p>
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold capitalize">
                  {user?.address}
                </p>
              </div>

              <div className="flex justify-between py-2 items-center">
                <div className="flex items-center justify-center gap-1">
                  <FaPhone className="text-label text-2xl sm:text-3xl md:text-4xl" />
                  <p className="text-base sm:text-xl md:text-2xl">Contact</p>
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold capitalize">
                  {user?.contact}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 justify-start w-full px-8 mt-4">
              <h2 className="text-base sm:text-xl md:text-2xl capitalize border-b-4 border-[var(--color-highlight)] w-fit">
                Why choose me?
              </h2>
              <p className="text-base text-justify sm:text-xl md:text-2xl">
                {user?.info}
              </p>
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 right-4 group">
          <button
            ref={botRef}
            onClick={() => setShowChat((prev) => !prev)}
            className=" p-4 bg-panel rounded-full cursor-pointer group-hover:bg-[var(--color-highlight)]"
          >
            <MdMessage className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-highlight group-hover:text-[var(--color-panel)]" />
          </button>
        </div>

        {showChat && (
          <Chat chatRef={chatRef} user={currentUser} owner={user} car={carid} driver={car?.uid} setShowChat={setShowChat} />
        )}
      </div>
    </div>
  );
}