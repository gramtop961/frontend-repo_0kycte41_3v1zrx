import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Futuristic blockchain 3D accent: floating chain links, coins, and a subtle node network.
// Lightweight, no external assets, tuned for hero backgrounds.
export default function Blockchain3D({
  primaryColor = '#00E5FF',
  accentColor = '#A855F7',
  coinColor = '#FDE68A',
  density = 0.8, // 0..1 controls how many nodes/links spawn
  dpr = Math.min(window.devicePixelRatio || 1, 2),
  className = '',
  style = {},
}) {
  const containerRef = useRef(null)
  const rafRef = useRef(0)
  const visibleRef = useRef(true)

  useEffect(() => {
    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x05070a, 0.015)

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100)
    camera.position.set(0, 0.6, 4.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Lighting
    const hemi = new THREE.HemisphereLight(0x99ccff, 0x0b1020, 0.8)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(3, 4, 2)
    scene.add(dir)

    // Root group for subtle parallax
    const root = new THREE.Group()
    scene.add(root)

    // Materials
    const primary = new THREE.Color(primaryColor)
    const accent = new THREE.Color(accentColor)
    const coin = new THREE.Color(coinColor)

    const metallic = new THREE.MeshStandardMaterial({
      color: primary,
      metalness: 0.85,
      roughness: 0.2,
      emissive: primary.clone().multiplyScalar(0.15),
      emissiveIntensity: 0.6,
    })

    const metallicAccent = new THREE.MeshStandardMaterial({
      color: accent,
      metalness: 0.8,
      roughness: 0.3,
      emissive: accent.clone().multiplyScalar(0.12),
      emissiveIntensity: 0.5,
    })

    const coinMat = new THREE.MeshStandardMaterial({
      color: coin,
      metalness: 0.95,
      roughness: 0.25,
      emissive: coin.clone().multiplyScalar(0.06),
      emissiveIntensity: 0.4,
    })

    // Helpers to build elements
    const makeChain = (scale = 1) => {
      const g = new THREE.Group()
      const torusGeo = new THREE.TorusGeometry(0.35, 0.1, 16, 64)
      const ringA = new THREE.Mesh(torusGeo, metallic)
      const ringB = new THREE.Mesh(torusGeo, metallicAccent)
      ringA.rotation.x = Math.PI / 2
      ringB.rotation.y = Math.PI / 2
      ringB.position.x = 0.5
      g.add(ringA)
      g.add(ringB)
      g.scale.setScalar(scale)
      return g
    }

    const makeCoin = (radius = 0.25, thickness = 0.08) => {
      const geo = new THREE.CylinderGeometry(radius, radius, thickness, 48)
      const mesh = new THREE.Mesh(geo, coinMat)
      return mesh
    }

    // Chains cluster
    const chains = new THREE.Group()
    const chainCount = Math.floor(3 + 4 * density)
    for (let i = 0; i < chainCount; i++) {
      const c = makeChain(0.7 + Math.random() * 0.8)
      c.position.set(
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.2) * 2.4,
        -0.8 - Math.random() * 1.8
      )
      c.rotation.set(Math.random() * 1.5, Math.random() * 1.5, Math.random() * 1.5)
      chains.add(c)
    }
    root.add(chains)

    // Coins
    const coins = new THREE.Group()
    const coinCount = Math.floor(6 + 8 * density)
    for (let i = 0; i < coinCount; i++) {
      const r = 0.12 + Math.random() * 0.22
      const m = makeCoin(r, 0.06 + Math.random() * 0.06)
      m.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.3) * 3.2, -0.6 - Math.random() * 2.2)
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      coins.add(m)
    }
    root.add(coins)

    // Node network
    const nodes = new THREE.Group()
    const nodeCount = Math.floor(60 + 80 * density)
    const nodeGeo = new THREE.SphereGeometry(0.02, 8, 8)
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const nodeMeshes = []
    for (let i = 0; i < nodeCount; i++) {
      const mesh = new THREE.Mesh(nodeGeo, nodeMat)
      mesh.position.set((Math.random() - 0.5) * 7, (Math.random() - 0.25) * 3.8, -1.2 - Math.random() * 3.5)
      nodes.add(mesh)
      nodeMeshes.push(mesh)
    }

    // Connect a subset with lines
    const lineMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.25 })
    const lineGeo = new THREE.BufferGeometry()
    const connections = []
    for (let i = 0; i < nodeCount; i += Math.floor(2 + Math.random() * 3)) {
      const a = nodeMeshes[i]
      const b = nodeMeshes[(i + Math.floor(3 + Math.random() * 10)) % nodeCount]
      connections.push(a.position.clone(), b.position.clone())
    }
    const pos = new Float32Array(connections.length * 3)
    connections.forEach((v, idx) => {
      pos[idx * 3 + 0] = v.x
      pos[idx * 3 + 1] = v.y
      pos[idx * 3 + 2] = v.z
    })
    lineGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const lines = new THREE.LineSegments(lineGeo, lineMat)
    nodes.add(lines)
    root.add(nodes)

    // Mouse parallax
    const target = new THREE.Vector2(0, 0)
    const current = new THREE.Vector2(0, 0)
    const onPointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      target.set(x, y)
    }
    window.addEventListener('pointermove', onPointerMove)

    // Visibility pause
    const onVis = () => {
      visibleRef.current = document.visibilityState === 'visible'
    }
    document.addEventListener('visibilitychange', onVis)

    // Resize
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // Animation
    const clock = new THREE.Clock()
    const tmp = new THREE.Vector3()
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      if (!visibleRef.current) return
      const t = clock.getElapsedTime()

      // Smooth parallax
      current.lerp(target, 0.05)
      root.position.x = current.x * 0.25
      root.position.y = -current.y * 0.15
      root.rotation.y = current.x * 0.1

      // Chains spin
      chains.children.forEach((c, i) => {
        c.rotation.x += 0.002 + i * 0.0002
        c.rotation.y -= 0.003 + i * 0.0001
      })

      // Coins float
      coins.children.forEach((coinMesh, i) => {
        coinMesh.rotation.y += 0.02
        coinMesh.position.y += Math.sin(t * 1.2 + i) * 0.002
      })

      // Node shimmer: pulse line opacity subtly
      lineMat.opacity = 0.18 + 0.07 * (0.5 + 0.5 * Math.sin(t * 1.5))

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      container.removeChild(renderer.domElement)
      // Dispose
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose?.()
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose?.())
          } else {
            obj.material?.dispose?.()
          }
        }
      })
      renderer.dispose()
    }
  }, [primaryColor, accentColor, coinColor, density, dpr])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      style={{ ...style }}
      aria-hidden
    />
  )
}
