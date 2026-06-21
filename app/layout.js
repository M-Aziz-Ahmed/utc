import "./globals.css";

export const metadata = {
  title: "UTC Admin Portal",
  description: "Universal Trading Co. — Vehicle Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
