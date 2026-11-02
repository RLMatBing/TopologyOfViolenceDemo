"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Player, TowerStyle } from "../../lib/game/types";

type Skin = { accent: string; windows: string; sign: string; body: string };

const SKINS: Record<TowerStyle, Skin> = {
  standard: { accent: "#d9e7ed", windows: "#d7f6ff", sign: "FOUNDATION", body: "#17242f" },
  rapid: { accent: "#ff7655", windows: "#ffd7bd", sign: "SURGE", body: "#291a20" },
  efficient: { accent: "#79e7a8", windows: "#d6ffe4", sign: "VERDE", body: "#152a25" },
  collective: { accent: "#c8a3ff", windows: "#eee0ff", sign: "COMMON", body: "#241c32" },
};

function WindowGrid({ floors, skin }: { floors: number; skin: Skin }) {
  const visibleFloors = Math.min(floors, 12);
  return (
    <group>
      {Array.from({ length: visibleFloors }, (_, floor) => {
        const y = 0.35 + floor * 0.52;
        return (
          <group key={floor}>
            {[-0.3, 0, 0.3].map((x) => (
              <mesh key={`front-${x}`} position={[x, y, 0.605]}>
                <boxGeometry args={[0.2, 0.22, 0.025]} />
                <meshBasicMaterial color={skin.windows} transparent opacity={0.76} />
              </mesh>
            ))}
            {[-0.3, 0, 0.3].map((z) => (
              <mesh key={`side-${z}`} position={[0.605, y, z]}>
                <boxGeometry args={[0.025, 0.22, 0.2]} />
                <meshBasicMaterial color={skin.windows} transparent opacity={0.52} />
              </mesh>
            ))}
            <mesh position={[0, y - 0.15, 0.622]}>
              <boxGeometry args={[1.18, 0.035, 0.035]} />
              <meshBasicMaterial color={skin.accent} transparent opacity={0.72} />
            </mesh>
            <mesh position={[0.622, y - 0.15, 0]}>
              <boxGeometry args={[0.035, 0.035, 1.18]} />
              <meshBasicMaterial color={skin.accent} transparent opacity={0.56} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function RooftopSign({ skin, height }: { skin: Skin; height: number }) {
  return (
    <group position={[0, height + 0.24, 0]}>
      <mesh position={[0, 0.22, 0.52]}>
        <boxGeometry args={[1.15, 0.45, 0.08]} />
        <meshStandardMaterial color="#eff3f2" emissive={skin.accent} emissiveIntensity={0.2} roughness={0.4} />
      </mesh>
      <Text position={[0, 0.22, 0.57]} fontSize={0.14} color={skin.accent} anchorX="center" anchorY="middle">
        {skin.sign}
      </Text>
      <mesh position={[-0.44, 0.47, 0]}>
        <boxGeometry args={[0.04, 0.55, 0.04]} />
        <meshStandardMaterial color="#78818a" metalness={0.8} roughness={0.26} />
      </mesh>
      <mesh position={[0.44, 0.47, 0]}>
        <boxGeometry args={[0.04, 0.55, 0.04]} />
        <meshStandardMaterial color="#78818a" metalness={0.8} roughness={0.26} />
      </mesh>
    </group>
  );
}

function TowerSkin({ style, height, skin }: { style: TowerStyle; height: number; skin: Skin }) {
  if (style === "rapid") {
    return (
      <group>
        {[height * 0.3, height * 0.62, height * 0.92].map((y) => (
          <mesh key={y} position={[0, Math.max(0.35, y), 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.82, 0.045, 6, 20]} />
            <meshBasicMaterial color={skin.accent} />
          </mesh>
        ))}
        <mesh position={[0, height + 0.62, 0]}>
          <coneGeometry args={[0.32, 1.25, 6]} />
          <meshStandardMaterial color="#3c2020" emissive={skin.accent} emissiveIntensity={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[0, height + 1.3, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={skin.windows} />
        </mesh>
        <RooftopSign skin={skin} height={height} />
      </group>
    );
  }

  if (style === "efficient") {
    return (
      <group>
        {[height * 0.36, height * 0.7].map((y) => (
          <mesh key={y} position={[0, Math.max(0.32, y), 0]}>
            <boxGeometry args={[1.55, 0.1, 1.55]} />
            <meshStandardMaterial color="#29453a" emissive={skin.accent} emissiveIntensity={0.14} roughness={0.4} />
          </mesh>
        ))}
        {[-0.48, 0.48].map((x) => (
          <mesh key={x} position={[x, height / 2, -0.59]}>
            <boxGeometry args={[0.08, height, 0.06]} />
            <meshBasicMaterial color={skin.accent} />
          </mesh>
        ))}
        {[-0.3, 0.3].map((x) => (
          <mesh key={x} position={[x, height + 0.12, 0.1]} rotation={[-0.22, 0, 0]}>
            <boxGeometry args={[0.43, 0.04, 0.32]} />
            <meshStandardMaterial color="#142e37" emissive={skin.accent} emissiveIntensity={0.2} metalness={0.65} />
          </mesh>
        ))}
        <RooftopSign skin={skin} height={height} />
      </group>
    );
  }

  if (style === "collective") {
    return (
      <group>
        {[height * 0.38, height * 0.72].map((y) => (
          <group key={y} position={[0, Math.max(0.35, y), 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.92, 0.05, 4, 16]} />
              <meshBasicMaterial color={skin.accent} />
            </mesh>
            {[-0.76, 0.76].map((x) => (
              <mesh key={x} position={[x, 0, 0]}>
                <boxGeometry args={[0.06, 0.06, 1.55]} />
                <meshBasicMaterial color={skin.accent} />
              </mesh>
            ))}
          </group>
        ))}
        {[0, 2.1, 4.2].map((angle) => (
          <mesh key={angle} position={[Math.cos(angle) * 0.72, height + 0.3, Math.sin(angle) * 0.72]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshBasicMaterial color={skin.windows} />
          </mesh>
        ))}
        <RooftopSign skin={skin} height={height} />
      </group>
    );
  }

  return (
    <group>
      {[-0.54, 0.54].flatMap((x) =>
        [-0.54, 0.54].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, height / 2, z]}>
            <boxGeometry args={[0.07, height, 0.07]} />
            <meshStandardMaterial color="#a6bac5" metalness={0.78} roughness={0.25} />
          </mesh>
        )),
      )}
      <mesh position={[0, height + 0.08, 0]}>
        <boxGeometry args={[0.92, 0.1, 0.92]} />
        <meshStandardMaterial color="#344955" metalness={0.5} roughness={0.36} />
      </mesh>
      <mesh position={[0, height + 0.2, 0.08]}>
        <boxGeometry args={[0.36, 0.13, 0.36]} />
        <meshStandardMaterial color="#0e151d" metalness={0.75} roughness={0.22} />
      </mesh>
      <RooftopSign skin={skin} height={height} />
    </group>
  );
}

function FloorStack({ player, selected, onSelect }: { player: Player; selected: boolean; onSelect: (id: string) => void }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const previous = useRef(player.floors);
  const birth = useRef(0);
  const skin = SKINS[player.styleChosen ? player.towerStyle : "standard"];

  useEffect(() => {
    if (player.floors > previous.current) birth.current = performance.now();
    previous.current = player.floors;
  }, [player.floors]);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const object = new THREE.Object3D();
    const appeared = Math.min(1, (performance.now() - birth.current) / 360);
    for (let i = 0; i < player.floors; i += 1) {
      const newest = i === player.floors - 1 && birth.current > 0;
      const scale = newest ? 0.82 + appeared * 0.18 : 1;
      object.position.set(0, 0.34 + i * 0.52, 0);
      object.scale.set(1, scale, 1);
      object.updateMatrix();
      mesh.setMatrixAt(i, object.matrix);
    }
    mesh.count = player.floors;
    mesh.instanceMatrix.needsUpdate = true;
  });

  const frozen = player.status === "frozen";
  const exhausted = player.status === "exhausted";
  const shielded = player.shieldActive;
  const overdrive = player.overdriveUntil > Date.now();
  const height = Math.max(1.2, player.floors * 0.52);
  const style = player.styleChosen ? player.towerStyle : "standard";

  return (
    <group onClick={(event) => { event.stopPropagation(); onSelect(player.id); }}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.05, 1.17, 0.12, 6]} />
        <meshStandardMaterial color={selected ? "#f5a524" : "#202831"} emissive={selected ? "#563708" : "#000000"} emissiveIntensity={selected ? 0.7 : 0} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.45, 0.12, 1.45]} />
        <meshStandardMaterial color="#111a23" metalness={0.6} roughness={0.33} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, 90]}>
        {style === "rapid" ? <cylinderGeometry args={[0.64, 0.75, 0.46, 6]} /> : style === "collective" ? <octahedronGeometry args={[0.8, 0]} /> : <boxGeometry args={[1.18, 0.46, 1.18]} />}
        <meshStandardMaterial color={skin.body} flatShading roughness={0.47} metalness={0.38} />
      </instancedMesh>
      <WindowGrid floors={player.floors} skin={skin} />
      {player.floors > 0 && <TowerSkin style={style} height={height} skin={skin} />}
      {frozen && <mesh position={[0, Math.max(1, player.floors * 0.26), 0]}><cylinderGeometry args={[1.33, 1.33, Math.max(1.2, player.floors * 0.54), 6, 1, true]} /><meshBasicMaterial color="#85d3ff" transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>}
      {shielded && <mesh position={[0, Math.max(1.1, player.floors * 0.28), 0]}><torusGeometry args={[1.4, 0.04, 6, 24]} /><meshBasicMaterial color="#9bf1c4" /></mesh>}
      {overdrive && <pointLight color="#ff9d42" intensity={3} distance={4} />}
      <Text position={[0, Math.max(1.25, player.floors * 0.52 + 1.82), 0]} fontSize={0.26} color="#f7f7f3" anchorX="center" outlineWidth={0.016} outlineColor="#090d12">{player.name}</Text>
      <Text position={[0, Math.max(0.94, player.floors * 0.52 + 1.5), 0]} fontSize={0.18} color={exhausted ? "#fa8a82" : frozen ? "#85d3ff" : overdrive ? "#ffad55" : "#b9c7d2"} anchorX="center">{player.floors} FLOORS{overdrive ? " · OD" : ""}</Text>
      {player.styleChosen && <Text position={[0, Math.max(0.7, player.floors * 0.52 + 1.22), 0]} fontSize={0.115} color={skin.accent} anchorX="center">{player.towerStyle.toUpperCase()}</Text>}
    </group>
  );
}

function Arena({ players, selected, onSelect }: { players: Player[]; selected: string | null; onSelect: (id: string) => void }) {
  const { camera } = useThree();
  useEffect(() => { camera.position.set(11, 12, 15); camera.lookAt(0, 0, 0); }, [camera]);
  const positions = useMemo(() => players.map((_, i) => {
    const cols = Math.ceil(Math.sqrt(Math.max(1, players.length)));
    const row = Math.floor(i / cols);
    const col = i % cols;
    return [(col - (cols - 1) / 2) * 3.15, 0, (row - (Math.ceil(players.length / cols) - 1) / 2) * 3.15] as [number, number, number];
  }), [players]);

  return <>
    <color attach="background" args={["#080c11"]} />
    <fog attach="fog" args={["#080c11", 13, 34]} />
    <ambientLight intensity={0.72} />
    <directionalLight position={[8, 13, 4]} intensity={2.1} />
    <pointLight position={[0, 9, 0]} intensity={14} color="#f5a524" distance={22} />
    <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[13, 64]} /><meshStandardMaterial color="#111821" roughness={0.84} /></mesh>
    <gridHelper args={[24, 24, "#30404e", "#17202a"]} position={[0, 0.01, 0]} />
    <mesh position={[0, -0.08, 0]}><cylinderGeometry args={[3.1, 3.4, 0.16, 32]} /><meshStandardMaterial color="#18232e" metalness={0.25} /></mesh>
    <Text position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.3} color="#f5a524" anchorX="center">THE ASCENT</Text>
    {players.map((player, i) => <group key={player.id} position={positions[i]}><FloorStack player={player} selected={selected === player.id} onSelect={onSelect} /></group>)}
    <OrbitControls makeDefault enableDamping dampingFactor={0.12} minDistance={8} maxDistance={32} maxPolarAngle={Math.PI / 2.15} />
  </>;
}

export default function TowerWorld({ players, selected, onSelect }: { players: Player[]; selected: string | null; onSelect: (id: string) => void }) {
  return <Canvas dpr={[1, 1.5]} camera={{ position: [11, 12, 15], fov: 43 }} gl={{ antialias: true, powerPreference: "high-performance" }}><Arena players={players} selected={selected} onSelect={onSelect} /></Canvas>;
}
