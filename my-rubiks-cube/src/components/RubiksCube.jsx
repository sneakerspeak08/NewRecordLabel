import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useNavigate } from 'react-router-dom';
import MatrixBackground from "./MatrixBackground";

const createTextTexture = (text, width = 512, height = 512) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.fillStyle = 'black'; // Background color
  context.fillRect(0, 0, width, height);

  context.fillStyle = '#00ff00'; // Neon green text color
  context.font = 'Bold 40px Arial'; // Font style
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Write text
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    context.fillText(line, width / 2, height / 2 + index * 50);
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};


const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    if (!inThrottle) {
      func.apply(this, arguments);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};


class Cube {
  constructor(scene, camera) {
    this.group = new THREE.Group();
    this.cubelets = [];
    this.isRotating = false;
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.dragStart = new THREE.Vector2();
    this.dragEnd = new THREE.Vector2();
    this.selectedFace = null;
    this.isDragging = false;
    this.rotationInProgress = false;
    this.createCube();
  }

  createCube() {
    const geometry = new THREE.BoxGeometry(0.97, 0.97, 0.97);
    const gap = 1.01;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
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
// Add text only to the center green cube (inside)
// Add text only to the center cube and make it visible through the green face (z === 1)
if (x === 0 && y === 0 && z === 0) { // Ensure this is the center cube
  const secretText = "RR,RR\nRU,RL,RD"; // Secret sequence
  const textTexture = createTextTexture(secretText);

  const textGeometry = new THREE.PlaneGeometry(0.8, 0.8);
  const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
  const textPlane = new THREE.Mesh(textGeometry, textMaterial);

  // Position the text slightly behind the green face (z === 1)
  textPlane.position.set(0, 0, 0.48); // Adjust to align with the green face
  textPlane.rotation.y = 0; // Ensure proper orientation for the green face

  cubelet.add(textPlane); // Attach text to the center cube
}


          
          const edgesGeometry = new THREE.EdgesGeometry(geometry);
          const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
          const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
          cubelet.add(edges);

          cubelet.userData.originalPosition = new THREE.Vector3(x, y, z);
          
          this.cubelets.push(cubelet);
          this.group.add(cubelet);
        }
      }
    }
    // Create a texture with the secret sequence
const textTexture = createTextTexture(
  'RR,RR\nRU,RL,RD'
);

// Create a plane geometry for the back wall
const planeGeometry = new THREE.PlaneGeometry(1.5, 1.5); // Adjust size to fit back wall
const planeMaterial = new THREE.MeshBasicMaterial({
  map: textTexture,
  transparent: true,
});

// Create the plane and position it
const textPlane = new THREE.Mesh(planeGeometry, planeMaterial);
textPlane.position.set(0, 0, -1.02); // Slightly in front of the back wall
textPlane.rotation.y = Math.PI; // Face it towards the camera
this.group.add(textPlane);

    this.scene.add(this.group);
  }

  handleMouseDown(event, domElement) {
    if (this.isRotating) return;
  
    const rect = domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
    this.dragStart.set(event.clientX, event.clientY);
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
  
    const intersects = this.raycaster.intersectObjects(this.cubelets);
    if (intersects.length > 0) {
      const face = intersects[0].face;
      this.isDragging = true;
      this.selectedFace = {
        cubelet: intersects[0].object,
        normal: face?.normal?.clone() || new THREE.Vector3(),
        point: intersects[0].point.clone(),
      };
    } else {
      this.isDragging = false;
      this.selectedFace = null;
    }
  }

  handleMouseMove(event) {
    if (!this.isDragging || !this.selectedFace || this.rotationInProgress) return;
  
    this.dragEnd.set(event.clientX, event.clientY);
    const deltaMove = {
      x: this.dragEnd.x - this.dragStart.x,
      y: this.dragEnd.y - this.dragStart.y
    };
  
    if (Math.abs(deltaMove.x) > 20 || Math.abs(deltaMove.y) > 20) {
      this.determineFaceRotation(deltaMove);
      this.isDragging = false;
      this.selectedFace = null;
    }
  }
  
  determineFaceRotation(deltaMove) {
    if (!this.selectedFace) {
      console.error("No face selected for rotation. Aborting.");
      return;
    }
  
    const { normal, cubelet } = this.selectedFace;
    const worldNormal = normal.clone().applyQuaternion(cubelet.quaternion);
  
    const absX = Math.abs(worldNormal.x);
    const absY = Math.abs(worldNormal.y);
    const absZ = Math.abs(worldNormal.z);
  
    // Check if the selected face is a corner
    if (absX > 0.5 && absY > 0.5 && absZ > 0.5) {
      return; // Do not rotate if the selected face is a corner
    }
  
    let axis, layer;
    if (absX > absY && absX > absZ) {
      axis = new THREE.Vector3(1, 0, 0);
      layer = Math.round(cubelet.position.x);
    } else if (absY > absX && absY > absZ) {
      axis = new THREE.Vector3(0, 1, 0);
      layer = Math.round(cubelet.position.y);
    } else {
      axis = new THREE.Vector3(0, 0, 1);
      layer = Math.round(cubelet.position.z);
    }
  
    const direction = deltaMove.x > 0 || deltaMove.y < 0 ? 1 : -1;
    const angle = Math.PI / 2 * direction;
  
    // Check if the selected cubelet is not the center piece
    if (Math.abs(layer) > 0.1) {
      this.rotateFace(axis, layer, angle);
    }
  }
  rotateFace(axis, layer, angle) {
    if (this.rotationInProgress) return;
    this.rotationInProgress = true;
  
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationAxis(axis, angle);
  
    const affectedCubelets = this.cubelets.filter((cubelet) => {
      const position = cubelet.userData.originalPosition;
      const relevantCoord = axis.x ? "x" : axis.y ? "y" : "z";
      return Math.abs(position[relevantCoord] - layer) < 0.1;
    });
  
    let progress = 0;
    const animate = () => {
      progress += 0.1;
      if (progress >= 1) {
        this.rotationInProgress = false;
        affectedCubelets.forEach((cubelet) => {
          cubelet.userData.originalPosition.copy(cubelet.position);
        });
        return;
      }
  
      const stepMatrix = new THREE.Matrix4().makeRotationAxis(axis, angle * 0.1);
      affectedCubelets.forEach((cubelet) => {
        cubelet.position.applyMatrix4(stepMatrix);
        cubelet.rotateOnWorldAxis(axis, angle * 0.1);
      });
  
      requestAnimationFrame(animate);
    };
    animate();
  }

  handleMouseUp() {
    this.isDragging = false;
    this.selectedFace = null;
  }
}

const RubiksCube = () => {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const cubeRef = useRef(null);
  const controlsRef = useRef(null);

  // Define the special sequence and user actions tracker
  const secretSequence = ["Rotate Right", "Rotate Right", "Rotate Up", "Rotate Left", "Rotate Down"];
  const [userSequence, setUserSequence] = useState([]);

  const handleMove = (move) => {
    setUserSequence((prev) => {
      const updatedSequence = [...prev, move];

      // Check if the sequence matches
      if (
        updatedSequence.length === secretSequence.length &&
        updatedSequence.every((val, index) => val === secretSequence[index])
      ) {
        navigate("/preview"); // Navigate to the preview page
      }

      // Keep only the last N moves (where N = secretSequence.length)
      return updatedSequence.slice(-secretSequence.length);
    });
  };

  const rotateCube = (axis, layer, angle, moveName) => {
    if (cubeRef.current && !cubeRef.current.rotationInProgress) {
      cubeRef.current.rotateFace(axis, layer, angle);
      handleMove(moveName); // Track the move
    }
  };

  useEffect(() => {
    const mount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Create cube
    const cube = new Cube(scene, camera);
    
    cubeRef.current = cube;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add mouse/touch event handlers
    const onMouseDown = (event) => {
      cube.handleMouseDown(event, renderer.domElement);
    };

    const onMouseMove = (event) => {
      cube.handleMouseMove(event);
    };

    const onMouseUp = () => {
      cube.handleMouseUp();
    };

    mount.addEventListener("mousedown", onMouseDown);
    mount.addEventListener("mousemove", onMouseMove);
    mount.addEventListener("mouseup", onMouseUp);
    mount.addEventListener("mouseleave", onMouseUp);

    // Add keyboard controls
    const handleKeyPress = (event) => {
      if (cube.isRotating) return;

      const PI_2 = Math.PI / 2;
      switch (event.key.toLowerCase()) {
        case "r":
          cube.rotateFace(new THREE.Vector3(1, 0, 0), 1, PI_2);
          handleMove("Rotate Right");
          break;
        case "l":
          cube.rotateFace(new THREE.Vector3(1, 0, 0), -1, -PI_2);
          handleMove("Rotate Left");
          break;
        case "u":
          cube.rotateFace(new THREE.Vector3(0, 1, 0), 1, PI_2);
          handleMove("Rotate Up");
          break;
        case "d":
          cube.rotateFace(new THREE.Vector3(0, 1, 0), -1, -PI_2);
          handleMove("Rotate Down");
          break;
        case "f":
          cube.rotateFace(new THREE.Vector3(0, 0, 1), 1, PI_2);
          handleMove("Rotate Front");
          break;
        case "b":
          cube.rotateFace(new THREE.Vector3(0, 0, 1), -1, -PI_2);
          handleMove("Rotate Back");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("resize", handleResize);
      mount.removeEventListener("mousedown", onMouseDown);
      mount.removeEventListener("mousemove", onMouseMove);
      mount.removeEventListener("mouseup", onMouseUp);
      mount.removeEventListener("mouseleave", onMouseUp);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Matrix Background */}
      <MatrixBackground />

      {/* Neon Header */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-50 text-center">
        <h1 className="font-mono text-5xl neon-text">Sutakku Records</h1>
      </div>

      {/* Three.js Mount Area */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-10"
        style={{ pointerEvents: "auto" }}
      />

{/* Buttons */}
<div
  className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 bg-black bg-opacity-80 p-4 rounded-lg shadow-lg w-full sm:w-auto"
  style={{
    pointerEvents: "auto",
    zIndex: 1000,
  }}
>
  <button
    className="px-6 py-3 font-mono text-green-400 border border-green-400 rounded-lg hover:bg-green-800 hover:text-white transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
    onClick={() => rotateCube(new THREE.Vector3(1, 0, 0), 1, Math.PI / 2, "Rotate Right")}
  >
    Rotate Right
  </button>
  <button
    className="px-6 py-3 font-mono text-green-400 border border-green-400 rounded-lg hover:bg-green-800 hover:text-white transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
    onClick={() => rotateCube(new THREE.Vector3(1, 0, 0), -1, -Math.PI / 2, "Rotate Left")}
  >
    Rotate Left
  </button>
  <button
    className="px-6 py-3 font-mono text-green-400 border border-green-400 rounded-lg hover:bg-green-800 hover:text-white transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
    onClick={() => rotateCube(new THREE.Vector3(0, 1, 0), 1, Math.PI / 2, "Rotate Up")}
  >
    Rotate Up
  </button>
  <button
    className="px-6 py-3 font-mono text-green-400 border border-green-400 rounded-lg hover:bg-green-800 hover:text-white transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
    onClick={() => rotateCube(new THREE.Vector3(0, 1, 0), -1, -Math.PI / 2, "Rotate Down")}
  >
    Rotate Down
  </button>
</div>

    </div>
  );
};

export default RubiksCube;