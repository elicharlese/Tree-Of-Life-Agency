'use client'

import { Suspense, useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'

// Service nodes representing family members and their specialties
const serviceNodes = [
  { id: 'core', position: [0, 0, 0], label: 'Tree of Life\nAgency', color: '#3a9b3a', size: 1.2 },
  { id: 'frontend', position: [-3, 2, 1], label: 'Frontend\nDevelopment', color: '#5cb85c', size: 0.8 },
  { id: 'backend', position: [3, 2, -1], label: 'Backend\nSystems', color: '#2d7d2d', size: 0.8 },
  { id: 'mobile', position: [-2, -2, 2], label: 'Mobile\nApps', color: '#8fd18f', size: 0.8 },
  { id: 'design', position: [2, -2, -2], label: 'UI/UX\nDesign', color: '#bce5bc', size: 0.8 },
  { id: 'devops', position: [0, 3, 0], label: 'DevOps &\nInfrastructure', color: '#1f4f1f', size: 0.8 },
  { id: 'business', position: [0, -3, 0], label: 'Business\nStrategy', color: '#eab308', size: 0.8 },
]

// Connections between services
const connections = [
  ['core', 'frontend'],
  ['core', 'backend'],
  ['core', 'mobile'],
  ['core', 'design'],
  ['core', 'devops'],
  ['core', 'business'],
  ['frontend', 'design'],
  ['backend', 'devops'],
  ['mobile', 'frontend'],
  ['design', 'business'],
]

function ServiceNode({ node, isHovered, onHover }: { 
  node: typeof serviceNodes[0], 
  isHovered: boolean, 
  onHover: (id: string | null) => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const textRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + node.position[0]) * 0.02
    }
  })

  return (
    <group position={node.position as [number, number, number]}>
      <Sphere
        ref={meshRef}
        args={[node.size, 32, 32]}
        onPointerOver={() => onHover(node.id)}
        onPointerOut={() => onHover(null)}
        scale={isHovered ? 1.2 : 1}
      >
        <meshStandardMaterial 
          color={node.color} 
          transparent
          opacity={isHovered ? 0.9 : 0.7}
          emissive={node.color}
          emissiveIntensity={isHovered ? 0.3 : 0.1}
        />
      </Sphere>
      <Text
        ref={textRef}
        position={[0, -node.size - 0.8, 0]}
        fontSize={0.3}
        color="#2d4a22"
        anchorX="center"
        anchorY="middle"
        font={undefined}
        maxWidth={2}
        textAlign="center"
      >
        {node.label}
      </Text>
    </group>
  )
}

function ConnectionLine({ start, end }: { start: [number, number, number], end: [number, number, number] }) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end])

  return (
    <Line
      points={points}
      color="#8fd18f"
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  )
}

function Scene() {
  const { camera } = useThree()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  
  // Set initial camera position
  useMemo(() => {
    camera.position.set(8, 4, 8)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#eab308" />
      
      {/* Service Nodes */}
      {serviceNodes.map((node) => (
        <ServiceNode
          key={node.id}
          node={node}
          isHovered={hoveredNode === node.id}
          onHover={setHoveredNode}
        />
      ))}
      
      {/* Connection Lines */}
      {connections.map(([startId, endId], index) => {
        const startNode = serviceNodes.find(n => n.id === startId)
        const endNode = serviceNodes.find(n => n.id === endId)
        if (!startNode || !endNode) return null
        
        return (
          <ConnectionLine
            key={index}
            start={startNode.position as [number, number, number]}
            end={endNode.position as [number, number, number]}
          />
        )
      })}
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}


export default function Hero3DScene() {
  return (
    <div className="w-full h-[500px] md:h-[600px] relative">
      <Canvas
        camera={{ position: [8, 4, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* Overlay content */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-center z-10 bg-white/10 backdrop-blur-sm rounded-organic p-6 max-w-md">
          <h3 className="text-lg font-semibold text-bark-800 mb-2">
            Interactive Family Network
          </h3>
          <p className="text-sm text-bark-600">
            Hover over the nodes to explore our specialized services
          </p>
        </div>
      </div>
    </div>
  )
}
