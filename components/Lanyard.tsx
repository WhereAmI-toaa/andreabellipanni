/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Canvas, extend, useFrame, type ThreeEvent } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'

import styles from './Lanyard.module.css'

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const trimmedBasePath = rawBasePath.replace(/^\/+/, '').replace(/\/+$/, '')
const basePath = trimmedBasePath ? `/${trimmedBasePath}` : ''
const cardGLB = `${basePath}/lanyard/card.glb`
const lanyardTexture = `${basePath}/lanyard/lanyard.png`

extend({ MeshLineGeometry, MeshLineMaterial })

type LanyardProps = {
  position?: [number, number, number]
  gravity?: [number, number, number]
  fov?: number
  transparent?: boolean
  onSelect?: () => void
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  onSelect
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={styles.wrapper}>
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} onSelect={onSelect} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  )
}

type BandProps = {
  maxSpeed?: number
  minSpeed?: number
  isMobile?: boolean
  onSelect?: () => void
}

function Band({
  maxSpeed = 18,
  minSpeed = 0.08,
  isMobile = false,
  onSelect
}: BandProps) {
  const band = useRef<any>(null)
  const fixed = useRef<any>(null)
  const j1 = useRef<any>(null)
  const j2 = useRef<any>(null)
  const j3 = useRef<any>(null)
  const card = useRef<any>(null)
  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const segmentProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 7,
    linearDamping: 7
  } as const
  const cardScale = 2.6
  const cardOffset: [number, number, number] = [0, -3, -0.05]
  const cardAnchor: [number, number, number] = [0, 0.1, 0]
  const lanyardOrigin: [number, number, number] = [0, 4.5, 0]
  const { nodes, materials } = useGLTF(cardGLB) as any
  const texture = useTexture(lanyardTexture) as THREE.Texture
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
      ])
  )
  const [dragged, drag] = useState<false | THREE.Vector3>(false)
  const [hovered, hover] = useState(false)
  const [dragStart, setDragStart] = useState<THREE.Vector3 | null>(null)
  const lastClickRef = useRef<number | null>(null)
  const lastHoverPoint = useRef<THREE.Vector3 | null>(null)

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], cardAnchor])

  useEffect(() => {
    if (!hovered) {
      document.body.style.cursor = 'auto'
      return
    }

    document.body.style.cursor = dragged ? 'grabbing' : 'grab'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      })
    }

    if (fixed.current && band.current) {
      ;[j1, j2].forEach((ref) => {
        if (!ref.current.lerped) {
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        }
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        )
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        )
      })
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 24 : 48))
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    }
  })

  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    const target = event.target as HTMLElement | null
    target?.setPointerCapture?.(event.pointerId)
    setDragStart(new THREE.Vector3().copy(event.point))
    drag(new THREE.Vector3().copy(event.point).sub(vec.copy(card.current.translation())))
  }

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!card.current || dragged) return
    if (!lastHoverPoint.current) {
      lastHoverPoint.current = new THREE.Vector3().copy(event.point)
      return
    }

    const delta = new THREE.Vector3().subVectors(event.point, lastHoverPoint.current)
    lastHoverPoint.current.copy(event.point)

    if (delta.length() < 0.003) return
    delta.clampLength(0, 0.012)
    const impulseStrength = 3.5
    card.current.applyImpulse(
      { x: delta.x * impulseStrength, y: delta.y * impulseStrength, z: delta.z * impulseStrength },
      true
    )
  }

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    const target = event.target as HTMLElement | null
    target?.releasePointerCapture?.(event.pointerId)
    drag(false)

    if (dragStart && onSelect) {
      const distance = dragStart.distanceTo(event.point)
      if (distance < 0.03) {
        const now = performance.now()
        if (lastClickRef.current !== null && now - lastClickRef.current < 350) {
          onSelect()
          lastClickRef.current = null
        } else {
          lastClickRef.current = now
        }
      }
    }

    setDragStart(null)
  }

  return (
    <>
      <group position={lanyardOrigin}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
          mass={3}
        >
          <CuboidCollider args={[1, 1.35, 0.02]} />
          <group
            scale={cardScale}
            position={cardOffset}
            onPointerOver={(event) => {
              hover(true)
              lastHoverPoint.current = new THREE.Vector3().copy(event.point)
            }}
            onPointerMove={handlePointerMove}
            onPointerOut={() => {
              hover(false)
              lastHoverPoint.current = null
            }}
            onPointerUp={handlePointerUp}
            onPointerDown={handlePointerDown}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  )
}
