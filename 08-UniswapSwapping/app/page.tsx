"use client";

import { Navbar } from "@/components/Navbar";
import SwapInterface from "@/components/SwapInterface";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center">
          <SwapInterface />
        </div>
      </main>
    </div>
  );
}
