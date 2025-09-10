"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaFile } from "react-icons/fa";
import { FcApprove, FcEmptyTrash } from "react-icons/fc";
import { MdApproval, MdClose, MdPending } from "react-icons/md";
import Swal from "sweetalert2";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Admin() {
  const [driverPreneurs, setDriverPreneurs] = useState([]);
  const [showLegals, setShowLegals] = useState(false);
  const [selectDrivers, setSelectDrivers] = useState(null);

  useEffect(() => {
    const getDriverReg = async () => {
      const res = await fetch(`${BASE_URL}/api/register/regGet`);
      const drivers = await res.json();
      setDriverPreneurs(drivers);
    };

    getDriverReg();
  }, []);

  const handleSubmit = async () => {
    try {
      const res1 = await fetch(`${BASE_URL}/api/users/driverReg`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          uid: selectDrivers.uid,
        }),
      });

      const res2 = await fetch(`${BASE_URL}/api/register/driverUp`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          uid: selectDrivers.uid,
        }),
      });

      const data1 = await res1.json();
      const data2 = await res2.json();
      if (res1.ok && res2.ok) {
        Swal.fire({
          title: "Congrats",
          text: "You are now a DriverPreneur",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        window.location.reload();
        setShowLegals(false);
      } else {
        Swal.fire({
          title: "Error",
          text: data1.error || data2.error || "Process Failed",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Failed",
        text: "Server Failed Try Again Later",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleDemote = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/register/driverDem`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          uid: selectDrivers.uid,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: "Congrats",
          text: "You are now a DriverPreneur",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        window.location.reload();
        setShowLegals(false);
      } else {
        Swal.fire({
          title: "Error",
          text: data.error || "Process Failed",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Failed",
        text: "Server Failed Try Again Later",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div>
      <div className="py-12 sm:px-24 md:px-32 lg:px-48 xl:px-64 ">
        <a href="/">
          <FaArrowLeft className="absolute cursor-pointer left-[6vw] text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110" />
        </a>
        <div className="flex justify-center items-center">
          <h1 className="text-header text-xl sm:text-2xl md:text-3xl font-extrabold text-center uppercase px-12">
            Konnichiwa, Wakamonoo!
          </h1>
        </div>
        <div className="flex flex-col justify-center items-center mt-8">
          {driverPreneurs.length === 0 ? (
            <div className="flex flex-col justify-center gap-2 items-center p-8">
              <FaFile className="text-7xl sm:text-8xl md:text-9xl" />
              <p className="text-xs sm:text-sm md:text-base font-normal">
                nothing to show yet
              </p>
            </div>
          ) : (
            driverPreneurs.map((driverPren) => {
              return (
                <div
                  key={driverPren.uid}
                  className="grid grid-cols-1 mt-[4vh] md:grid-cols-2 gap-6 lg:gap-16 xl:gap-24 2xl:gap-32"
                >
                  <div>
                    <div className="flex justify-left items-center gap-1">
                      <MdPending className="text-2xl sm:text-3xl md:text-4xl" />
                      <h4 className="text-base sm:text-xl md:text-2xl font-normal">
                        Pending Requests:
                      </h4>
                    </div>
                    {driverPreneurs.filter((d) => d.status === "pending")
                      .length === 0 ? (
                      <div className="flex flex-col justify-center gap-2 items-center p-8">
                        <FaFile className="text-7xl sm:text-8xl md:text-9xl" />
                        <p className="text-xs sm:text-sm md:text-base font-normal">
                          no pending requests
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectDrivers(driverPren);
                          setShowLegals(true);
                        }}
                        className="flex bg-highlight gap-6 rounded-full items-center cursor-pointer w-fill p-4 px-8 mt-4"
                      >
                        <h4 className="text-base sm:text-xl md:text-2xl font-bold">
                          {driverPren.name}
                        </h4>
                        <p className="text-xs sm:text-base md:texl-xl text-label">
                          {driverPren.submittedAt}
                        </p>
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-left gap-1">
                      <MdApproval className="text-2xl sm:text-3xl md:text-4xl" />
                      <h4 className="text-base sm:text-xl md:text-2xl font-normal">
                        Approved Requests:
                      </h4>
                    </div>
                    {driverPreneurs.filter((d) => d.status === "approved")
                      .length === 0 ? (
                      <div className="flex flex-col justify-center gap-2 items-center p-8">
                        <FaFile className="text-7xl sm:text-8xl md:text-9xl" />
                        <p className="text-xs sm:text-sm md:text-base font-normal">
                          no approved requests
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectDrivers(driverPren);
                          setShowLegals(true);
                        }}
                        className="flex bg-panel gap-6 rounded-full items-center cursor-pointer w-fill p-4 px-8 mt-4"
                      >
                        <h4 className="text-base sm:text-xl md:text-2xl font-bold">
                          {driverPren.name}
                        </h4>
                        <p className="text-xs sm:text-sm md:text-base text-label">
                          {driverPren.submittedAt}
                        </p>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showLegals && selectDrivers && (
        <div
          onClick={() => setShowLegals(false)}
          className="fixed w-full inset-0 backdrop-blur-xs z-[70] flex items-center justify-center"
        >
          <div className="relative bg-panel w-[350px] sm:w-[400px] md:w-[450px] lg:w-[500px] xl:w-[550px] h-3/4 rounded-2xl p-6">
            <MdClose
              onClick={() => setShowLegals(false)}
              className="absolute cursor-pointer right-4 top-4 text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110"
            />
            <div className="mt-[6vh] flex flex-col h-[calc(100%-6vh-2rem)] gap-4 overflow-y-auto pr-2">
              <p className="text-base sm:text-xl md:text-2xl font-bold text-header uppercase">
                or/cr:
              </p>
              <Image
                src={selectDrivers.orcr}
                alt="orcr"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-full object-cover"
              />

              <p className="text-base sm:text-xl md:text-2xl font-bold text-header uppercase">
                driver's license
              </p>
              <Image
                src={selectDrivers.license}
                alt="license"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-full object-cover"
              />

              <button
                onClick={
                  selectDrivers.status === "approved"
                    ? handleDemote
                    : handleSubmit
                }
                className="bg-highlight group duration-200 cursor-pointer hover:bg-[var(--color-secondary)] p-4 w-fit rounded-full"
              >
                <p className="text-second duration-200 group-hover:text-[var(--color-highlight)] text-xl sm:text-2xl md:text-3xl">
                  {selectDrivers.status === "approved"
                    ? "demote to user"
                    : "approve application"}
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
