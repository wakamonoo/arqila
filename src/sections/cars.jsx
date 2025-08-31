"use client";
import Image from "next/image";
import MessageOwner from "@/components/message";
import { useEffect, useState } from "react";
import { FaBoxOpen, FaGasPump } from "react-icons/fa";
import { GiGearStickPattern } from "react-icons/gi";
import { MdAcUnit } from "react-icons/md";
import { useRouter } from "next/navigation";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://arqila.onrender.com"
    : "http://localhost:4000";

export default function Cars() {
  const [carInfo, setCarInfo] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const getCarinfo = async () => {
      const res = await fetch(`${BASE_URL}/api/cars/carsDisplay`);
      const carInf = await res.json();
      setCarInfo(carInf);
    };

    getCarinfo();
  }, []);

  return (
    <div className="p-12 sm:px-24 md:px-32 lg:px-48 xl:px-64 mt-16">
      <div className="flex justify-center mb-16">
        <div className="flex flex-col">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-center leading-5 sm:leading-11 md:leading-17">
            the cars
          </h1>
          <p className="text-normal text-base sm:text-xl text-center md:text-2xl font-normal">
            — find the right ride
          </p>
        </div>
      </div>

      {/* ———————————————————————————————————— cars card ——— */}
      <div className="flex flex-wrap justify-center gap-6">
        {carInfo.length === 0 ? (
          <div className="flex flex-col justify-center items-center">
            <FaBoxOpen className="w-[32vw] sm:w-[24vw] md:w-[16vw] h-auto" />
            <p className="text-sm sm:text-base md:text-xl text-label font-normal">
              nothing to display yet
            </p>
          </div>
        ) : (
          carInfo.map((car) => {
            return (
              <div
                onClick={() => router.push(`/carPage/${car.carid}`)}
                key={car.carid}
                className="flex flex-col overflow-hidden shadow-2xl rounded bg-panel relative w-[300px] h-auto cursor-pointer duration-200 hover:-translate-y-5 hover:shadow-sky-500 active:-translate-y-5 active:shadow-sky-500"
              >
                <div>
                  <Image
                    src={car.image}
                    alt="car"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="py-4">
                  <h2 className="text-normal text-center font-heading text-base sm:text-xl md:text-2xl font-semibold uppercase line-clamp-2 md:h-[64px]">
                    {car.car}
                  </h2>
                  <div className="flex justify-center items-center gap-0.5 p-4">
                    <h2 className="text-3xl sm:text-4xl font-header text-header font-extrabold">
                      ₱{car.price}
                    </h2>
                    <div className="flex flex-col justify-center items-start mt-2">
                      <p className="text-xs sm:text-sm md:text-base font-normal leading-1 text-header">
                        .00
                      </p>
                      <p className="text-xs sm:text-sm md:text-bAse font-normal text-header">
                        Starting
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 py-2 justify-center">
                    <div className="flex justify-center items-center gap-1 text-xs sm:text-sm md:text-base">
                      <FaGasPump />
                      <p className="uppercase text-xs sm:text-sm md:text-base text-label">
                        {car.fuel}
                      </p>
                    </div>
                    <div className="flex justify-center items-center gap-1 text-xs sm:text-sm md:text-base">
                      <GiGearStickPattern />
                      <p className="uppercase text-xs sm:text-sm md:text-base text-label">
                        {car.transmission}
                      </p>
                    </div>
                    <div className="flex justify-center items-center gap-1 text-xs sm:text-sm md:text-base">
                      <MdAcUnit />
                      <p className="uppercase text-xs sm:text-sm md:text-base text-label">
                        {car.aircon}
                      </p>
                    </div>
                  </div>

                  <button onClick={() => router.push(`/carPage/${car.carid}#chat`)} className="flex w-full justify-center items-center mt-4">
                    <MessageOwner />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
