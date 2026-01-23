'use client';

import { useCallback, useEffect, useRef } from 'react';

interface PlaceholderGeneratorProps {
  width?: number;
  height?: number;
  circleCount?: number;
  spread?: number;
  minSize?: number;
  maxSize?: number;
  seed?: number;
  className?: string;
}

export default function ImagePlaceholder({
  width = 1024,
  height = 720,
  circleCount = 6,
  spread = 200,
  minSize = 100,
  maxSize = 400,
  seed = Math.floor(Math.random() * 1000000),
  className = '',
}: PlaceholderGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);

  // Hole Farben aus CSS-Variablen
  const getColor = (cssVar: string): string => {
    if (typeof window === 'undefined') return '#000000';
    const hsl = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim();
    return hsl ? `hsl(${hsl})` : '#000000';
  };

  const drawCircle = (
    ctx: CanvasRenderingContext2D,
    tempCtx: CanvasRenderingContext2D,
    tempCanvas: HTMLCanvasElement,
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    radius: number,
    color: string,
  ) => {
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.globalCompositeOperation = 'source-over';
    tempCtx.fillStyle = 'black';
    tempCtx.beginPath();
    tempCtx.arc(x, y, radius, 0, Math.PI * 2);
    tempCtx.fill();

    tempCtx.globalCompositeOperation = 'source-in';
    tempCtx.drawImage(canvas, 0, 0);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(tempCanvas, 0, 0);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    if (!canvas || !tempCanvas) return;

    const ctx = canvas.getContext('2d');
    const tempCtx = tempCanvas.getContext('2d');
    if (!ctx || !tempCtx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let lcgState = seed;

    const seededRandom = () => {
      lcgState = (lcgState * 1664525 + 1013904223) % 4294967296;
      return lcgState / 4294967296;
    };

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const referenceDim = Math.min(canvas.width, canvas.height);
    const maxDistance = (spread / 100) * (referenceDim / 2);

    // Feste Farben aus CSS-Variablen: Gelb, Lila, Koralle
    const colors = [
      getColor('--brand-yellow'),
      getColor('--brand-purple'),
      getColor('--brand-coral'),
    ];

    for (let i = 0; i < circleCount; i++) {
      const color = colors[i % colors.length];
      const angle = seededRandom() * Math.PI * 2;
      const r = seededRandom() * maxDistance;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      const radius = minSize + seededRandom() * (maxSize - minSize);

      drawCircle(ctx, tempCtx, tempCanvas, canvas, x, y, radius, color);
    }
  }, [circleCount, spread, minSize, maxSize, seed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    if (!canvas || !tempCanvas) return;

    canvas.width = width;
    canvas.height = height;
    tempCanvas.width = width;
    tempCanvas.height = height;

    draw();
  }, [width, height, circleCount, spread, minSize, maxSize, seed, draw]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={className}
        style={{ backgroundColor: 'hsl(var(--brand-darkblue))' }}
      />
      <canvas ref={tempCanvasRef} style={{ display: 'none' }} />
    </>
  );
}
