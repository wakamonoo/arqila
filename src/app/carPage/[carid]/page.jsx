"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaAddressBook,
  FaArrowLeft,
  FaCalendarAlt,
  FaGasPump,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaMarker,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import { MdAcUnit, MdGarage, MdPriceCheck, MdSend } from "react-icons/md";
import Image from "next/image";
import {
  GiCarSeat,
  GiGasPump,
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
        <p className="text-sm sm:text-base md:text-2xl text-label font-normal">
          sorry but no info for this car
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="lg:pl-48 xl:pl-64 lg:pr-0 xl:pr-0 ">
        <a href="/">
          <FaArrowLeft className="absolute cursor-pointer left-[6vw] text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110 mt-12" />
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-[55%_43%] xl:lg:grid-cols-[55%_41%] gap-[2%] xl:gap-[4%] 2xl:lg:grid-cols-[60%_35%] 2xl:gap-[5%] w-full">
          <div className="flex flex-col justify-center items-center pt-12 sm:px-24 md:px-32 lg:px-0 ">
            <Image
              src={car.image}
              alt="car"
              width={0}
              height={0}
              sizes="100vw"
              className="w-46 sm:w-56 h-32 sm:h-42 object-cover"
            />
            <h2 className="text-normal text-center font-heading text-xl sm:text-2xl md:text-3xl font-semibold uppercase">
              {car.car}
            </h2>

            <div className="flex justify-start w-full px-8 mt-4">
              <h2 className="text-base sm:text-xl md:text-2xl font-heading">
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

            <div className="flex justify-start w-full px-8 mt-4">
              <h2 className="text-base sm:text-xl md:text-2xl">The Owner</h2>
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
          </div>
          <div
            id="chat"
            className="flex flex-col relative bg-second w-full h-screen flex-1"
          >
            <div className="flex justify-center bg-panel p-4">
              <h1 className="text-base sm:text-xl md:text-2xl">
                Get in touch with{" "}
                <span className="font-bold">{user?.name}</span>
              </h1>
            </div>
            <div className="bg-panel absolute bottom-0 w-full flex items-center justify-between gap-2 p-4">
              <input
                type="text"
                placeholder="enter your message"
                className="bg-second w-full p-2 rounded text-base sm:text-xl md:text-2xl"
              />
              <MdSend className="text-2xl sm:text-3xl md:text-4xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
