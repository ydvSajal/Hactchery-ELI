import "./globals.css";

export const metadata = {
  title: "ELRA – Entrepreneurial Leadership Readiness Assessment",
  description: "A 16-question diagnostic across the four pillars of entrepreneurial leadership.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
