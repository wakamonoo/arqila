import { MdDriveEta, MdSecurity, MdVerified } from "react-icons/md";

export default function About() {
  return (
    <div className="p-12 sm:px-24 md:px-32 lg:px-48 xl:px-64 mt-16">
      <div className="flex justify-center mb-16">
        <div className="flex flex-col leading-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-center leading-5 sm:leading-11 md:leading-17">why arqila?</h1>
          <p className="text-normal text-base sm:text-xl md:text-2xl font-normal text-center">
            — your ride our promise
          </p>
        </div>
      </div>

      <div>
        <p className="text-normal text-base sm:text-xl md:text-2xl font-normal text-justify">
          At Arqila, we make car rentals effortless and flexible. Whether you
          want to drive yourself or prefer a professional driver, we provide
          reliable vehicles and convenient services to get you where you need to
          go—safely and comfortably.
        </p>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8">
          <div className="flex flex-col items-center justify-center w-[80vw] sm:w-[40vw] md:w-[30vw] lg:w-[20vw] p-4 bg-panel rounded-t-lg">
            <MdDriveEta className="text-7xl sm:text-8xl md:text-9xl" />
            <h2 className="text-header text-center font-heading text-base sm:text-xl md:text-2xl font-semibold leading-4 sm:leading-5 md:leading-6 mt-2">
              Driving
              <br />
              Convenience
            </h2>
            <p className="text-center font-normal text-normal text-base sm:text-xl md:text-2xl leading-4 sm:leading-5 md:leading-6 mt-4 px-4">Drive freely in our ready-to-go, well-maintained cars.</p>
          </div>

          <div className="flex flex-col items-center justify-center w-[80vw] sm:w-[40vw] md:w-[30vw] lg:w-[20vw] p-4 bg-panel rounded-t-lg">
            <MdSecurity className="text-7xl sm:text-8xl md:text-9xl" />
            <h2 className="text-header text-center font-heading text-base sm:text-xl md:text-2xl font-semibold leading-4 sm:leading-5 md:leading-6 mt-2">
              Driver
              <br />
              Service
            </h2>
            <p className="text-center font-normal text-normal text-base sm:text-xl md:text-2xl leading-4 sm:leading-5 md:leading-6 mt-4 px-4">Rely on our professional drivers for a smooth, comfortable, and hassle-free ride.</p>
          </div>

          <div className="flex flex-col items-center justify-center w-[80vw] sm:w-[40vw] md:w-[30vw] lg:w-[20vw] px-4 py-12 bg-panel rounded-t-lg">
            <MdVerified className="text-7xl sm:text-8xl md:text-9xl" />
            <h2 className="text-header text-center font-heading text-base sm:text-xl md:text-2xl font-semibold leading-4 sm:leading-5 md:leading-6 mt-2">
              Safety &
              <br />
              Reliable
            </h2>
            <p className="text-center font-normal text-normal text-base sm:text-xl md:text-2xl leading-4 sm:leading-5 md:leading-6 mt-4 px-4">Travel with peace of mind in our safe, thoroughly inspected, and dependable cars.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
