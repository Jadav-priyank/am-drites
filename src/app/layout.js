import "./globals.css";

export const metadata = {
  title: "AM DRIETS | Nature's Goodness, Preserved",
  description: "Premium freeze-dried fruits and vegetable powders that preserve the natural taste, color, aroma, and nutritional value of fresh produce.",
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

import ClientToaster from '../components/ClientToaster';
import SmoothScroll from '../components/SmoothScroll';
import CustomCursor from '../components/CustomCursor';

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <CustomCursor />
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <ClientToaster richColors position="top-right" toastOptions={{ className: "font-outfit mt-14" }} />
      </body>
    </html>
  );
}
