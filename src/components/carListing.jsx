"use client";
import { FaBoxOpen, FaPencilAlt, FaTrash } from "react-icons/fa";
import { MdClose } from "react-icons/md";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
import Swal from "sweetalert2";

export default function CarListing({
  carList,
  setCarVal,
  carVal,
  handleCarEdit,
  editCar,
  setEditCar,
  setCarList,
}) {
  const handleCarEditChange = (e) => {
    setCarVal((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = async (carid) => {
    try {
      const res = await fetch(`${BASE_URL}/api/cars/deleteCar/${carid}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setCarList((prev) => prev.filter((car) => car.carid !== carid));
        Swal.fire({
          title: "Success",
          text: "Car Deleted",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Failed",
          text: data.error || "Car Deletion Faild",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Server Error",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-4 w-full px-4">
        {carList.length === 0 ? (
          <div className="flex flex-col justify-center items-center">
            <FaBoxOpen className="w-[32vw] sm:w-[24vw] md:w-[16vw] h-auto" />
            <p className="text-sm sm:text-base md:text-xl text-label font-normal">
              nothing to display yet
            </p>
          </div>
        ) : (
          carList.map((car) => {
            return (
              <div key={car.carid}>
                <div className="flex justify-between items-center p-4 bg-second rounded w-full">
                  <h2 className="font-heading text-normal truncate w-40 sm:w-45 md:w-50 lg:w-55 text-base sm:text-xl md:text-2xl">
                    {car.car}
                  </h2>
                  <div className="flex gap-2">
                    <div className="flex text-center items-center justify-center cursor-pointer text-xl sm:text-2xl md:text-3xl bg-highlight duration-200 hover:bg-[var(--color-accent)]  p-2 rounded-full">
                      <button
                        onClick={() => {
                          setCarVal(car);
                          setEditCar(true);
                        }}
                        className="cursor-pointer"
                      >
                        <FaPencilAlt />
                      </button>
                    </div>
                    <div className="flex text-center items-center justify-center cursor-pointer text-xl sm:text-2xl md:text-3xl bg-red-600 duration-200 hover:bg-red-700  p-2 rounded-full">
                      <button
                        onClick={() => handleDelete(car.carid)}
                        className="cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {editCar && (
        <div className="fixed w-full inset-0 backdrop-blur-xs z-[70] flex items-center justify-center">
          <div className="relative bg-panel w-[350px] sm:w-[400px] md:w-[450px] h-[400px] sm:h-[450px] md:h-[500px] rounded-2xl p-6">
            <MdClose
              onClick={() => setEditCar(false)}
              className="absolute cursor-pointer right-4 top-4 text-2xl sm:text-3xl md:text-4xl font-bold duration-200 hover:scale-110 active:scale-110"
            />
            <div className="mt-[6vh] flex flex-col h-[calc(100%-6vh-2rem)] gap-4 overflow-y-auto pr-2">
              <input
                type="text"
                placeholder="car model"
                name="car"
                value={carVal.car}
                onChange={handleCarEditChange}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3"
              />
              <input
                type="text"
                placeholder="year of manufacture"
                name="year"
                value={carVal.year}
                onChange={handleCarEditChange}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3"
              />
              <input
                type="text"
                placeholder="seat capacity"
                name="seat"
                value={carVal.seat}
                onChange={handleCarEditChange}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3"
              />
              <input
                type="text"
                placeholder="starting price per day"
                name="price"
                value={carVal.price}
                onChange={handleCarEditChange}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3"
              />
              <select
                name="fuel"
                value={carVal.fuel}
                onChange={handleCarEditChange}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3 text-gray-500"
              >
                <option value="null">select fuel type</option>
                <option value="diesel">diesel</option>
                <option value="gasoline">gasoline</option>
              </select>
              <select
                name="transmission"
                value={carVal.transmission}
                onChange={handleCarEditChange}
                className="rounded bg-second font-normal text-base sm:text-xl md:text-2xl w-ful p-3 text-gray-500"
              >
                <option value="null">select transmission type</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
              <select
                name="aircon"
                value={carVal.aircon}
                onChange={handleCarEditChange}
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
                  setCarVal({ ...carVal, image: e.target.files[0] })
                }
                className="bg-second font-normal text-base sm:text-xl md:text-2xl w-full p-3 rounded text-gray-500"
              />
              <button
                onClick={() => handleCarEdit(carVal)}
                className="bg-highlight group duration-200 cursor-pointer hover:bg-[var(--color-secondary)] p-4 w-fit rounded-full"
              >
                <p className="text-second duration-200 group-hover:text-[var(--color-highlight)] text-xl sm:text-2xl md:text-3xl">
                  Edit Car
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
