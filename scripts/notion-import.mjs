#!/usr/bin/env node
/**
 * Turn a Notion Markdown export into blog posts.
 *
 * Usage:
 *   npm run notion -- ./Downloads/Export-xxxxxxxx
 *
 * 1. In Notion: ••• → Export → Markdown & CSV → include subpages if needed
 * 2. Unzip the export
 * 3. Run this script on the unzipped folder
 */

import { mkdir, readdir, readFile, writeFile, copyFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2];

if (!source) {
  console.error("Usage: npm run notion -- ./path-to-unzipped-notion-export");
  process.exit(1);
}

const exportDir = path.resolve(source);

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "untitled";
}

function yamlEscape(value) {
  return `"${value.replace(/"/g, '\\"')}"`;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function stripNotionId(name) {
  return name.replace(/\s+[0-9a-f]{32}$/i, "");
}

function extractTitle(markdown, filename) {
  const heading = markdown.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  return stripNotionId(path.basename(filename, ".md"));
}

function stripFirstHeading(markdown) {
  return markdown.replace(/^#\s+.+\n+/, "");
}

function rewriteImages(markdown, slug) {
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    if (/^https?:\/\//i.test(url)) return `![${alt}](${url})`;
    const decoded = decodeURIComponent(url.split("?")[0]);
    const filename = path.basename(decoded);
    return `![${alt}](/blog/${slug}/${filename})`;
  });
}

const files = await walk(exportDir);
const markdownFiles = files.filter((file) => file.endsWith(".md"));

if (markdownFiles.length === 0) {
  console.error("No markdown files found in", exportDir);
  process.exit(1);
}

await mkdir(path.join(root, "blog"), { recursive: true });

for (const file of markdownFiles) {
  const raw = await readFile(file, "utf8");
  const title = extractTitle(raw, file);
  const slug = slugify(title);
  if (slug === "readme") continue;
  const date = (await stat(file)).mtime.toISOString().slice(0, 10);
  const body = rewriteImages(stripFirstHeading(raw).trim(), slug);
  const out = `---\ntitle: ${yamlEscape(title)}\ndate: ${date}\ndescription: ""\n---\n\n${body}\n`;

  await writeFile(path.join(root, "blog", `${slug}.md`), out);

  const imageDir = path.join(root, "public/blog", slug);
  const sourceDir = path.dirname(file);
  const siblings = await readdir(sourceDir);
  const images = siblings.filter((name) =>
    /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name)
  );

  if (images.length) {
    await mkdir(imageDir, { recursive: true });
    for (const image of images) {
      await copyFile(path.join(sourceDir, image), path.join(imageDir, image));
    }
  }

  console.log(`Wrote blog/${slug}.md`);
}
