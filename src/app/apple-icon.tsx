import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const tileOpacity = [1, 0.7, 0.7, 0.45];

/** Home-screen icon for iPad/iPhone: the same 2×2 tile mark as icon.svg. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexWrap: "wrap",
        alignContent: "center",
        justifyContent: "center",
        gap: 12,
        padding: 40,
        background: "#1c1c1e",
      }}
    >
      {tileOpacity.map((opacity, index) => (
        <div
          key={index}
          style={{ width: 44, height: 44, borderRadius: 14, background: "#fafafa", opacity }}
        />
      ))}
    </div>,
    size,
  );
}
