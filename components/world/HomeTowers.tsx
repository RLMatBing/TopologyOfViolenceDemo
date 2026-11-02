"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const colors=["#f5a524","#68b9ef","#ef7b80","#a695e8","#64d1a2","#d6dce3","#e29a59","#7ecac3"];
function Tower({index}:{index:number}){const group=useRef<THREE.Group>(null);const height=3+(index%4);useFrame(({clock})=>{if(!group.current)return;const t=clock.getElapsedTime();group.current.position.y=Math.sin(t*.75+index)*.09;group.current.rotation.y=Math.sin(t*.4+index)*.08;});return <group ref={group}>{Array.from({length:height},(_,floor)=><mesh key={floor} position={[0,.28+floor*.46,0]} rotation={[0,floor%2*.18,0]}><boxGeometry args={[.7,.38,.7]}/><meshStandardMaterial color={colors[index]} flatShading emissive={colors[index]} emissiveIntensity={.13}/></mesh>)}</group>}
function Ring(){const ring=useRef<THREE.Group>(null);const slots=useMemo(()=>Array.from({length:8},(_,index)=>index),[]);useFrame(({clock})=>{if(ring.current)ring.current.rotation.y=clock.getElapsedTime()*.16;});return <group ref={ring}>{slots.map(index=>{const angle=index/slots.length*Math.PI*2;return <group key={index} position={[Math.cos(angle)*3.15,0,Math.sin(angle)*3.15]}><Tower index={index}/></group>})}</group>}
function Scene(){return <><color attach="background" args={["#091017"]}/><fog attach="fog" args={["#091017",6,17]}/><ambientLight intensity={.85}/><pointLight position={[0,6,3]} color="#f5a524" intensity={14} distance={16}/><directionalLight position={[-5,7,2]} intensity={1.1}/><Ring/></>}
export default function HomeTowers(){return <div className="home-towers" aria-hidden="true"><Canvas dpr={[1,1.5]} camera={{position:[0,4.6,8.8],fov:42}} gl={{antialias:true,powerPreference:"high-performance"}}><Scene/></Canvas></div>}
