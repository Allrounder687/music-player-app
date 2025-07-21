import React, { useEffect, useRef, useState } from "react";
import { useMusic } from "../store/MusicContext";

/**
 * A component that visualizes audio beats and frequencies
 */
export const BeatVisualizer = ({ className = "" }) => {
  const { audioData, isPlaying } = useMusic();
  const canvasRef = useRef(null);
  const [visualizerMode, setVisualizerMode] = useState("bars"); // 'bars', 'wave', 'circle'

  // Animation settings
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const lastBeatTimeRef = useRef(0);

  // Initialize particles for beat visualization
  useEffect(() => {
    // Create initial particles
    particlesRef.current = Array(30)
      .fill()
      .map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 5 + 2,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        color: `hsl(${Math.random() * 360}, 80%, 60%)`,
        alpha: Math.random() * 0.5 + 0.2,
      }));

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Draw visualizer based on audio data
  useEffect(() => {
    if (!canvasRef.current || !isPlaying || !audioData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    // Initial resize
    resizeCanvas();

    // Handle window resize
    window.addEventListener("resize", resizeCanvas);

    // Animation function
    const animate = () => {
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check if we have audio data
      if (
        !audioData ||
        !audioData.frequencyData ||
        !audioData.frequencyData.length
      ) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Handle beat detection
      const now = Date.now();
      if (audioData.beatDetected && now - lastBeatTimeRef.current > 100) {
        lastBeatTimeRef.current = now;

        // Add new particles on beat
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push({
            x: canvas.width / 2 + (Math.random() * 100 - 50),
            y: canvas.height / 2 + (Math.random() * 100 - 50),
            size: Math.random() * 8 + 5,
            speedX: (Math.random() * 2 - 1) * 3,
            speedY: (Math.random() * 2 - 1) * 3,
            color: `hsl(${Math.random() * 60 + 240}, 80%, 60%)`,
            alpha: 0.8,
          });
        }
      }

      // Draw based on selected mode
      switch (visualizerMode) {
        case "bars":
          drawFrequencyBars(ctx, canvas, audioData);
          break;
        case "wave":
          drawWaveform(ctx, canvas, audioData);
          break;
        case "circle":
          drawCircleVisualizer(ctx, canvas, audioData);
          break;
        default:
          drawFrequencyBars(ctx, canvas, audioData);
      }

      // Update and draw particles
      updateParticles(ctx, canvas);

      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, isPlaying, visualizerMode]);

  // Draw frequency bars visualization
  const drawFrequencyBars = (ctx, canvas, audioData) => {
    const { frequencyData } = audioData;
    const barWidth = canvas.width / Math.min(64, frequencyData.length);
    const barSpacing = 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    for (let i = 0; i < Math.min(64, frequencyData.length); i++) {
      const value = frequencyData[i] / 255;
      const barHeight = value * canvas.height * 0.8;

      // Calculate hue based on frequency (blue for bass, purple for mid, pink for high)
      const hue = 240 - (i / 64) * 60;

      // Draw bar with gradient
      const gradient = ctx.createLinearGradient(
        0,
        canvas.height,
        0,
        canvas.height - barHeight
      );
      gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.8)`);
      gradient.addColorStop(1, `hsla(${hue + 30}, 90%, 70%, 0.4)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(
        i * (barWidth + barSpacing),
        canvas.height - barHeight,
        barWidth,
        barHeight
      );
    }
  };

  // Draw waveform visualization
  const drawWaveform = (ctx, canvas, audioData) => {
    const { timeData } = audioData;

    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${(Date.now() / 50) % 360}, 80%, 60%, 0.8)`;
    ctx.beginPath();

    const sliceWidth = canvas.width / timeData.length;
    let x = 0;

    for (let i = 0; i < timeData.length; i++) {
      const v = timeData[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  // Draw circle visualizer
  const drawCircleVisualizer = (ctx, canvas, audioData) => {
    const { frequencyData, bass, mid, treble } = audioData;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bass circle
    const bassRadius = 50 + bass * 100;
    ctx.beginPath();
    ctx.arc(centerX, centerY, bassRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(65, 105, 225, ${bass * 0.5})`;
    ctx.fill();

    // Draw mid circle
    const midRadius = 40 + mid * 80;
    ctx.beginPath();
    ctx.arc(centerX, centerY, midRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(147, 112, 219, ${mid * 0.5})`;
    ctx.fill();

    // Draw treble circle
    const trebleRadius = 30 + treble * 60;
    ctx.beginPath();
    ctx.arc(centerX, centerY, trebleRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 105, 180, ${treble * 0.5})`;
    ctx.fill();

    // Draw frequency dots around the circle
    const numDots = Math.min(32, frequencyData.length);
    for (let i = 0; i < numDots; i++) {
      const value = frequencyData[i] / 255;
      const angle = (i / numDots) * Math.PI * 2;
      const radius = 100 + value * 100;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const dotSize = 3 + value * 8;

      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(i / numDots) * 360}, 80%, 60%, ${value * 0.8})`;
      ctx.fill();
    }
  };

  // Update and draw particles
  const updateParticles = (ctx, canvas) => {
    // Update particles
    particlesRef.current = particlesRef.current.filter((particle) => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Reduce alpha
      particle.alpha -= 0.01;

      // Remove particles that are off-screen or faded out
      return (
        particle.x > 0 &&
        particle.x < canvas.width &&
        particle.y > 0 &&
        particle.y < canvas.height &&
        particle.alpha > 0
      );
    });

    // Draw particles
    particlesRef.current.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color.replace(")", `, ${particle.alpha})`);
      ctx.fill();
    });
  };

  // Toggle visualizer mode
  const toggleVisualizerMode = () => {
    const modes = ["bars", "wave", "circle"];
    const currentIndex = modes.indexOf(visualizerMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setVisualizerMode(modes[nextIndex]);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onClick={toggleVisualizerMode}
      />
      <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
        Click to change visualization
      </div>
    </div>
  );
};
