import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
      setCharacters(prevChars => 
        prevChars.map(col => ({
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
            left: `${(i * 20)}px`,
            top: `${col.y}px`,
            transform: 'scale(1, 1.2)',
            textShadow: '0 0 8px rgba(32, 255, 77, 0.8)'
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

class Cube {
  constructor(scene) {
    this.group = new THREE.Group();
    this.cubelets = [];
    this.isRotating = false;
    this.scene = scene;
    this.createCube();
  }

  createCube() {
    const geometry = new THREE.BoxGeometry(0.97, 0.97, 0.97);
    const gap = 1.01;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Create materials for each face
          const materials = [
            new THREE.MeshPhongMaterial({ color: x === 1 ? 0xB90000 : 0x282828 }), // Right - Red
            new THREE.MeshPhongMaterial({ color: x === -1 ? 0xFF6C00 : 0x282828 }), // Left - Orange
            new THREE.MeshPhongMaterial({ color: y === 1 ? 0xFFFFFF : 0x282828 }), // Top - White
            new THREE.MeshPhongMaterial({ color: y === -1 ? 0xFFD500 : 0x282828 }), // Bottom - Yellow
            new THREE.MeshPhongMaterial({ color: z === 1 ? 0x009B48 : 0x282828 }), // Front - Green
            new THREE.MeshPhongMaterial({ color: z === -1 ? 0x0045AD : 0x282828 })  // Back - Blue
          ];

          const cubelet = new THREE.Mesh(geometry, materials);
          cubelet.position.set(x * gap, y * gap, z * gap);
          
          // Add black edges
          const edgesGeometry = new THREE.EdgesGeometry(geometry);
          const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
          const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
          cubelet.add(edges);

          // Store position for rotation calculations
          cubelet.userData.originalPosition = new THREE.Vector3(x, y, z);
          
          this.cubelets.push(cubelet);
          this.group.add(cubelet);
        }
      }
    }
    this.scene.add(this.group);
  }

  rotateFace(axis, layer, angle) {
    if (this.isRotating) return;
    this.isRotating = true;

    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationAxis(axis, angle);

    const affectedCubelets = this.cubelets.filter(cubelet => {
      const position = cubelet.userData.originalPosition;
      switch (axis.xyz) {
        case 'x': return Math.abs(position.x - layer) < 0.1;
        case 'y': return Math.abs(position.y - layer) < 0.1;
        case 'z': return Math.abs(position.z - layer) < 0.1;
        default: return false;
      }
    });

    let progress = 0;
    const animate = () => {
      progress += 0.1;
      if (progress >= 1) {
        this.isRotating = false;
        return;
      }

      affectedCubelets.forEach(cubelet => {
        cubelet.position.applyMatrix4(rotationMatrix);
        cubelet.rotateOnWorldAxis(axis, angle);
      });

      requestAnimationFrame(animate);
    };
    animate();
  }
}

const RubiksCube = () => {
  const mountRef = useRef(null);
  const cubeRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Create cube
    const cube = new Cube(scene);
    cubeRef.current = cube;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add keyboard controls
    const handleKeyPress = (event) => {
      if (cube.isRotating) return;
      
      const PI_2 = Math.PI / 2;
      switch(event.key.toLowerCase()) {
        case 'r': cube.rotateFace(new THREE.Vector3(1, 0, 0), 1, PI_2); break;
        case 'l': cube.rotateFace(new THREE.Vector3(1, 0, 0), -1, -PI_2); break;
        case 'u': cube.rotateFace(new THREE.Vector3(0, 1, 0), 1, PI_2); break;
        case 'd': cube.rotateFace(new THREE.Vector3(0, 1, 0), -1, -PI_2); break;
        case 'f': cube.rotateFace(new THREE.Vector3(0, 0, 1), 1, PI_2); break;
        case 'b': cube.rotateFace(new THREE.Vector3(0, 0, 1), -1, -PI_2); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <MatrixBackground />
      <div 
        ref={mountRef} 
        className="absolute inset-0 z-10"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default RubiksCube;