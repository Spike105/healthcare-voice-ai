import type { AppProps } from 'next/app';
import { Inter, Roboto_Mono } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${inter.variable} ${robotoMono.variable} antialiased`}>
      <Component {...pageProps} />
    </main>
  );
}
