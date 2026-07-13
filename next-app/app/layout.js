import "@fontsource/fredoka";
import "@fontsource/nunito";
import "./css/reset.css";
import "./css/styles.css";
import "./css/divStyles.css";

export const metadata = {
  title: "Worksheet generator - Math Test",
  description:
    "Split an uploaded image into a scrambled grid puzzle and generate a printable math worksheet PDF.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
