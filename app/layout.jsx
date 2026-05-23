import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "../lib/auth";
import "../styles.css";

export const metadata = {
  title: "OMS Inventory Console",
  description: "Warehouse-style lookup app for Advaning OMS inventory data.",
};

export default function RootLayout({ children }) {
  const content = isClerkConfigured() ? <ClerkProvider>{children}</ClerkProvider> : children;

  return (
    <html lang="en">
      <body>{content}</body>
    </html>
  );
}
