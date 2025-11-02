"use client";

import Image from "next/image";
import { LogIn } from "lucide-react";
import * as React from "react";
import Link from "next/link";
import { PiTaxi, PiHandshake, PiIdentificationCard } from "react-icons/pi";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white flex flex-col">
      {/* ================= HERO ================= */}
      <section className="relative w-full min-h-[32rem]">
        {/* Background Image */}
        <Image
          src="/assets/image3.png"
          alt="Scenic road through mountains viewed from inside a car"
          fill
          priority
          className="object-cover"
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />

        {/* NAV + HERO CONTENT */}
        <div className="relative z-10 flex flex-col h-full">
          {/* ---- NAV ---- */}
          <nav className="flex items-center justify-center px-5 py-5 sm:px-6 lg:px-12 mb-10">
            
            <Link href="/feed">
              <h1 className="font-righteous font-normal tracking-wide text-white text-xl sm:text-2xl md:text-3xl hover:text-white/90 transition-colors">
                Yideshare
              </h1>
            </Link>
          </nav>

          {/* ---- HERO CONTENT ---- */}
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 mb-8 sm:mb-10 mt-20">
            {/* Headline & Subtitle */}
            <div className="max-w-3xl mt-6 sm:mt-10 mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-righteous font-normal tracking-wide leading-tight text-white">
                Share the ride. Save the planet.
                <br />
                Split the cost.
              </h2>
            </div>
          </div>

          {/* ---- LOGIN BUTTON ---- */}
          <div className="px-4 sm:px-6 pb-12 sm:pb-16 flex justify-center">
            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                const r = params.get("redirect");
                const target = r
                  ? `/api/auth/cas-login?redirect=${encodeURIComponent(r)}`
                  : "/api/auth/cas-login";
                window.location.href = target;
              }}
              aria-label="Login"
              className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-5 py-3 text-sm sm:text-base font-semibold text-white shadow hover:bg-primary"
            >
              <LogIn size={18} className="w-5 h-5" />
              <span>Log in with CAS</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= VALUE PROP ================= */}
      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-12 sm:py-20 text-center">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-righteous font-normal text-black max-w-xl mx-auto">
          Find other Yalies to split Ubers, Lyfts, carpool with, etc.
        </h3>

        <div className="mt-10 sm:mt-16 grid gap-8 sm:gap-12 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <PiIdentificationCard size={40} className="sm:w-12 sm:h-12 text-primary" />
            <h4 className="font-lexend text-lg sm:text-xl font-normal text-primary">
              Log in with your Yale account
            </h4>
          </div>
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <PiHandshake size={40} className="sm:w-12 sm:h-12 text-primary" />
            <h4 className="font-lexend text-lg sm:text-xl font-normal text-primary">
              Find a friend with a similar journey
            </h4>
          </div>
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <PiTaxi size={40} className="sm:w-12 sm:h-12 text-primary" />
            <h4 className="font-lexend text-lg sm:text-xl font-normal text-primary">
              Coordinate and ride together!
            </h4>
          </div>
        </div>
      </section>

      {/* ================= FRIENDS PREVIEW (BOTTOM) ================= */}
      <section className="bg-[#7DA395]/60 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 text-center">
          <h3 className="font-righteous font-normal text-white text-2xl sm:text-3xl md:text-4xl tracking-wide mb-12">
            See where your friends are going
          </h3>

          <div className="mx-auto w-full max-w-5xl">
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-white/10 ring-1 ring-black/5">
              <Image
                src="/assets/feed.png"
                alt="Yideshare feed preview"
                width={1600}
                height={900}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUESTIONS + SHARE LINK ================= */}
    </main>
  );
}
