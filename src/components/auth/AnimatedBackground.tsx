import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 120

function Particles() {
  const mesh = useRef<THREE.Points>(null!)

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const col = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6
      col[i * 3] = 0.15 + Math.random() * 0.2
      col[i * 3 + 1] = 0.4 + Math.random() * 0.3
      col[i * 3 + 2] = 0.85 + Math.random() * 0.15
    }
    return [pos, col]
  }, [])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.y = clock.elapsedTime * 0.035
    mesh.current.rotation.x = Math.sin(clock.elapsedTime * 0.02) * 0.12
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" count={PARTICLE_COUNT} array={colors} itemSize={3} args={[colors, 3]} />      </bufferGeometry>
      <pointsMaterial vertexColors size={0.055} transparent opacity={0.65} sizeAttenuation />
    </points>
  )
}

function NetworkLines() {
  const ref = useRef<THREE.LineSegments>(null!)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const nodes: [number, number, number][] = Array.from({ length: 18 }, () => [
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 3,
    ])
    const linePos: number[] = []
    nodes.forEach((n, i) => {
      nodes.slice(i + 1).forEach((m) => {
        const dist = Math.hypot(n[0] - m[0], n[1] - m[1], n[2] - m[2])
        if (dist < 5) linePos.push(...n, ...m)
      })
    })
    geo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3))
    return geo
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.025
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.015) * 0.08
    }
  })

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#3b82f6" transparent opacity={0.12} />
    </lineSegments>
  )
}

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
        <Particles />
        <NetworkLines />
      </Canvas>
    </div>
  )
}
