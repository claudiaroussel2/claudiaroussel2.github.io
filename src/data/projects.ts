export type Project = {
  slug: string;
  name: string;
  width: number;
  height: number;
  color: string;
};

/** Replace each `/images/projects/{slug}.jpg` with a real photograph. */
export const projects: Project[] = [
  { slug: "superpower", name: "Superpower", width: 268, height: 410, color: "#e45a2b" },
  { slug: "rippling", name: "Rippling", width: 248, height: 268, color: "#c9bfb2" },
  { slug: "mercu", name: "Mercu", width: 252, height: 456, color: "#d8d2c4" },
  { slug: "flagship", name: "Flagship", width: 340, height: 292, color: "#6b8cce" },
  { slug: "refundid", name: "Refundid", width: 236, height: 360, color: "#1f3a5f" },
];
