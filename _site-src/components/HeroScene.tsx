import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { Component, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type PointerPosition = { x: number; y: number };

const points = [
  new THREE.Vector3(-1.45, 1.35, 0.4),
  new THREE.Vector3(-0.85, 0.65, 0.25),
  new THREE.Vector3(0.05, 0.1, 0.12),
  new THREE.Vector3(0.75, -0.65, 0.02),
  new THREE.Vector3(1.45, -1.25, 0.25)
];

const layerData = [
  { label: "Symptom", position: [-1.4, 1.35, 0] as [number, number, number], width: 2.2 },
  { label: "Endpoint", position: [-0.75, 0.65, 0] as [number, number, number], width: 2.7 },
  { label: "Identity", position: [0, 0, 0] as [number, number, number], width: 3.1 },
  { label: "Network", position: [0.75, -0.65, 0] as [number, number, number], width: 2.7 },
  { label: "Verified", position: [1.4, -1.3, 0] as [number, number, number], width: 2.2 }
];

function Signal({ reducedMotion }: { reducedMotion: boolean }) {
  const signal = useRef<THREE.Mesh>(null);
  const startedAt = useRef<number | null>(null);
  const { invalidate } = useThree();
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), []);

  useFrame(({ clock }) => {
    if (!signal.current) return;
    if (reducedMotion) {
      signal.current.position.copy(curve.getPointAt(1));
      return;
    }

    if (startedAt.current === null) startedAt.current = clock.elapsedTime;
    const elapsed = clock.elapsedTime - startedAt.current;
    const raw = Math.min(elapsed / 2.6, 1);
    const eased = 1 - Math.pow(1 - raw, 3);
    signal.current.position.copy(curve.getPointAt(eased));
    if (raw < 1) invalidate();
  });

  return (
    <mesh ref={signal} position={points[0]}>
      <sphereGeometry args={[0.09, 20, 20]} />
      <meshBasicMaterial color="#f5f1e8" />
    </mesh>
  );
}

function DiagnosticModel({
  pointer,
  reducedMotion
}: {
  pointer: PointerPosition;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const { invalidate } = useThree();
  const pathLine = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: "#7088ff",
      transparent: true,
      opacity: 0.7
    });
    return new THREE.Line(geometry, material);
  }, []);

  useEffect(() => {
    invalidate();
  }, [pointer, invalidate]);

  useEffect(
    () => () => {
      pathLine.geometry.dispose();
      (pathLine.material as THREE.Material).dispose();
    },
    [pathLine]
  );

  useFrame(() => {
    if (!group.current || reducedMotion) return;
    const targetX = pointer.y * 0.11;
    const targetY = pointer.x * 0.14;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.1);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.1);
    const moving =
      Math.abs(group.current.rotation.x - targetX) > 0.001 ||
      Math.abs(group.current.rotation.y - targetY) > 0.001;
    if (moving) invalidate();
  });

  return (
    <group ref={group} rotation={[-0.06, -0.12, -0.08]}>
      <primitive object={pathLine} />

      {layerData.map((layer, index) => (
        <group key={layer.label} position={layer.position}>
          <mesh>
            <boxGeometry args={[layer.width, 0.38, 0.72]} />
            <meshStandardMaterial
              color={index === layerData.length - 1 ? "#3157f6" : "#222936"}
              roughness={0.7}
              metalness={0.12}
            />
          </mesh>
          {[-0.35, 0, 0.35].map((x) => (
            <mesh key={x} position={[x, 0, 0.38]}>
              <circleGeometry args={[0.035, 16]} />
              <meshBasicMaterial color={index <= 1 ? "#7088ff" : "#f5f1e8"} />
            </mesh>
          ))}
        </group>
      ))}

      <Signal reducedMotion={reducedMotion} />
    </group>
  );
}

function StaticScene() {
  return (
    <div className="scene-static" aria-hidden="true">
      {layerData.map((layer, index) => (
        <span
          key={layer.label}
          className={index === layerData.length - 1 ? "is-resolved" : ""}
          style={{ "--index": index } as React.CSSProperties}
        />
      ))}
      <i />
    </div>
  );
}

class SceneBoundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <StaticScene /> : this.props.children;
  }
}

export default function HeroScene() {
  const [pointer, setPointer] = useState<PointerPosition>({ x: 0, y: 0 });
  const [mode, setMode] = useState<"pending" | "webgl" | "static">("pending");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 640px)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;

    const supportsWebGL = () => {
      try {
        const canvas = document.createElement("canvas");
        return Boolean(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
      } catch {
        return false;
      }
    };

    const update = () => {
      setReducedMotion(motion.matches);
      setMode(
        motion.matches || narrow.matches || connection?.saveData || !supportsWebGL()
          ? "static"
          : "webgl"
      );
    };

    update();
    motion.addEventListener("change", update);
    narrow.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      narrow.removeEventListener("change", update);
    };
  }, []);

  const updatePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (mode !== "webgl") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 2
    });
  };

  return (
    <div
      className="hero-scene"
      onPointerMove={updatePointer}
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
    >
      {mode !== "webgl" ? (
        <StaticScene />
      ) : (
        <SceneBoundary>
          <Canvas
            aria-hidden="true"
            camera={{ position: [0, 0, 5.3], fov: 38 }}
            dpr={[1, 1.5]}
            frameloop="demand"
            fallback={<StaticScene />}
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener(
                "webglcontextlost",
                (event) => {
                  event.preventDefault();
                  setMode("static");
                },
                { once: true }
              );
            }}
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[3, 5, 6]} intensity={2.2} color="#f3f0e8" />
            <DiagnosticModel pointer={pointer} reducedMotion={reducedMotion} />
          </Canvas>
        </SceneBoundary>
      )}
      <div className="scene-key" aria-hidden="true">
        <span>Symptom</span>
        <span>Endpoint</span>
        <span>Identity</span>
        <span>Network</span>
        <span>Verified</span>
      </div>
    </div>
  );
}
