"use client";

import { useEffect, useRef } from "react";

type IridescenceProps = {
  className?: string;
  color?: [number, number, number];
  speed?: number;
};

const VERTEX = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() { vUv = aPosition * .5 + .5; gl_Position = vec4(aPosition, 0., 1.); }`;

// Adapted from the supplied iridescence effect: a deliberately low-cost, full-screen WebGL field.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColor;
out vec4 outColor;
in vec2 vUv;

vec3 hueRotate(vec3 c, float a) {
  vec3 k = vec3(.57735027); float ca = cos(a);
  return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1. - ca);
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 aspect = uResolution / min(uResolution.x, uResolution.y);
  vec2 uv = (vUv * 2. - 1.) * aspect;
  vec2 pointer = (uPointer * 2. - 1.) * aspect;
  float ripple = sin(length(uv - pointer) * 7. - uTime * .8) * .12;
  float wave = sin(uv.x * 2.4 + uTime * .18) + cos(uv.y * 3.1 - uTime * .14) + ripple;
  vec3 col = .5 + .5 * cos(vec3(1.8, 2.8, 4.2) + wave + vec3(0., .7, 1.4));
  col = hueRotate(col, -.45) * uColor;
  float vignette = smoothstep(1.5, .25, length(uv));
  float grain = (hash(gl_FragCoord.xy) - .5) * .025;
  outColor = vec4(col * (.2 + vignette * .8) + grain, .92);
}`;

function shader(gl: WebGL2RenderingContext, type: number, source: string) {
  const value = gl.createShader(type);
  if (!value) return null;
  gl.shaderSource(value, source);
  gl.compileShader(value);
  if (gl.getShaderParameter(value, gl.COMPILE_STATUS)) return value;
  gl.deleteShader(value);
  return null;
}

export default function Iridescence({ className = "", color = [1, 0.54, 0.15], speed = 1 }: IridescenceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [red, green, blue] = color;

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", { alpha: true, antialias: false });
    if (!root || !canvas || !gl) return;
    const vertex = shader(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = shader(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    if (!buffer) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "uResolution");
    const time = gl.getUniformLocation(program, "uTime");
    const pointerUniform = gl.getUniformLocation(program, "uPointer");
    const colorUniform = gl.getUniformLocation(program, "uColor");
    const pointer = { x: 0.5, y: 0.5 };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let start = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(root.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(root.clientHeight * ratio));
    };
    const draw = (now: number) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, ((now - start) / 1000) * speed);
      gl.uniform2f(pointerUniform, pointer.x, pointer.y);
      gl.uniform3f(colorUniform, red, green, blue);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      pointer.x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      pointer.y = Math.min(1, Math.max(0, 1 - (event.clientY - bounds.top) / bounds.height));
      if (reducedMotion) draw(performance.now());
    };
    const observer = new ResizeObserver(() => { resize(); draw(performance.now()); });
    observer.observe(root);
    root.addEventListener("pointermove", move, { passive: true });
    resize();
    draw(start);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("pointermove", move);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [blue, green, red, speed]);

  return <div ref={rootRef} className={`iridescence ${className}`} aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
