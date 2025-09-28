"use client"

// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { TonConnectUIProvider } from "@tonconnect/ui-react"

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`w-screen antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
          onLoad={() => {
            console.log("Telegram script loaded");
          }}
        />
        <TonConnectUIProvider manifestUrl="https://white-patient-earthworm-81.mypinata.cloud/ipfs/bafkreihuu22lfna3igtmeehlzhmnftshg4ceog5hxdux5umkmwoqv3ui54">
          {children}
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
