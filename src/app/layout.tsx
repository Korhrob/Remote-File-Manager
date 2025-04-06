// layout.tsx

'use client'; // Add this to mark the layout as a client-side component

import React, { useState, useRef } from "react";
import { SessionProvider } from "next-auth/react";
import { MessageProvider } from "../context/MessageContext"; // Import the MessageProvider
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "notice" | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [visible, setVisible] = useState(false);

  const showMessage = (msg: string, type: "success" | "error" | "notice") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    setMessage(msg);
    setMessageType(type);

    setTimeout(() => {
      setVisible(true);
    }, 10);

    timeoutRef.current = setTimeout(() => {
      setVisible(false); // Start fade-out
      hideTimeoutRef.current = setTimeout(() => {
        setMessage(null); // Remove after animation
        setMessageType(null);
      }, 400); // Match transition duration
    }, 3600); // Hide after 4 seconds
  };

  return (
    <SessionProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Wrap children with MessageProvider and pass showMessage */}
          <MessageProvider value={{ showMessage }}>
            {children}
            {/* Message Display UI */}
            {message && (
              <div className="status-container">
                <div
                  className={`status-message ${visible ? "show" : ""} ${
                    messageType === "success"
                      ? "status-success"
                      : messageType === "error"
                      ? "status-error"
                      : "status-notice"
                  }`}
                >
                  {message}
                </div>
              </div>
            )}
          </MessageProvider>
        </body>
      </html>
    </SessionProvider>
  );
};

export default RootLayout;
