"use client";

import { create } from "zustand";

import type { PixelPetPreferences, PixelPetId, PixelPetPosition } from "@/lib/db/schemas/user";

type PetState = "walking" | "resting" | "dragging";

interface PixelPetStore {
  hydrated: boolean;
  prefs: PixelPetPreferences;
  /** Current visual position (may differ from prefs.position during animation) */
  currentPos: PixelPetPosition;
  /** Current pet state */
  petState: PetState;
  /** Direction pet is facing (-1 = left, 1 = right) */
  direction: number;
  /** Available animations from the loaded model */
  availableAnimations: string[];

  hydrate: (prefs: PixelPetPreferences) => void;
  setEnabled: (enabled: boolean) => void;
  setSelectedId: (selectedId: PixelPetId) => void;
  setSize: (size: number) => void;
  setPosition: (position: PixelPetPosition) => void;
  setCurrentPos: (pos: PixelPetPosition) => void;
  setPetState: (state: PetState) => void;
  setDirection: (dir: number) => void;
  setIdleAnimation: (animation: string | undefined) => void;
  setWalkAnimation: (animation: string | undefined) => void;
  setDefaultOrientation: (orientation: number) => void;
  setAvailableAnimations: (animations: string[]) => void;
}

const DEFAULT_PREFS: PixelPetPreferences = {
  schemaVersion: 1,
  enabled: false,
  selectedId: "dragon",
  surfaceId: "app-shell",
  edge: "bottom",
  progress: 0.5,
  offset: { x: 0, y: 0 },
  size: 1,
  position: { x: 100, y: 100 },
  idleAnimation: undefined,
  walkAnimation: undefined,
  defaultOrientation: 0,
};

export const usePixelPetStore = create<PixelPetStore>((set) => ({
  hydrated: false,
  prefs: DEFAULT_PREFS,
  currentPos: { x: 100, y: 100 },
  petState: "resting",
  direction: 1,
  availableAnimations: [],

  hydrate: (prefs) =>
    set(() => ({
      hydrated: true,
      prefs: { 
        ...DEFAULT_PREFS, 
        ...prefs, 
        offset: { ...DEFAULT_PREFS.offset, ...(prefs.offset ?? {}) },
        position: { ...DEFAULT_PREFS.position, ...(prefs.position ?? {}) },
      },
      currentPos: prefs.position ?? DEFAULT_PREFS.position,
    })),

  setEnabled: (enabled) =>
    set((s) => ({
      prefs: { ...s.prefs, enabled },
    })),

  setSelectedId: (selectedId) =>
    set((s) => ({
      prefs: { ...s.prefs, selectedId, idleAnimation: undefined, walkAnimation: undefined },
      availableAnimations: [], // Clear animations when pet changes
    })),

  setSize: (size) =>
    set((s) => ({
      prefs: { ...s.prefs, size },
    })),

  setPosition: (position) =>
    set((s) => ({
      prefs: { ...s.prefs, position },
    })),

  setCurrentPos: (currentPos) =>
    set(() => ({ currentPos })),

  setPetState: (petState) =>
    set(() => ({ petState })),

  setDirection: (direction) =>
    set(() => ({ direction })),

  setIdleAnimation: (idleAnimation) =>
    set((s) => ({
      prefs: { ...s.prefs, idleAnimation },
    })),

  setWalkAnimation: (walkAnimation) =>
    set((s) => ({
      prefs: { ...s.prefs, walkAnimation },
    })),

  setDefaultOrientation: (defaultOrientation) =>
    set((s) => ({
      prefs: { ...s.prefs, defaultOrientation },
    })),

  setAvailableAnimations: (availableAnimations) =>
    set(() => ({ availableAnimations })),
}));

