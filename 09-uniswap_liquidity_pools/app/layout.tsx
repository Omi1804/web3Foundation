import { Navbar } from "@/components/Navbar";
import "./globals.css";
import ProviderWrapper from "@/provider/providerWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <ProviderWrapper>
          <Navbar />
          <main className="max-h-screen overflow-y-auto bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <section>{children}</section>
          </main>
        </ProviderWrapper>
      </body>
    </html>
  );
}
