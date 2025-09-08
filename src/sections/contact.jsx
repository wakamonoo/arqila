"use client";
import { useRef } from "react";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";

export default function Contact() {
  const contact = useRef();
  const ejssid = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const ejstid = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const ejspk = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm(ejssid, ejstid, contact.current, ejspk).then(
      () => {
        Swal.fire({
          title: "Succesful!",
          text: "Message Sent",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        contact.current.reset();
      },
      (error) => {
        Swal.fire({
          title: "Error!",
          text: "Message Not Sent",
          icon: "Warning",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        console.error(error.text);
      }
    );
  };

  return (
    <div className="p-12 sm:px-24 md:px-32 lg:px-48 xl:px-64 mt-16">
      <div className="flex justify-center mb-16">
        <div className="flex flex-col leading-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-center leading-5 sm:leading-11 md:leading-17">
            tell the dev
          </h1>
          <p className="text-normal text-base sm:text-xl md:text-2xl text-center font-normal">
            — your ideas, my code
          </p>
        </div>
      </div>

      <form
        ref={contact}
        onSubmit={sendEmail}
        className="flex flex-col gap-2 md:gap-4 justify-center"
      >
        <input
          name="name"
          required
          className="bg-panel p-2 w-full h-auto rounded text-normal text-base sm:text-xl md:text-2xl"
          type="text"
          placeholder="full name"
        />
        <input
          name="email"
          required
          className="bg-panel p-2 w-full h-auto rounded text-normal text-base sm:text-xl md:text-2xl"
          type="email"
          placeholder="email address"
        />
        <input
          name="title"
          required
          className="bg-panel p-2 w-full h-auto rounded text-normal text-base sm:text-xl md:text-2xl"
          type="text"
          placeholder="subject"
        />
        <textarea
          name="message"
          required
          className="bg-panel p-2 w-full h-[24vh] rounded text-normal text-base sm:text-xl md:text-2xl"
          type="text"
          placeholder="message"
        />
        <button
          type="submit"
          className="p-2 duration-200 cursor-pointer hover:bg-[var(--color-secondary)] bg-highlight rounded text-second  hover:text-[var(--color-highlight)] text-base sm:text-xl md:text-2xl text-center uppercase font-bold"
        >
          send email
        </button>
      </form>
    </div>
  );
}
