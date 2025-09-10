import {
  Poppins,
  Inter,
  Rubik,
  Montserrat,
  Bebas_Neue,
} from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-alt",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-tall",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-tall-alt",
  display: "swap",
});

export const metadata = {
  title: "arqila",
  description:
    "arqila is a modernized system dedicated to car rental with driving services.",
  keywords:
    "Arqila, car rental, car hire, driving service, rent a car, local trust",
  authors: [{ name: "Joven Bataller", url: "https://wakamonoo.vercel.app" }],
  creator: "Joven Bataller",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} ${rubik.variable} ${montserrat.variable} ${bebasNeue.variable} scroll-smooth`}
    >
      <body>{children}</body>
    </html>
  );
}
