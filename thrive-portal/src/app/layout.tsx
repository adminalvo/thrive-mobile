'use client';

import './globals.css';
import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Preloader } from '@/components/ui/Preloader';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>Thrive Portal — Desktop Academic Environment</title>
        <meta name="description" content="Thrive Education Center Academic Management Portal" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="bg-[#070F1E] text-slate-100 min-h-screen antialiased selection:bg-[#4CA2B5]/30 selection:text-[#5ce1e6]">
        <Preloader />
        <LanguageProvider>
          <AuthProvider>
            <Toaster position="top-right" toastOptions={{
              style: {
                background: '#0D1E36',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }} />
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
