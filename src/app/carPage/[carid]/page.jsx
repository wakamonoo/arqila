"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaAddressBook, FaArrowLeft, FaCalendarAlt, FaGasPump, FaUser } from "react-icons/fa";
import { MdAcUnit, MdGarage, MdPriceCheck } from "react-icons/md";
import Image from "next/image";
import {
  GiCarSeat,
  GiGearStick,
  GiGearStickPattern,
  GiPriceTag,
} from "react-icons/gi";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://arqila.onrender.com"
    : "http://localhost:4000";

export default function CarPage() {
  const { carid } = useParams();
  const [car, setCar] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const carFetch = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/cars/carsDisplay/${carid}`);
        const data = await res.json();
        setCar(data);
      } catch (err) {
        console.error(err);
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

  if (!car) {
    return (
      <div className="flex flex-col left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <MdGarage className="w-[32vw] sm:w-[24vw] md:w-[16vw] h-auto" />
        <p className="text-sm sm:text-base md:text-xl text-label font-normal">
          sorry but no info for this car
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="py-12 sm:px-24 md:px-32 lg:px-48 xl:px-64 ">
        <a href="/">
          <FaArrowLeft className="absolute cursor-pointer left-[6vw] text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110" />
        </a>

        <div className="flex flex-col justify-center items-center">
          <Image
            src={car.image}
            alt="car"
            width={0}
            height={0}
            sizes="100vw"
            className="w-46 h-32 object-cover"
          />
          <h2 className="text-normal text-center font-heading text-xl sm:text-2xl md:text-3xl font-semibold uppercase">
            {car.car}
          </h2>

          <div className="bg-second py-4 rounded">
            <h2 className="ml-8 text-base">Car Specifications</h2>
            <div className="grid grid-cols-2 gap-1 px-8 relative pt-4 pb-4">
              <div className="absolute bottom-0 left-8 right-8 border-b border-gray-500" />
              <div className="flex gap-1 items-center">
                <FaCalendarAlt className="text-label text-2xl" />
                <p className="text-base">{car.year}</p>
              </div>
              <div className="flex gap-1 items-center">
                <GiPriceTag className="text-label text-2xl" />
                <p className="text-base uppercase">starts ₱{car.price}</p>
              </div>
              <div className="flex gap-1 items-center">
                <FaGasPump className="text-label text-2xl" />
                <p className="text-base uppercase">{car.fuel}</p>
              </div>
              <div className="flex gap-1 items-center">
                <GiGearStickPattern className="text-label text-2xl" />
                <p className="text-base uppercase">{car.transmission}</p>
              </div>
              <div className="flex gap-1 items-center">
                <MdAcUnit className="text-label text-2xl" />
                <p className="text-base uppercase">{car.aircon}</p>
              </div>
              <div className="flex gap-1 items-center">
                <GiCarSeat className="text-label text-2xl" />
                <p className="text-base uppercase">{car.seat} seater</p>
              </div>
            </div>
            <h2 className="ml-8 mt-4 text-base">The Owner</h2>
            <div className="grid grid-cols-1 gap-1 px-8 relative pt-4 pb-4">
              <div className="absolute bottom-0 left-8 right-8 border-b border-gray-500" />
              <div className="flex gap-1 items-center">
                <FaUser className="text-label text-2xl" />
                <p className="text-base">{user?.name}</p>
              </div>
              <div className="flex gap-1 items-center">
                <FaAddressBook className="text-label text-2xl" />
                <p className="text-base">{user?.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
