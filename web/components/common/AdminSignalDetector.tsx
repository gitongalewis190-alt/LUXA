'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const CONFIG = {
  MAX_POINTS:      300,
  CROSS_THRESHOLD: 28,
  MIN_LOOP_AREA:   5000,
  MIN_PATH_LENGTH: 80,
  GESTURE_TIMEOUT: 5500,
  IDLE_CLEAR:      3500,
  FADE_DURATION:   600,
} as const;

interface Point { x: number; y: number; t: number; }
interface Intersection { x: number; y: number; indexA: number; indexB: number; }
interface Bounds { minX: number; maxX: number; minY: number; maxY: number; centerX: number; centerY: number; }

function getDistance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function getBounds(points: Point[]): Bounds {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  return { minX, maxX, minY, maxY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
}

function getLoopArea(points: Point[]): number {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

function findSelfIntersections(path: Point[], threshold: number): Intersection[] {
  const intersections: Intersection[] = [];
  const step = Math.max(1, Math.floor(path.length / 60));

  for (let i = 0; i < path.length - 20; i += step) {
    for (let j = i + 20; j < path.length; j += step) {
      const dist = getDistance(path[i], path[j]);
      if (dist < threshold) {
        const isDuplicate = intersections.some(
          x => Math.abs(x.indexA - i) < 15 && Math.abs(x.indexB - j) < 15
        );
        if (!isDuplicate) {
          intersections.push({
            x:      (path[i].x + path[j].x) / 2,
            y:      (path[i].y + path[j].y) / 2,
            indexA: i,
            indexB: j,
          });
        }
      }
    }
  }
  return intersections;
}

function detectInfinityGesture(path: Point[]): boolean {
  if (path.length < CONFIG.MIN_PATH_LENGTH) return false;

  const duration = path[path.length - 1].t - path[0].t;
  if (duration > CONFIG.GESTURE_TIMEOUT) return false;

  const crossings = findSelfIntersections(path, CONFIG.CROSS_THRESHOLD);
  if (crossings.length === 0) return false;

  const crossPoint = crossings[Math.floor(crossings.length / 2)];
  const splitIndex = crossPoint.indexA;

  if (splitIndex < 20 || splitIndex > path.length - 20) return false;

  const leftLoop  = path.slice(0, splitIndex);
  const rightLoop = path.slice(splitIndex);

  if (leftLoop.length < 20 || rightLoop.length < 20) return false;

  const leftBounds  = getBounds(leftLoop);
  const rightBounds = getBounds(rightLoop);

  if (leftBounds.centerX >= crossPoint.x || rightBounds.centerX <= crossPoint.x) return false;

  const leftArea  = getLoopArea(leftLoop);
  const rightArea = getLoopArea(rightLoop);

  if (leftArea < CONFIG.MIN_LOOP_AREA || rightArea < CONFIG.MIN_LOOP_AREA) return false;

  const fullBounds  = getBounds(path);
  const aspectRatio = (fullBounds.maxX - fullBounds.minX) / Math.max(1, fullBounds.maxY - fullBounds.minY);

  return aspectRatio >= 1.0 && aspectRatio <= 6.0;
}

export function AdminSignalDetector() {
  const router       = useRouter();
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const pathRef      = useRef<Point[]>([]);
  const idleTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);

  const triggerAdminAccess = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      pathRef.current.forEach((p, i) => {
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.restore();

      let opacity = 0.15;
      const fadeInterval = setInterval(() => {
        opacity -= 0.015;
        if (opacity <= 0) {
          clearInterval(fadeInterval);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.globalAlpha = opacity;
        }
      }, 16);
    }

    sessionStorage.setItem('luxa-admin-signal', Date.now().toString());

    setTimeout(() => {
      router.push('/admin');
    }, CONFIG.FADE_DURATION);
  }, [router]);

  const recordPoint = useCallback((x: number, y: number) => {
    const now  = Date.now();
    const path = pathRef.current;

    if (path.length > 0) {
      const last = path[path.length - 1];
      if (getDistance({ x, y, t: now }, last) < 4) return;
    }

    path.push({ x, y, t: now });

    if (path.length > CONFIG.MAX_POINTS) {
      path.splice(0, path.length - CONFIG.MAX_POINTS);
    }

    if (path.length >= CONFIG.MIN_PATH_LENGTH && detectInfinityGesture(path)) {
      triggerAdminAccess();
    }
  }, [triggerAdminAccess]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      pathRef.current    = [];
      triggeredRef.current = false;
    }, CONFIG.IDLE_CLEAR);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove  = (e: MouseEvent) => { recordPoint(e.clientX, e.clientY); resetIdleTimer(); };
    const handleTouchMove  = (e: TouchEvent) => { const t = e.touches[0]; if (t) { recordPoint(t.clientX, t.clientY); resetIdleTimer(); } };
    const handleStart      = () => { pathRef.current = []; triggeredRef.current = false; };

    window.addEventListener('mousemove',  handleMouseMove,  { passive: true });
    window.addEventListener('touchmove',  handleTouchMove,  { passive: true });
    window.addEventListener('mousedown',  handleStart);
    window.addEventListener('touchstart', handleStart,      { passive: true });

    const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('mousemove',  handleMouseMove);
      window.removeEventListener('touchmove',  handleTouchMove);
      window.removeEventListener('mousedown',  handleStart);
      window.removeEventListener('touchstart', handleStart);
      window.removeEventListener('resize',     resizeCanvas);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [recordPoint, resetIdleTimer]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}
