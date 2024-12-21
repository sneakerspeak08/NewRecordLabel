import React, { useEffect, useState, useMemo } from "react";

const MatrixBackground = ({ isPlaying = false }) => {
  const [characters, setCharacters] = useState([]);
  const [colorIndex, setColorIndex] = useState(0);

  // Memoize constants to prevent recreating every render
  const katakana = useMemo(() => "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロワヲンヴヵヶ", []);
  
  const cubeColors = useMemo(() => [
    'rgb(0, 255, 0)',    // Green
    'rgb(255, 0, 0)',    // Red
    'rgb(255, 108, 0)',  // Orange
    'rgb(255, 213, 0)',  // Yellow
    'rgb(0, 69, 173)',   // Blue
    'rgb(255, 255, 255)' // White
  ], []);

  useEffect(() => {
    // Reduce number of columns for better performance
    const cols = Math.floor(window.innerWidth / 25); // Increased spacing
    const initialChars = Array(cols).fill().map(() => ({
      chars: Array(20).fill().map(() => katakana[Math.floor(Math.random() * katakana.length)]), // Reduced array size
      y: Math.random() * -1000,
      speed: 1 + Math.random() * 2,
      amplitude: Math.random() * 15
    }));
    setCharacters(initialChars);

    let colorChangeInterval;
    if (isPlaying) {
      colorChangeInterval = setInterval(() => {
        setColorIndex(prev => (prev + 1) % cubeColors.length);
      }, 500);
    }

    // Reduced update frequency
    const interval = setInterval(() => {
      setCharacters(prevChars => 
        prevChars.map((col, index) => {
          // Only calculate wave offset if playing
          const waveOffset = isPlaying 
            ? Math.sin(Date.now() * 0.001 + index * 0.2) * col.amplitude
            : 0;

          return {
            ...col,
            y: col.y > window.innerHeight ? -50 : col.y + (isPlaying ? col.speed * 1.2 : col.speed),
            x: waveOffset,
            // Reduce random character changes
            chars: col.chars.map(char => 
              Math.random() > 0.97 ? katakana[Math.floor(Math.random() * katakana.length)] : char
            )
          };
        })
      );
    }, 60); // Slightly reduced update rate

    return () => {
      clearInterval(interval);
      if (colorChangeInterval) {
        clearInterval(colorChangeInterval);
      }
    };
  }, [isPlaying, katakana, cubeColors]);

  // Memoize the current color to prevent unnecessary recalculations
  const currentColor = useMemo(() => ({
    color: isPlaying ? cubeColors[colorIndex] : '#00ff00',
    shadow: isPlaying 
      ? `0 0 12px ${cubeColors[colorIndex]}`
      : '0 0 8px rgba(32, 255, 77, 0.8)'
  }), [isPlaying, colorIndex, cubeColors]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {characters.map((col, i) => (
        <div
          key={i}
          className="absolute text-opacity-75 text-sm will-change-transform"
          style={{
            left: `${i * 25}px`,
            top: `${col.y}px`,
            transform: `scale(1, 1.2) translateX(${col.x || 0}px)`,
            color: currentColor.color,
            textShadow: currentColor.shadow
          }}
        >
          {col.chars.map((char, j) => (
            <div 
              key={j} 
              style={{ 
                opacity: (20 - j) / 20,
                transform: isPlaying 
                  ? `translateX(${Math.sin(Date.now() * 0.0005 + j * 0.1) * 2}px)` 
                  : 'none'
              }}
            >
              {char}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MatrixBackground;