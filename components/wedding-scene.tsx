'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, MeshTransmissionMaterial } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function Arch() {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.08
  })
  return (
    <group ref={group} position={[0, -0.2, 0]}>
      <mesh position={[-1.8, 0.9, 0]}><cylinderGeometry args={[0.1, 0.12, 3.8, 24]} /><meshStandardMaterial color="#9f6b3f" metalness={0.75} roughness={0.28} /></mesh>
      <mesh position={[1.8, 0.9, 0]}><cylinderGeometry args={[0.1, 0.12, 3.8, 24]} /><meshStandardMaterial color="#9f6b3f" metalness={0.75} roughness={0.28} /></mesh>
      <mesh position={[0, 2.75, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[1.8, 0.1, 18, 64, Math.PI]} /><meshStandardMaterial color="#b97862" metalness={0.7} roughness={0.3} /></mesh>
      {[[-1.45, 1.8, 0.12], [-0.95, 2.28, 0.1], [0.95, 2.25, 0.1], [1.5, 1.75, 0.12]].map((p, i) => <mesh key={i} position={p as [number, number, number]} rotation={[0.2, i, 0.4]}><dodecahedronGeometry args={[0.16, 0]} /><meshStandardMaterial color="#e9c99b" metalness={0.65} roughness={0.24} /></mesh>)}
    </group>
  )
}

function Rings() {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock, pointer }) => {
    if (group.current) { group.current.rotation.x = clock.elapsedTime * 0.22 + pointer.y * 0.12; group.current.rotation.y = clock.elapsedTime * 0.32 + pointer.x * 0.16 }
  })
  return <group ref={group} position={[0, 0.5, 0]}><mesh rotation={[0.7, 0.3, 0]}><torusGeometry args={[0.72, 0.045, 16, 64]} /><meshStandardMaterial color="#e6bf83" metalness={0.95} roughness={0.16} /></mesh><mesh rotation={[0.2, 0.8, 1.1]}><torusGeometry args={[0.5, 0.035, 16, 64]} /><meshStandardMaterial color="#b97862" metalness={0.85} roughness={0.22} /></mesh></group>
}

function SceneContent() {
  const camera = useRef<THREE.PerspectiveCamera>(null)
  useFrame(({ clock, pointer }) => { if (camera.current) { camera.current.position.x = THREE.MathUtils.lerp(camera.current.position.x, pointer.x * 0.45, 0.03); camera.current.position.y = THREE.MathUtils.lerp(camera.current.position.y, pointer.y * 0.25, 0.03); camera.current.lookAt(0, 0.9, 0) }; void clock })
  return <><perspectiveCamera ref={camera} makeDefault position={[0, 0, 7]} fov={42} /><ambientLight intensity={1.5} /><directionalLight position={[3, 5, 4]} intensity={4} color="#fff0d5" /><pointLight position={[-3, 1, 2]} intensity={8} distance={7} color="#b97862" /><Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.35}><Arch /></Float><Float speed={1.7} rotationIntensity={0.35} floatIntensity={0.6}><Rings /></Float><Sparkles count={90} scale={[7, 5, 4]} size={2.2} speed={0.35} color="#edcf9e" /><mesh position={[0, -1.35, -0.7]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.7, 64]} /><MeshTransmissionMaterial color="#6f2430" transmission={0.2} roughness={0.7} thickness={0.4} /></mesh></>
}

export default function WeddingScene() {
  return <div className="scene-canvas" aria-label="Animated golden wedding arch with floating rings"><Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}><SceneContent /></Canvas></div>
}

export { WeddingScene }
