'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Detectar mobile y NO usar WebGL
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // En mobile, solo ocultar el canvas y usar CSS background
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      if (canvas) canvas.style.display = 'none';
      return;
    }
    
    // Solo desktop usa WebGL
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
   
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
   
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
       
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
   
    function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const program = gl.createProgram();
        if (!program) return null;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
       
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }
   
    const vertexShaderSource = document.getElementById('vertexShader')?.textContent || '';
    const fragmentShaderSource = document.getElementById('fragmentShader')?.textContent || '';
   
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) {
      console.error('Failed to create shaders');
      return;
    }
    
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      console.error('Failed to create program');
      return;
    }
   
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
   
    const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1, 1,
         1, 1,
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
   
    document.querySelectorAll('.glass-button').forEach(button => {
        button.addEventListener('mousemove', (e: Event) => {
            const mouseEvent = e as MouseEvent;
            const rect = (button as HTMLElement).getBoundingClientRect();
            const x = ((mouseEvent.clientX - rect.left) / rect.width) * 100;
            const y = ((mouseEvent.clientY - rect.top) / rect.height) * 100;
            (button as HTMLElement).style.setProperty('--x', x + '%');
            (button as HTMLElement).style.setProperty('--y', y + '%');
        });
    });
   
    let startTime = Date.now();
    let animationId: number;
    let isRunning = true;
    
    function render() {
        if (!isRunning || !gl || !program || !positionBuffer) return;
        
        try {
          const currentTime = (Date.now() - startTime) * 0.001;
         
          gl.clearColor(0.0, 0.0, 0.0, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.useProgram(program);
         
          gl.uniform1f(uTime, currentTime);
          gl.uniform2f(uResolution, canvas.width, canvas.height);
         
          const positionLocation = gl.getAttribLocation(program, 'position');
          gl.enableVertexAttribArray(positionLocation);
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
         
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
         
          animationId = requestAnimationFrame(render);
        } catch (error) {
          console.error('Error rendering:', error);
          isRunning = false;
        }
    }
    render();

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        overflow: hidden;
        background: #000;
    }
    
    .mobile-background {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: 
            radial-gradient(ellipse at 30% 50%, rgba(76, 29, 149, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(38, 77, 153, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.08) 0%, transparent 70%),
            linear-gradient(180deg, #000000 0%, #0a0015 50%, #000000 100%);
        animation: mobileGradient 8s ease-in-out infinite;
    }
    
    @keyframes mobileGradient {
        0%, 100% {
            background: 
                radial-gradient(ellipse at 30% 50%, rgba(76, 29, 149, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 60%, rgba(38, 77, 153, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.08) 0%, transparent 70%),
                linear-gradient(180deg, #000000 0%, #0a0015 50%, #000000 100%);
        }
        50% {
            background: 
                radial-gradient(ellipse at 70% 60%, rgba(76, 29, 149, 0.18) 0%, transparent 50%),
                radial-gradient(ellipse at 30% 40%, rgba(38, 77, 153, 0.18) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(0, 191, 255, 0.1) 0%, transparent 70%),
                linear-gradient(180deg, #000000 0%, #0a0015 50%, #000000 100%);
        }
    }
    
    @media (max-width: 768px) {
        .mobile-background {
            display: block;
        }
    }
    
    canvas {
        display: block;
        width: 100%;
        height: 100vh;
    }
    .content {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
        text-align: center;
        color: white;
        pointer-events: none;
    }
    h1 {
        font-size: clamp(4.5rem, 13vw, 11rem);
        font-weight: 900;
        margin-bottom: 0.5rem;
        letter-spacing: -0.06em;
        background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 0 40px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 80px rgba(138, 43, 226, 0.3));
        animation: glowPulse 3s ease-in-out infinite alternate;
    }
    img {
        animation: glowPulse 3s ease-in-out infinite alternate;
        margin-left: 3rem;
    }
    @media (max-width: 768px) {
        img {
            margin-left: auto;
            margin-right: auto;
            display: block;
        }
    }
    @keyframes glowPulse {
        from {
            filter: drop-shadow(0 0 40px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 80px rgba(138, 43, 226, 0.3));
        }
        to {
            filter: drop-shadow(0 0 60px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 120px rgba(0, 191, 255, 0.4));
        }
    }
    .tagline {
        font-size: clamp(0.9rem, 2vw, 1.2rem);
        font-weight: 300;
        color: rgba(255, 255, 255, 0.9);
        letter-spacing: 0.3em;
        text-transform: uppercase;
        text-shadow: 0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(138, 43, 226, 0.3);
    }
    @media (max-width: 768px) {
        .content {
            padding: 0 1rem;
            width: 100%;
        }
        .tagline {
            font-size: clamp(0.7rem, 3vw, 0.9rem);
            letter-spacing: 0.1em;
            line-height: 1.5;
        }
    }
    .buttons {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-top: 40px;
        pointer-events: auto;
        flex-wrap: wrap;
    }
    .glass-button {
        position: relative;
        padding: 16px 40px;
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        color: #fff;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
        border: 1.5px solid transparent;
        border-radius: 40px;
        backdrop-filter: blur(30px);
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.05);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
    }
   
    .glass-button::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 40px;
        padding: 1.5px;
        background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.4) 0%,
            rgba(138, 43, 226, 0.4) 25%,
            rgba(0, 191, 255, 0.4) 50%,
            rgba(255, 105, 180, 0.4) 75%,
            rgba(255, 255, 255, 0.4) 100%);
        background-size: 200% 200%;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: borderFlow 3s linear infinite;
        opacity: 0.6;
        transition: opacity 0.5s ease;
    }
    @keyframes borderFlow {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
    }
    .glass-button::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 40px;
        background: radial-gradient(circle at var(--x, 50%) var(--y, 50%),
            rgba(255, 255, 255, 0.2) 0%,
            transparent 50%);
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    .glass-button:hover {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
        box-shadow:
            0 12px 48px rgba(138, 43, 226, 0.3),
            0 0 80px rgba(0, 191, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(255, 255, 255, 0.1);
        transform: translateY(-3px) scale(1.02);
    }
    .glass-button:hover::before {
        opacity: 1;
        animation-duration: 2s;
    }
    .glass-button:hover::after {
        opacity: 1;
    }
    .glass-button:active {
        transform: translateY(-1px) scale(0.98);
        box-shadow:
            0 6px 24px rgba(138, 43, 226, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
    .glass-button .shimmer {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 45%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0.1) 55%,
            transparent 100%
        );
        transform: rotate(30deg);
        animation: shimmer 3s infinite;
        pointer-events: none;
    }
    @keyframes shimmer {
        0% { transform: translateX(-100%) rotate(30deg); }
        100% { transform: translateX(100%) rotate(30deg); }
    }
    .glass-button:hover .shimmer {
        animation-duration: 1.5s;
    }
    .glass-button span {
        position: relative;
        z-index: 1;
    }
    @media (max-width: 768px) {
        .glass-button {
            padding: 14px 32px;
            font-size: 0.9rem;
        }
    }
      `}} />
      <div className="mobile-background"></div>
      <canvas id="canvas"></canvas>
      <div className="content">
          <img src="/gitaf.svg" alt="GITAF" style={{width: 'clamp(300px, 50vw, 700px)', marginBottom: '2rem', filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 80px rgba(138, 43, 226, 0.3))'}} />
          <p className="tagline">Sistema de Orientación Audible Inalámbrico para el Entrenamiento de Fútbol Adaptado</p>
          <div className="buttons">
              <a href="/docs" className="glass-button">
                  <span className="shimmer"></span>
                  <span>Documentación</span>
              </a>
              <a href="https://github.com/DamianRoc13/FutSensitive" target="_blank" rel="noopener noreferrer" className="glass-button">
                  <span className="shimmer"></span>
                  <span>GitHub</span>
              </a>
          </div>
      </div>
      <script id="vertexShader" type="x-shader/x-vertex" dangerouslySetInnerHTML={{__html: `
    attribute vec2 position;
   
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
      `}} />
      <script id="fragmentShader" type="x-shader/x-fragment" dangerouslySetInnerHTML={{__html: `
    precision highp float;
   
    uniform float uTime;
    uniform vec2 uResolution;
   
    float hash(float n) {
        return fract(sin(n) * 43758.5453123);
    }
   
    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
        
        vec3 rd = normalize(vec3(uv, -1.0));
        
        float stars = 0.0;
        vec3 p = rd * 100.0;
        float h = hash(dot(p, vec3(12.9898, 78.233, 54.53)));
        if(h > 0.98) stars = pow(h - 0.98, 10.0) * 20.0;
        
        vec3 nebula = vec3(0.0);
        nebula += vec3(0.3, 0.15, 0.5) * pow(max(0.0, sin(rd.x * 2.0 + uTime * 0.1)), 3.0) * 0.2;
        nebula += vec3(0.15, 0.3, 0.6) * pow(max(0.0, sin(rd.y * 2.5 + uTime * 0.05)), 3.0) * 0.2;
        
        vec3 color = stars + nebula;
       
        float vignette = 1.0 - length(uv) * 0.4;
        vignette = smoothstep(0.3, 1.0, vignette);
        color *= vignette;
       
        color *= vec3(0.96, 0.99, 1.06);
        color = pow(color, vec3(0.88));
        color *= 1.12;
       
        gl_FragColor = vec4(color, 1.0);
    }
      `}} />
    </>
  );
}
