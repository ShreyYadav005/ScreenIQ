export function PixelStar({ x, y, size = 8, delay = 0, color = "#1a1a0a" }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      fontSize: size, color,
      animation: `twinkle ${1.5 + delay}s ease-in-out ${delay}s infinite`,
      pointerEvents: "none", userSelect: "none", zIndex: 0
    }}>✦</div>
  );
}

export function FloatingPixels() {
  const items = [
    { x: "5%",  y: "10%", char: "◆", color: "#4af54a", size: 12, d: 0 },
    { x: "90%", y: "8%",  char: "●", color: "#f54a9b", size: 10, d: 0.3 },
    { x: "8%",  y: "80%", char: "▲", color: "#4af5e8", size: 10, d: 0.6 },
    { x: "85%", y: "75%", char: "◆", color: "#f5a44a", size: 14, d: 0.9 },
    { x: "50%", y: "5%",  char: "★", color: "#e8e04a", size: 11, d: 1.2 },
    { x: "15%", y: "45%", char: "♦", color: "#4af54a", size: 8,  d: 0.4 },
    { x: "78%", y: "40%", char: "▪", color: "#f54a9b", size: 14, d: 0.8 },
    { x: "40%", y: "88%", char: "◉", color: "#4af5e8", size: 10, d: 1.5 },
    { x: "65%", y: "15%", char: "✦", color: "#f5a44a", size: 9,  d: 0.2 },
    { x: "25%", y: "70%", char: "■", color: "#e8e04a", size: 8,  d: 1.0 },
  ];
  return (
    <>
      {items.map((item, i) => (
        <div key={i} style={{
          position: "absolute", left: item.x, top: item.y,
          fontSize: item.size, color: item.color,
          animation: `float ${2.5 + item.d}s ease-in-out ${item.d}s infinite`,
          pointerEvents: "none", zIndex: 0, fontFamily: "monospace"
        }}>{item.char}</div>
      ))}
    </>
  );
}

export function PixelGrid() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, opacity: 0.06,
      backgroundImage: "linear-gradient(#1a1a0a 1px, transparent 1px), linear-gradient(90deg, #1a1a0a 1px, transparent 1px)",
      backgroundSize: "32px 32px",
      pointerEvents: "none"
    }} />
  );
}
