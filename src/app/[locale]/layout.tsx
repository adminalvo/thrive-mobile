import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "@/components/ThemeProvider";
import AiChatbot from "@/components/AiChatbot";

const nunito = Nunito({
  subsets: ["latin", "cyrillic"], // Add cyrillic for Russian support
  variable: "--font-inter", // Keep variable name same so global.css works without changes
});

export const metadata: Metadata = {
  title: "Thrive CRM - Future of Education",
  description: "Premium CRM for Thrive Education Center.",
};

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <div className={nunito.variable} style={{ minHeight: "100vh" }}>
      <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="top-right" />
          <AiChatbot />
        </NextIntlClientProvider>
      </ThemeProvider>
    </div>
  );
}
