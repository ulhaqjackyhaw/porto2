import { Inter } from 'next/font/google';
import { GoogleTagManager } from '@next/third-parties/google'
import { Providers } from './providers';
import "./globals.css";
import 'lenis/dist/lenis.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['500'],
  style: ['normal'],
  display: "swap",
  preload: true
})

export const metadata = {
  title: "Portofolio Website - Dhiya Ulhaq",
  description: "Selamat datang di website saya. Ini adalah portofolio website yang dibangun dengan Framework Next.js",
  keywords: [
    "Dhiya Ulhaq",
    "Portofolio Website",
    "Fullstack Developer",
    "Next.js",
    "React",
  ],
  openGraph: {
    title: "Portofolio Website - Dhiya Ulhaq",
    description: "Selamat datang di website saya. Ini adalah portofolio website yang dibangun dengan Framework Next.js",
    url: "",
    type: "website",
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Portofolio Website - Dhiya Ulhaq",
    description: "Selamat datang di website saya. Ini adalah portofolio website yang dibangun dengan Framework Next.js",
    url: "",
    author: {
      "@type": "Person",
      name: "Dhiya Ulhaq",
    },
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className="text-zinc-50 scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-500">
      <body className={`${inter.className} antialiased dark text-foreground bg-background`} suppressHydrationWarning={true}>
        <GoogleTagManager gtmId="GTM-WRTCTKBL" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
