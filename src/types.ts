export const IconStyle = {
  REGULAR: "regular",
  THIN: "thin",
  LIGHT: "light",
  BOLD: "bold",
  FILL: "fill",
  DUOTONE: "duotone",
} as const;

export const IconCategory = {
  ARROWS: "arrows",
  BRAND: "brands",
  COMMERCE: "commerce",
  COMMUNICATION: "communications",
  DESIGN: "design",
  DEVELOPMENT: "technology & development",
  EDITOR: "editor",
  FINANCE: "finances",
  GAMES: "games",
  HEALTH: "health & wellness",
  MAP: "maps & travel",
  MEDIA: "media",
  NATURE: "nature",
  OBJECTS: "objects",
  OFFICE: "office",
  PEOPLE: "people",
  SYSTEM: "system",
  WEATHER: "weather",
} as const;

export const FigmaCategory = {
  ARROWS: "arrows",
  BRAND: "brands",
  COMMERCE: "commerce",
  COMMUNICATION: "communication",
  DESIGN: "design",
  DEVELOPMENT: "technology & development",
  EDUCATION: "education",
  FINANCE: "math & finance",
  GAMES: "games",
  HEALTH: "health & wellness",
  MAP: "maps & travel",
  MEDIA: "media",
  OFFICE: "office & editing",
  PEOPLE: "people",
  SECURITY: "security & warnings",
  SYSTEM: "system & devices",
  TIME: "time",
  WEATHER: "weather & nature",
} as const;

export type IconStyle = (typeof IconStyle)[keyof typeof IconStyle];
export type IconCategory = (typeof IconCategory)[keyof typeof IconCategory];
export type FigmaCategory = (typeof FigmaCategory)[keyof typeof FigmaCategory];

export interface IconEntry {
  name: string;
  pascal_name: string;
  alias?: {
    name: string;
    pascal_name: string;
  };
  categories: readonly IconCategory[];
  figma_category: FigmaCategory;
  tags: readonly string[];
  codepoint: number;
  published_in: number;
  updated_in: number;
}
