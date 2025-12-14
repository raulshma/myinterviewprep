import type { PixelPetId } from "@/lib/db/schemas/user";

export interface PixelPetAttribution {
  author: string;
  authorUrl: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
}

export interface PixelPetDefinition {
  id: PixelPetId;
  label: string;
  /** GLB filename inside /3dmodels (served via /api/pixel-pets/[model]) */
  fileName: string;
  kind: "pet" | "object";
  /** Default scene scale tweak per model */
  modelScale: number;
  /** Whether this model has animations that should be played */
  hasAnimations?: boolean;
  /** Attribution information for the 3D model */
  attribution: PixelPetAttribution;
}

export const PIXEL_PET_REGISTRY: PixelPetDefinition[] = [
  {
    id: "angler",
    label: "Angler",
    fileName: "angler.glb",
    kind: "pet",
    modelScale: 1,
    hasAnimations: true,
    attribution: {
      author: "NZFawkes",
      authorUrl: "https://sketchfab.com/NZFawkes",
      sourceUrl: "https://sketchfab.com/3d-models/angler-a8c1d899f1694143b2d3aa69210618c1",
      license: "CC Attribution",
      licenseUrl: "http://creativecommons.org/licenses/by/4.0/",
    },
  },
  {
    id: "dragon",
    label: "Dragon",
    fileName: "dragon.glb",
    kind: "pet",
    modelScale: 1,
    hasAnimations: true,
    attribution: {
      author: "_Mc_CMETAHKA",
      authorUrl: "https://sketchfab.com/mccmetahka",
      sourceUrl: "https://sketchfab.com/3d-models/dragonvimeworldmodel-242c4e939bfd4c8b91143594328bb532",
      license: "CC Attribution",
      licenseUrl: "http://creativecommons.org/licenses/by/4.0/",
    },
  },
  {
    id: "giratina_origin_form",
    label: "Giratina Origin",
    fileName: "giratina_origin_form.glb",
    kind: "pet",
    modelScale: 1,
    hasAnimations: true,
    attribution: {
      author: "Master Galanodel",
      authorUrl: "https://sketchfab.com/Master_Galanodel",
      sourceUrl: "https://sketchfab.com/3d-models/giratina-origin-form-14de1454d36642328b6a9a779128cae2",
      license: "CC Attribution",
      licenseUrl: "http://creativecommons.org/licenses/by/4.0/",
    },
  },
  {
    id: "leathern_drake",
    label: "Leathern Drake",
    fileName: "leathern_drake.glb",
    kind: "pet",
    modelScale: 1,
    hasAnimations: true,
    attribution: {
      author: "Breathfang (Drageon DB)",
      authorUrl: "https://sketchfab.com/drageondb",
      sourceUrl: "https://sketchfab.com/3d-models/leathern-drake-blockbench-021865367838492a9839c64c6f3cb984",
      license: "CC Attribution",
      licenseUrl: "http://creativecommons.org/licenses/by/4.0/",
    },
  },
  {
    id: "mob_test",
    label: "Mob",
    fileName: "mob_test.glb",
    kind: "pet",
    modelScale: 1,
    hasAnimations: true,
    attribution: {
      author: "Staralighto",
      authorUrl: "https://sketchfab.com/jutan2004",
      sourceUrl: "https://sketchfab.com/3d-models/mob-test-6048a4ee531d497eb235e8d526743514",
      license: "CC Attribution",
      licenseUrl: "http://creativecommons.org/licenses/by/4.0/",
    },
  },
  {
    id: "yveltal_bedrock",
    label: "Yveltal",
    fileName: "yveltal_bedrock.glb",
    kind: "pet",
    modelScale: 1,
    hasAnimations: true,
    attribution: {
      author: "Master Galanodel",
      authorUrl: "https://sketchfab.com/Master_Galanodel",
      sourceUrl: "https://sketchfab.com/3d-models/yveltal-bedrock-entity-747c9c19d42d40f58e4235fda0c2370e",
      license: "CC Attribution",
      licenseUrl: "http://creativecommons.org/licenses/by/4.0/",
    },
  },
];

export function getPixelPetDefinition(id: PixelPetId): PixelPetDefinition {
  const def = PIXEL_PET_REGISTRY.find((p) => p.id === id);
  if (!def) {
    // Keep runtime resilient in case DB contains an older/unknown id
    return PIXEL_PET_REGISTRY[0];
  }
  return def;
}
