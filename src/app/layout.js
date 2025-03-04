import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomerServiceButton from "@/components/CustomerServiceButton";
import { TeamProvider } from "@/context/TeamContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Turnamen Gaming USM",
  description: "Ikuti turnamen gaming terbesar di USM dan tunjukkan kemampuanmu!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}>
        <TeamProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <CustomerServiceButton />
          <Footer />
        </TeamProvider>
      </body>
    </html>
  );
}
