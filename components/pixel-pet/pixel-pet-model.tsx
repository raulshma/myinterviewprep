"use client";

import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { useGLTF, Html, useProgress, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Box3, Vector3, Group } from "three";

interface PixelPetModelProps {
  fileName: string;
  modelScale: number;
  hasAnimations?: boolean;
  idleAnimation?: string;      // Animation for resting state
  walkAnimation?: string;      // Animation for walking state
  isWalking?: boolean;         // Current movement state
  onAnimationsLoaded?: (animations: string[]) => void;
}

class ModelErrorBoundary extends React.Component<
  {
    fallback?: React.ReactNode;
    onError?: (error: unknown) => void;
    children: React.ReactNode;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

function LoadingIndicator() {
  const { progress, active } = useProgress();

  // Don't render if not actively loading
  if (!active && progress === 100) return null;

  return (
    <Html center>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          minWidth: "60px",
        }}
      >
        {/* Spinner */}
        <div
          style={{
            width: "24px",
            height: "24px",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            borderTopColor: "#a78bfa",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        {/* Progress percentage */}
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#a78bfa",
            fontFamily: "system-ui, sans-serif",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          {Math.round(progress)}%
        </div>
        {/* Inject keyframes for spinner animation */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Html>
  );
}

function LoadedModel({ 
  fileName, 
  modelScale, 
  hasAnimations = false,
  idleAnimation,
  walkAnimation,
  isWalking = false,
  onAnimationsLoaded,
}: PixelPetModelProps) {
  const url = `/api/pixel-pets/${fileName}`;
  const groupRef = useRef<Group>(null);
  const currentAnimationRef = useRef<string | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationsReportedRef = useRef(false);
  
  const gltf = useGLTF(url);
  const { actions, names, mixer } = useAnimations(gltf.animations, groupRef);

  // Clone the scene to prevent mutation issues
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  // Calculate fit parameters to center and scale the model
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    const center = new Vector3();

    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x || 0, size.y || 0, size.z || 0);
    const autoScale = maxDim > 0 ? 1 / maxDim : 1;

    return {
      // Apply caller tuning after auto-fitting, then apply modelScale
      scale: autoScale * (modelScale || 1),
      // Center the model at the origin before scaling
      offset: new Vector3(-center.x, -center.y, -center.z),
    };
  }, [scene, modelScale]);

  // Report available animations to parent
  useEffect(() => {
    if (onAnimationsLoaded && names.length > 0 && !animationsReportedRef.current) {
      animationsReportedRef.current = true;
      onAnimationsLoaded(names);
    }
  }, [names, onAnimationsLoaded]);

  // Animation state management - switch between idle and walk animations
  useEffect(() => {
    if (!hasAnimations || names.length === 0) return;

    const playAnimation = (animationName: string) => {
      // Stop current animation if playing
      if (currentAnimationRef.current && actions[currentAnimationRef.current]) {
        actions[currentAnimationRef.current]?.fadeOut(0.3);
      }

      currentAnimationRef.current = animationName;

      const action = actions[animationName];
      if (action) {
        action.reset().fadeIn(0.3).play();
      }
    };

    // Determine which animation to play based on isWalking state
    const targetAnimation = isWalking ? walkAnimation : idleAnimation;
    
    if (targetAnimation && names.includes(targetAnimation)) {
      // Play the specified animation
      playAnimation(targetAnimation);
    } else {
      // Fallback: play a random animation from available ones
      const randomIndex = Math.floor(Math.random() * names.length);
      playAnimation(names[randomIndex]);
    }

    return () => {
      // Cleanup animation timeout if any
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [hasAnimations, names, actions, isWalking, idleAnimation, walkAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      // Stop all animations on unmount
      Object.values(actions).forEach((action) => action?.stop());
    };
  }, [actions]);

  // Update animation mixer each frame
  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
  });

  return (
    <group ref={groupRef} scale={fit.scale}>
      <primitive 
        object={scene} 
        position={[fit.offset.x, fit.offset.y, fit.offset.z]} 
      />
    </group>
  );
}

export function PixelPetModel(props: PixelPetModelProps) {
  const url = `/api/pixel-pets/${props.fileName}`;

  // Warm the cache so the first render is less likely to "pop".
  useEffect(() => {
    try {
      useGLTF.preload(url);
    } catch {
      // ignore (preload is best-effort)
    }
  }, [url]);

  return (
    <ModelErrorBoundary
      onError={(error) => {
        console.error("PixelPetModel: failed to load GLB", {
          url,
          fileName: props.fileName,
          error,
        });
      }}
      fallback={
        <mesh>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#ff4d4f" />
        </mesh>
      }
    >
      <Suspense fallback={<LoadingIndicator />}>
        <LoadedModel {...props} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
