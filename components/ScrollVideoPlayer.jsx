"use client";

export default function ScrollVideoPlayer() {
  return (
    <>
      <img
        src="/bg.jpg"
        alt="Background"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: -1,
          backgroundColor: "#000",
          pointerEvents: "none"
        }}
      />
    </>
  );
}
