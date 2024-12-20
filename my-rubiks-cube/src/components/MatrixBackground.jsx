// src/components/MatrixBackground.jsx
import React, { useEffect, useState } from "react";

const MatrixBackground = () => {
  const [characters, setCharacters] = useState([]);
  const katakana = "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロワヲンヴヵヶ";

  useEffect(() => {
    const cols = Math.floor(window.innerWidth / 20);
    const initialChars = Array(cols).fill().map(() => ({
      chars: Array(30).fill().map(() => katakana[Math.floor(Math.random() * katakana.length)]),
      y: Math.random() * -1000,
      speed: 1 + Math.random() * 3
    }));
    setCharacters(initialChars);

    const interval = setInterval(() => {
      setCharacters((prevChars) =>
        prevChars.map((col) => ({
          ...col,
          y: col.y > 800 ? -100 : col.y + col.speed,
          chars: col.chars.map(() =>
            Math.random() > 0.98 ? katakana[Math.floor(Math.random() * katakana.length)] : col.chars[0]
          )
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {characters.map((col, i) => (
        <div
          key={i}
          className="absolute text-green-400 text-opacity-75 text-sm"
          style={{
            left: `${i * 20}px`,
            top: `${col.y}px`,
            transform: "scale(1, 1.2)",
            textShadow: "0 0 8px rgba(32, 255, 77, 0.8)"
          }}
        >
          {col.chars.map((char, j) => (
            <div key={j} style={{ opacity: (30 - j) / 30 }}>{char}</div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MatrixBackground;
