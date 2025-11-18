import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * LaserFlow - React Bits style Laser Flow background implemented with Three.js (no react-three-fiber)
 * - Fullscreen canvas that fills its container
 * - Adaptive DPR
 * - Vertex + Fragment shaders (complete)
 * - Mouse parallax & tilt
 * - requestAnimationFrame loop
 * - Resize handling
 * - Page visibility pause/resume
 * - Fade-in animation
 */

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  uniform vec3 u_color;
  uniform float u_horizontalBeamOffset;
  uniform float u_verticalBeamOffset;
  uniform float u_flowSpeed;
  uniform float u_wispDensity;
  uniform float u_wispSpeed;
  uniform float u_wispIntensity;
  uniform float u_fogIntensity;
  uniform float u_verticalSizing;
  uniform float u_horizontalSizing;
  uniform float u_flowStrength;
  uniform float u_decay;
  uniform float u_falloffStart;
  uniform float u_fogFallSpeed;

  // Hash/Noise utilities
  float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
  }

  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float f = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for(int i = 0; i < 5; i++){
      f += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return f;
  }

  void main() {
    vec2 uv = vUv;

    // Center and aspect correct
    vec2 p = (uv - 0.5);
    p.x *= u_resolution.x / u_resolution.y;

    // Mouse tilt
    p.x += u_mouse.x * 0.05;
    p.y += u_mouse.y * 0.03;

    // Flow field coordinates
    float t = u_time * u_flowSpeed;

    // Primary horizontal beams with offsets
    float beamY = (p.y + u_verticalBeamOffset);
    float beam = exp(-pow(abs(beamY) / u_horizontalSizing, u_decay));

    // Add a second offset beam for richness
    float beam2Y = (p.y - u_verticalBeamOffset);
    float beam2 = exp(-pow(abs(beam2Y) / (u_horizontalSizing * 1.2), u_decay));

    // Wisps - animated fog-like streaks
    vec2 nUv = vec2(p.x * u_verticalSizing + t * u_wispSpeed, p.y * u_verticalSizing);
    float wisps = fbm(nUv * u_wispDensity);

    // Flow modulation to create lateral motion
    float flow = sin((p.x + u_horizontalBeamOffset + t) * 6.2831) * u_flowStrength;

    // Combine beams and wisps
    float intensity = beam + beam2 + wisps * u_wispIntensity + flow;

    // Fog falloff from center and bottom
    float dist = length(p);
    float fog = smoothstep(u_falloffStart, 0.0, dist) * u_fogIntensity;
    float verticalFog = smoothstep(-0.2, 0.8, uv.y + (sin(t * u_fogFallSpeed) * 0.02)) * u_fogIntensity * 0.6;

    float finalIntensity = max(0.0, intensity) + fog + verticalFog;

    vec3 color = u_color * finalIntensity;

    // Subtle color shift
    color.r += 0.03 * sin(t * 1.7 + p.y * 6.0);
    color.b += 0.02 * cos(t * 1.1 + p.x * 5.0);

    // Gamma correction
    color = pow(color, vec3(0.85));

    gl_FragColor = vec4(color, clamp(finalIntensity, 0.0, 1.0));
  }
`

const defaultProps = {
  color: '#FF79C6',
  horizontalBeamOffset: 0.1,
  verticalBeamOffset: 0.0,
  flowSpeed: 0.35,
  wispDensity: 1.0,
  wispSpeed: 15.0,
  wispIntensity: 5.0,
  fogIntensity: 0.45,
  verticalSizing: 2.0,
  horizontalSizing: 0.5,
  flowStrength: 0.25,
  decay: 1.1,
  falloffStart: 1.2,
  fogFallSpeed: 0.6,
  mouseSmoothTime: 0.0,
  mouseTiltStrength: 0.01,
  className: '',
  style: {},
  dpr: undefined,
}

function LaserFlow(props) {
  const {
    color,
    horizontalBeamOffset,
    verticalBeamOffset,
    flowSpeed,
    wispDensity,
    wispSpeed,
    wispIntensity,
    fogIntensity,
    verticalSizing,
    horizontalSizing,
    flowStrength,
    decay,
    falloffStart,
    fogFallSpeed,
    mouseSmoothTime,
    mouseTiltStrength,
    className,
    style,
    dpr,
  } = { ...defaultProps, ...props }

  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const rafRef = useRef(0)
  const startRef = useRef(performance.now())
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const uniformsRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const geometry = new THREE.PlaneGeometry(2, 2)

    const parsedColor = new THREE.Color(color)

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_color: { value: new THREE.Vector3(parsedColor.r, parsedColor.g, parsedColor.b) },
      u_horizontalBeamOffset: { value: horizontalBeamOffset },
      u_verticalBeamOffset: { value: verticalBeamOffset },
      u_flowSpeed: { value: flowSpeed },
      u_wispDensity: { value: wispDensity },
      u_wispSpeed: { value: wispSpeed },
      u_wispIntensity: { value: wispIntensity },
      u_fogIntensity: { value: fogIntensity },
      u_verticalSizing: { value: verticalSizing },
      u_horizontalSizing: { value: horizontalSizing },
      u_flowStrength: { value: flowStrength },
      u_decay: { value: decay },
      u_falloffStart: { value: falloffStart },
      u_fogFallSpeed: { value: fogFallSpeed },
    }

    uniformsRef.current = uniforms

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    rendererRef.current = renderer

    // Adaptive DPR
    const targetDpr = dpr ?? Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(targetDpr)

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.opacity = '0'
    renderer.domElement.style.transition = 'opacity 800ms ease'

    container.appendChild(renderer.domElement)

    // Fade-in
    requestAnimationFrame(() => {
      renderer.domElement.style.opacity = '1'
    })

    let isVisible = true

    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      uniforms.u_resolution.value.set(w, h)
    }

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const nx = (x - 0.5) * 2.0
      const ny = (y - 0.5) * -2.0
      mouseRef.current.targetX = nx * mouseTiltStrength
      mouseRef.current.targetY = ny * mouseTiltStrength
    }

    const onVisibility = () => {
      isVisible = document.visibilityState === 'visible'
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('visibilitychange', onVisibility)

    const tick = () => {
      const now = performance.now()
      const elapsed = (now - startRef.current) / 1000

      // Smooth mouse
      const m = mouseRef.current
      const smooth = Math.max(0.0, Math.min(1.0, mouseSmoothTime))
      m.x = THREE.MathUtils.lerp(m.x, m.targetX, smooth > 0 ? smooth : 1.0)
      m.y = THREE.MathUtils.lerp(m.y, m.targetY, smooth > 0 ? smooth : 1.0)

      uniforms.u_time.value = elapsed
      uniforms.u_mouse.value.set(m.x, m.y)

      if (isVisible) {
        renderer.render(scene, camera)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', onVisibility)

      geometry.dispose()
      material.dispose()
      renderer.dispose()

      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [
    color,
    horizontalBeamOffset,
    verticalBeamOffset,
    flowSpeed,
    wispDensity,
    wispSpeed,
    wispIntensity,
    fogIntensity,
    verticalSizing,
    horizontalSizing,
    flowStrength,
    decay,
    falloffStart,
    fogFallSpeed,
    mouseSmoothTime,
    mouseTiltStrength,
    dpr,
  ])

  // Keep uniforms up to date if props change dynamically
  useEffect(() => {
    if (!uniformsRef.current) return
    const parsedColor = new THREE.Color(color)
    uniformsRef.current.u_color.value.set(parsedColor.r, parsedColor.g, parsedColor.b)
    uniformsRef.current.u_horizontalBeamOffset.value = horizontalBeamOffset
    uniformsRef.current.u_verticalBeamOffset.value = verticalBeamOffset
    uniformsRef.current.u_flowSpeed.value = flowSpeed
    uniformsRef.current.u_wispDensity.value = wispDensity
    uniformsRef.current.u_wispSpeed.value = wispSpeed
    uniformsRef.current.u_wispIntensity.value = wispIntensity
    uniformsRef.current.u_fogIntensity.value = fogIntensity
    uniformsRef.current.u_verticalSizing.value = verticalSizing
    uniformsRef.current.u_horizontalSizing.value = horizontalSizing
    uniformsRef.current.u_flowStrength.value = flowStrength
    uniformsRef.current.u_decay.value = decay
    uniformsRef.current.u_falloffStart.value = falloffStart
    uniformsRef.current.u_fogFallSpeed.value = fogFallSpeed
  }, [
    color,
    horizontalBeamOffset,
    verticalBeamOffset,
    flowSpeed,
    wispDensity,
    wispSpeed,
    wispIntensity,
    fogIntensity,
    verticalSizing,
    horizontalSizing,
    flowStrength,
    decay,
    falloffStart,
    fogFallSpeed,
  ])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'absolute', inset: 0, ...style }}
      aria-hidden
    />
  )
}

export default LaserFlow
