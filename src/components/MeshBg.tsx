"use client";

import { useState } from "react";

const MeshBg = ({
  colors,
  className = "",
}: {
  colors: string[];
  className?: string;
}) => {
  const [vibrant, muted, darkVibrant, darkMuted] = colors;
  const [breatheBL] = useState(50);
  const [breatheBR] = useState(50);
  const [breatheTR] = useState(50);
  const [positions] = useState({
    topLeft: { x: 25, y: 25 },
    topRight: { x: 85, y: 15 },
    bottomLeft: { x: 45, y: 95 },
    bottomRight: { x: 80, y: 80 },
    center: { x: 50, y: 50 },
  });

  // useEffect(() => {
  //   const animateBreathe = () => {
  //     const time = Date.now() / 1000;
  //     setBreatheBL(50 + Math.sin(time) * 25);
  //     setBreatheBR(50 + Math.cos(time) * 25);
  //     setBreatheTR(50 + Math.sin(time / 1.2) * 25);
  //   };

  //   // const moveSpots = () => {
  //   //   setPositions({
  //   //     topLeft: { x: 20 + Math.random() * 10, y: 20 + Math.random() * 10 },
  //   //     topRight: { x: 80 + Math.random() * 10, y: 10 + Math.random() * 10 },
  //   //     bottomLeft: { x: 10 + Math.random() * 10, y: 80 + Math.random() * 10 },
  //   //     bottomRight: { x: 75 + Math.random() * 10, y: 75 + Math.random() * 10 },
  //   //     center: { x: 45 + Math.random() * 10, y: 45 + Math.random() * 10 },
  //   //   })
  //   // }

  //   const breatheIntervalId = setInterval(animateBreathe, 50); // Update every 50ms for smooth animation
  //   //const moveIntervalId = setInterval(moveSpots, 5000) // Move spots every 5 seconds

  //   return () => {
  //     clearInterval(breatheIntervalId);
  //     //clearInterval(moveIntervalId)
  //   }; // Cleanup on unmount
  // }, []);

  return (
    <div
      className={`fixed inset-[-3%] transition-all duration-5000 ease-in-out pointer-events-none ${className} overflow-hidden blur-2xl`}
      style={{ backgroundColor: darkVibrant }}
    >
      <div
        className={`absolute inset-[-30%] aspect-square transition-all duration-5000 ease-in-out pointer-events-none ${className} overflow-clip`}
        style={{
          backgroundColor: "#0000",
          backgroundImage: `
          radial-gradient(circle at ${positions.topLeft.x}% ${positions.topLeft.y}%, ${vibrant} 0px, transparent 50%),
          radial-gradient(
            circle at ${positions.topRight.x}% ${positions.topRight.y}%,
            color-mix(in srgb, ${muted} ${breatheTR}%, ${vibrant}) 0px,
            transparent 45%
          ),
          radial-gradient(
            ellipse at 0% ${breatheBL / 10 + 50}%,
            ${darkVibrant}cc 0px,
            transparent 20%
          ),
          radial-gradient(
            circle at ${positions.center.x}% ${positions.center.y}%,
            color-mix(in srgb, ${darkVibrant} 30%, ${vibrant}) 0px,
            transparent 55%
          ),
          radial-gradient(
            ellipse at ${positions.bottomLeft.x}% ${positions.bottomLeft.y}%,
            color-mix(in srgb, ${darkMuted} ${breatheBL}%, ${darkVibrant}) 10px,
            transparent 70%
          ),
          radial-gradient(
            circle at ${positions.bottomRight.x}% ${positions.bottomRight.y}%,
            color-mix(in srgb, ${darkVibrant} ${breatheBR}%, ${vibrant}) 0px,
            transparent 65%
          ),
          radial-gradient(
            circle at 30% 60%,
            color-mix(in srgb, ${darkVibrant} ${breatheBR}%, ${muted}) 0px,
            transparent 65%
          ),
          radial-gradient(
            ellipse at 50% 0%,
            color-mix(in srgb, ${muted} 20%, ${vibrant}) 0px,
            transparent 40%
          ),
          radial-gradient(
            ellipse at 0% 50%,
            color-mix(in srgb, ${darkVibrant} 40%, ${vibrant}) 0px,
            transparent 45%
          ),
          radial-gradient(
            ellipse at 50% 100%,
            color-mix(in srgb, ${darkMuted} 30%, ${vibrant}) 0px,
            transparent 50%
          )
        `,
          animation: "spin 125s linear infinite",
        }}
      />

      <div
        className="absolute inset-[20%] animate-spin aspect-square" // Make this one smaller than the outer
        style={{
          backgroundImage: `
                radial-gradient(circle at 30% 30%, ${darkVibrant}99 0px, transparent 40%),
                radial-gradient(circle at 70% 70%, ${muted}99 0px, transparent 40%),
                radial-gradient(circle at 30% 70%, ${darkMuted}99 0px, transparent 40%),
                radial-gradient(circle at 70% 30%, ${darkMuted}99 0px, transparent 40%)
              `,
          animation: "spin 85s linear infinite reverse", // Spin in opposite direction
        }}
      />
    </div>
  );
};

export default MeshBg;
