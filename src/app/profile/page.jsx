"use client";
import DriverApp from "@/components/driverprenuerApp";
import { auth, googleSignUp } from "@/firebase/firebaseConfig";
import { useState, useEffect, useRef } from "react";
import {
  FaArrowLeft,
  FaUserAltSlash,
  FaCar,
  FaCarSide,
  FaCrown,
  FaList,
} from "react-icons/fa";
import Swal from "sweetalert2";
import Loader from "@/components/loader";
import { MdClose, MdDriveEta } from "react-icons/md";
import Fallback from "@/assets/user.png";
import CarListing from "@/components/carListing";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Profile() {
  const [fbAuth, setFbAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [driverApp, setDriverApp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [showDriver, setShowDriver] = useState(false);
  const [edit, setEdit] = useState(false);
  const divRef = useRef();
  const ListRef = useRef();
  const [form, setForm] = useState({
    name: "",
    contact: "",
    address: "",
    info: "",
  });
  const [carForm, setCarForm] = useState({
    car: "",
    year: "",
    seat: "",
    price: "",
    fuel: "",
    transmission: "",
    aircon: "",
    image: null,
  });
  const [carList, setCarList] = useState([]);
  const [addCar, setAddCar] = useState(false);
  const [carVal, setCarVal] = useState({
    car: "",
    aircon: "",
    fuel: "",
    image: null,
    price: "",
    seat: "",
    transmission: "",
    year: "",
  });
  const [editCar, setEditCar] = useState(false);
  const [showDriverPage, setShowDriverPage] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (logged) => {
      setFbAuth(logged);
      if (logged) {
        try {
          const res = await fetch(`${BASE_URL}/api/users/users/${logged.uid}`);
          const dbUser = await res.json();
          setUser(dbUser);

          setForm({
            name: dbUser.name || "",
            contact: dbUser.contact || "",
            address: dbUser.address || "",
            info: dbUser.info || "",
          });

          if (dbUser && dbUser.role === "driver") {
            setShowDriverPage(true);
          } else {
            setShowDriverPage(false);
          }
        } catch (err) {
          console.error("failed to fetch user from db, error:", err);
        }
      } else {
        setUser(null);
      }
      if (logged) {
        try {
          const res = await fetch(
            `${BASE_URL}/api/cars/carsList/${logged.uid}`
          );
          const dbCars = await res.json();

          setCarList(dbCars);

          setCarVal({
            car: dbCars.car,
            aircon: dbCars.aircon,
            fuel: dbCars.fuel,
            image: dbCars.image,
            price: dbCars.price,
            seat: dbCars.seat,
            transmission: dbCars.transimission,
            year: dbCars.year,
          });
        } catch (err) {
          console.error("failed to fetch carlist:", err);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleEdit(e) {
      if (divRef.current && !divRef.current.contains(e.target)) {
        setEdit(false);
      }
    }

    document.addEventListener("mousedown", handleEdit);
    return () => {
      document.removeEventListener("mousedown", handleEdit);
    };
  }, []);

  useEffect(() => {
    function handleAdd(e) {
      if (ListRef.current && !ListRef.current.contains(e.target)) {
        setAddCar(false);
      }
    }

    document.addEventListener("mousedown", handleAdd);
    return () => {
      document.removeEventListener("mousedown", handleAdd);
    };
  }, []);

  const handleInputChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCarInput = (e) => {
    setCarForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCarSubmit = async () => {
    try {
      let imageURL = "";

      if (carForm.image) {
        const formData = new FormData();
        formData.append("file", carForm.image);

        const uploadRes = await fetch(`${BASE_URL}/api/images/imageUpload`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "image upload failed");
        }

        imageURL = uploadData.url;
      }

      const res = await fetch(`${BASE_URL}/api/cars/addCar`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          uid: fbAuth.uid,
          ...carForm,
          image: imageURL,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: "Success",
          text: "Car Listing Added",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        setCarForm({
          car: "",
          year: "",
          seat: "",
          fuel: "",
          price: "",
          transmission: "",
          aircon: "",
        });
        setAddCar(false);
      } else {
        Swal.fire({
          title: "Error",
          text: data.error || "Updload Failed",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Server Failed, try again later",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleCarEdit = async () => {
    try {
      let imageURL = carVal.image;

      if (carVal.image && carVal.image instanceof File) {
        const formData = new FormData();
        formData.append("file", carVal.image);

        const uploadRes = await fetch(`${BASE_URL}/api/images/imageUpload`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "image upload failed");
        }

        imageURL = uploadData.url;
      }

      const res = await fetch(`${BASE_URL}/api/cars/updateCar`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          ...carVal,
          image: imageURL,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: "Success",
          text: "Car Listing Updated",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });

        setCarForm({
          ...carVal,
          image: imageURL,
        });

        setEditCar(false);
      } else {
        Swal.fire({
          title: "Error",
          text: data.error || "Upload Failed",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Server Failed, try again later",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/updateUser`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          uid: fbAuth.uid,
          ...form,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: "Success",
          text: "Profile Updated",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        setUser((prev) => ({ ...prev, ...form }));
        setEdit(false);
      } else {
        Swal.fire({
          title: "Error",
          text: data.error || "Updated Failed",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Server Failed, try again later",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="py-12 sm:px-24 md:px-32 lg:px-48 xl:px-64 ">
      <a href="/">
        <FaArrowLeft className="absolute cursor-pointer left-[6vw] text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110" />
      </a>

      {loading ? (
        <div className="flex justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full p-24 sm:px-32 md:px-48 lg:px-64 xl:px-82">
          <Loader />
        </div>
      ) : user ? (
        <div>
          <div className="flex flex-col justify-center items-center gap-2 mt-8">
            <img
              src={fbAuth.photoURL || Fallback}
              className="w-32 sm:w-40 md:w-50 rounded-full"
              alt="user"
            />
            <p className="text-header text-xl sm:text-2xl md:text-3xl font-extrabold text-center uppercase">
              {fbAuth.displayName}
            </p>
          </div>
          <div className="flex justify-center">
            {user.role === "driver" ? (
              <div className="bg-highlight cursor-pointer p-4 w-fill rounded-full mt-2">
                <div className="flex text-base sm:text-xl md:text-2xl font-normal items-center justify-center gap-2">
                  <p className="text-second duration-200 group-hover:text-[var(--color-highlight)] uppercase font-bold">
                    DriverPreneur
                  </p>
                  <FaCrown className="text-second" />
                </div>
              </div>
            ) : (
              <button
                onClick={() => setDriverApp(true)}
                className="bg-highlight group duration-200 cursor-pointer hover:bg-[var(--color-secondary)] p-4 w-fill rounded-full mt-2"
              >
                <div className="flex text-base sm:text-xl md:text-2xl font-normal items-center justify-center gap-2">
                  <FaCar className="text-second duration-200 group-hover:text-[var(--color-highlight)]" />
                  <p className="text-second duration-200 group-hover:text-[var(--color-highlight)] uppercase font-bold">
                    driverpreneur sign-up
                  </p>
                </div>
              </button>
            )}
          </div>

          <div className="flex justify-center items-center gap-24 sm:gap-30 md:gap-36 mt-8">
            <button
              onClick={() => {
                setShowDriver(false), setShowInfo(true);
              }}
              className={`pb-2 cursor-pointer ${
                showInfo
                  ? "border-b-2 border-[var(--color-highlight)]"
                  : "border-none"
              }`}
            >
              <p
                className={`${
                  showInfo ? "text-header" : "text-normal"
                } text-base sm:text-xl md:text-2xl font-semibold`}
              >
                Personal Info
              </p>
            </button>
            <button
              onClick={() => {
                setShowDriver(true), setShowInfo(false);
              }}
              className={`pb-2 cursor-pointer ${
                showDriver
                  ? "border-b-2 border-[var(--color-highlight)]"
                  : "border-none"
              }`}
            >
              <p
                className={`${
                  showDriver ? "text-header" : "text-normal"
                } text-base sm:text-xl md:text-2xl font-semibold`}
              >
                Driver Page
              </p>
            </button>
          </div>

          {showInfo && (
            <div className="flex justify-center items-center flex-col gap-2 p-4 mt-2">
              <div className="flex flex-col md:grid md:grid-cols-2 p-2 gap-2 sm:gap-4 md:gap-6 max-w-4xl w-full">
                <p className="text-header font-heading text-base sm:text-xl md:text-2xl leading-6 sm:leading-8 md:leading-10">
                  Full Name:
                  <br />
                  <span className="font-normal text-normal border-l-2 px-2 border-[var(--color-highlight)] text-base sm:text-xl md:text-2xl">
                    {user.name}
                  </span>
                </p>
                <p className="text-header font-heading text-base sm:text-xl md:text-2xl leading-6 sm:leading-8 md:leading-10">
                  Email:
                  <br />
                  <span className="font-normal text-normal border-l-2 px-2 border-[var(--color-highlight)] text-base sm:text-xl md:text-2xl">
                    {user.email}
                  </span>
                </p>
                <p className="text-header font-heading text-base sm:text-xl md:text-2xl leading-6 sm:leading-8 md:leading-10">
                  Contact:
                  <br />
                  <span
                    className={`font-normal border-l-2 px-2 border-[var(--color-highlight)] text-base sm:text-xl md:text-2xl ${
                      !user.contact ? "italic text-gray-500" : "text-normal"
                    }`}
                  >
                    {user.contact || "contact not yet added"}
                  </span>
                </p>
                <p className="text-header font-heading text-base sm:text-xl md:text-2xl leading-6 sm:leading-8 md:leading-10">
                  Address:
                  <br />
                  <span
                    className={`block text-justify font-normal border-l-2 px-2 border-[var(--color-highlight)] text-base sm:text-xl md:text-2xl  ${
                      !user.address ? "italic text-gray-500" : "text-normal"
                    }`}
                  >
                    {user.address || "contact not yet added"}
                  </span>
                </p>
                <p className="text-header font-heading text-base sm:text-xl md:text-2xl leading-6 sm:leading-8 md:leading-10 text-justify col-span-2">
                  Why you?
                  <br />
                  <span
                    className={`font-normal border-l-2 px-2 border-[var(--color-highlight)] text-base sm:text-xl md:text-2xl ${
                      !user.info ? "italic text-gray-500" : "text-normal"
                    }`}
                  >
                    {user.info || "why should rentors choose you?"}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setEdit(true)}
                className="mt-4 bg-highlight group duration-200 cursor-pointer hover:bg-[var(--color-secondary)] p-4 w-fit rounded-full"
              >
                <p className="text-second duration-200 group-hover:text-[var(--color-highlight)] ttext-base sm:text-xl md:text-2xl uppercase font-bold">
                  edit information
                </p>
              </button>
            </div>
          )}
          {showDriver ? (
            showDriverPage ? (
              <div className="flex flex-col justify-center items-center mt-2 gap-2 p-4">
                <div className="flex items-center gap-1 p-4 text-header">
                  <FaList className="text-2xl sm:text-3xl md:text-4xl" />
                  <h4 className="text-base sm:text-xl md:text-2xl font-normal">
                    Your Car Listing:
                  </h4>
                </div>
                <CarListing
                  carList={carList}
                  setCarList={setCarList}
                  handleCarSubmit={handleCarSubmit}
                  carVal={carVal}
                  setCarVal={setCarVal}
                  handleCarEdit={handleCarEdit}
                  editCar={editCar}
                  setEditCar={setEditCar}
                />
                <button
                  onClick={() => setAddCar(true)}
                  className="mt-4 bg-highlight group duration-200 cursor-pointer hover:bg-[var(--color-secondary)] p-4 w-fit rounded-full"
                >
                  <p className="text-second duration-200 group-hover:text-[var(--color-highlight)] text-base sm:text-xl md:text-2xl uppercase font-bold">
                    list a car
                  </p>
                </button>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center mt-16 font-bold">
                <FaCarSide className="text-7xl sm:text-8xl md:text-9xl" />
                <p className="text-header text-base sm:text-xl md:text-2xl font-bold">
                  driver access required
                </p>
              </div>
            )
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-2 justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <FaUserAltSlash className="text-7xl sm:text-8xl md:text-9xl" />
          <p className="text-header text-base sm:text-xl md:text-2xl font-bold">
            kindly login first
          </p>
        </div>
      )}

      {driverApp && (
        <div className="fixed inset-0 backdrop-blur-xs z-[70] flex items-center justify-center">
          <DriverApp onExit={() => setDriverApp(false)} user={user} />
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 backdrop-blur-xs z-[70] flex items-center justify-center">
          <div
            ref={divRef}
            className="relative bg-panel w-[350px] sm:w-[400px] md:w-[450px] h-[400px] sm:h-[450px] md:h-[500px] rounded-2xl overflow-hidden p-6"
          >
            <button className="absolute cursor-pointer right-4 top-4 text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110">
              <MdClose onClick={() => setEdit(false)} />
            </button>
            <div className="mt-[6vh] flex flex-col h-[calc(100%-6vh-2rem)] gap-4 overflow-y-auto pr-2">
              <input
                type="text"
                placeholder="Full Name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-full p-3"
              />
              <input
                type="text"
                placeholder="Contact Number"
                name="contact"
                value={form.contact}
                onChange={handleInputChange}
                className="rounded  bg-second font-normal text-base sm:text-xl md:text-2xl w-full p-3"
              />
              <input
                type="text"
                placeholder="Address"
                name="address"
                value={form.address}
                onChange={handleInputChange}
                className="rounded  bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3"
              />
              <textarea
                type="text"
                placeholder="Why should rentors should choose you?"
                name="info"
                value={form.info}
                onChange={handleInputChange}
                className="rounded  bg-second font-normal text-base sm:text-xl md:text-2xl w-ful min-h-[20vh] p-3"
              />
              <button
                onClick={handleSubmit}
                className="bg-highlight group duration-200 cursor-pointer hover:bg-[var(--color-secondary)] p-4 w-fit rounded-full"
              >
                <p className="text-second duration-200 group-hover:text-[var(--color-highlight)] text-xl sm:text-2xl md:text-3xl">
                  Submit Changes
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {addCar && (
        <div className="fixed w-full inset-0 backdrop-blur-xs z-[70] flex items-center justify-center">
          <div
            ref={ListRef}
            className="relative bg-panel w-[350px] sm:w-[400px] md:w-[450px] h-[400px] sm:h-[450px] md:h-[500px] rounded-2xl p-6"
          >
            <MdClose
              onClick={() => setAddCar(false)}
              className="absolute cursor-pointer right-4 top-4 text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110"
            />
            <div className="mt-[6vh] flex flex-col h-[calc(100%-6vh-2rem)] gap-4 overflow-y-auto pr-2">
              <input
                type="text"
                placeholder="car model"
                name="car"
                value={carForm.car}
                onChange={handleCarInput}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3"
              />
              <input
                type="text"
                placeholder="year of manufacture"
                name="year"
                value={carForm.year}
                onChange={handleCarInput}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3"
              />
              <input
                type="text"
                placeholder="seat capacity"
                name="seat"
                value={carForm.seat}
                onChange={handleCarInput}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3"
              />
              <input
                type="text"
                placeholder="starting price per day"
                name="price"
                value={carForm.price}
                onChange={handleCarInput}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3"
              />
              <select
                name="fuel"
                onChange={handleCarInput}
                value={carForm.fuel}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3 text-gray-500"
              >
                <option value="null">select fuel type</option>
                <option value="diesel">diesel</option>
                <option value="gasoline">gasoline</option>
              </select>
              <select
                name="transmission"
                onChange={handleCarInput}
                value={carForm.transmission}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3 text-gray-500"
              >
                <option value="null">select transmission type</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
              <select
                name="aircon"
                onChange={handleCarInput}
                value={carForm.aircon}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3 text-gray-500"
              >
                <option value="">air conditioning available?</option>
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
              <label className="text-gray-500 font-normal text-base sm:text-xl md:text-2xl">
                Upload Car Image:
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setCarForm({ ...carForm, image: e.target.files[0] })
                }
                className="bg-second font-normal text-base sm:text-xl md:text-2xl w-full p-3 rounded text-gray-500"
              />
              <button
                onClick={handleCarSubmit}
                className="bg-highlight group duration-200 cursor-pointer hover:bg-[var(--color-secondary)] p-4 w-fit rounded-full"
              >
                <p className="text-second duration-200 group-hover:text-[var(--color-highlight)] text-xl sm:text-2xl md:text-3xl">
                  Add Car
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
