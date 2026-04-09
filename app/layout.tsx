import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Auto Garage - Betrouwbare Service voor Jouw Auto",
  description: "Welkom bij Auto Garage, jouw vertrouwde partner voor hoogwaardige autoreparaties en onderhoud. Ons ervaren team van gecertificeerde monteurs staat klaar om jouw auto weer in topconditie te brengen. Of het nu gaat om een kleine reparatie of een uitgebreide servicebeurt, wij bieden snelle, betrouwbare en betaalbare oplossingen. Kies voor Auto Garage en ervaar de perfecte combinatie van technische expertise en persoonlijke service.",
   openGraph: {
    title: "Auto Garage - Betrouwbare Service voor Jouw Auto",
    description:
      "Welkom bij Auto Garage, jouw vertrouwde partner voor hoogwaardige autoreparaties en onderhoud. Ons ervaren team van gecertificeerde monteurs staat klaar om jouw auto weer in topconditie te brengen. Of het nu gaat om een kleine reparatie of een uitgebreide servicebeurt, wij bieden snelle, betrouwbare en betaalbare oplossingen. Kies voor Auto Garage en ervaar de perfecte combinatie van technische expertise en persoonlijke service.",
    url: "/",
    siteName: "Auto Garage",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}