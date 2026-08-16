import { cp, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MEDIA = /\.(png|jpe?g|gif|webp|svg|avif|mp4|webm|mov|m4v|mp3|wav)$/i;

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

async function copyBlogMedia(root) {
  const from = path.join(root, "blog");
  const to = path.join(root, "public/blog-media");
  try {
    await stat(from);
  } catch {
    return;
  }

  const files = (await walk(from)).filter((file) => MEDIA.test(file));
  for (const file of files) {
    const rel = path.relative(from, file);
    const dest = path.join(to, rel);
    await mkdir(path.dirname(dest), { recursive: true });
    await cp(file, dest);
  }
}

export function blogMedia() {
  return {
    name: "blog-media",
    hooks: {
      "astro:config:setup": async ({ command, config }) => {
        if (command === "dev" || command === "build") {
          await copyBlogMedia(fileURLToPath(config.root));
        }
      },
    },
  };
}

function walkMdast(node, fn) {
  fn(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walkMdast(child, fn);
  }
}

export function remarkLocalMedia() {
  return (tree, file) => {
    const source = file.history?.[0] || file.path || "";
    const blogRoot = path.resolve("blog");
    const from = path.relative(blogRoot, path.dirname(source));

    walkMdast(tree, (node) => {
      if (node.type !== "image" && node.type !== "link") return;
      if (!node.url || /^(https?:|mailto:|\/|#)/i.test(node.url)) return;
      const rel = path.posix
        .join(from.replaceAll("\\", "/"), node.url.replace(/^\.\//, ""))
        .replace(/^\.\//, "");
      node.url = `/blog-media/${rel}`.replace(/\/+/g, "/");
    });
  };
}

function youtubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v");
  } catch {
    return null;
  }
  return null;
}

function vimeoId(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("vimeo.com")) return null;
    const id = parsed.pathname.split("/").filter(Boolean).pop();
    return /^\d+$/.test(id || "") ? id : null;
  } catch {
    return null;
  }
}

function embedHtml(url) {
  const yt = youtubeId(url);
  if (yt) {
    return `<div class="embed"><iframe src="https://www.youtube.com/embed/${yt}" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  }
  const vimeo = vimeoId(url);
  if (vimeo) {
    return `<div class="embed"><iframe src="https://player.vimeo.com/video/${vimeo}" title="Video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  }
  return null;
}

export function remarkEmbeds() {
  return (tree) => {
    for (const [index, node] of tree.children.entries()) {
      if (node.type !== "paragraph" || !node.children?.length) continue;
      const child = node.children.find((c) => c.type !== "text" || c.value.trim());
      if (!child) continue;
      const url = child.type === "link" ? child.url : child.type === "text" ? child.value.trim() : null;
      if (!url) continue;
      const html = embedHtml(url);
      if (html) tree.children[index] = { type: "html", value: html };
    }
  };
}

function walkHast(node, parent, index, fn) {
  fn(node, parent, index);
  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      walkHast(node.children[i], node, i, fn);
    }
  }
}

function textOf(node) {
  if (node.type === "text") return node.value;
  if (!node.children) return "";
  return node.children.map(textOf).join("");
}

export function rehypeFigures() {
  return (tree) => {
    walkHast(tree, null, 0, (node, parent, index) => {
      if (node.tagName !== "img" || !parent) return;

      const src = String(node.properties?.src || "");
      if (/\.(mp4|webm|mov|m4v)$/i.test(src)) {
        parent.children[index] = {
          type: "element",
          tagName: "video",
          properties: { src, controls: true, playsinline: true },
          children: [],
        };
        return;
      }

      if (parent.tagName === "figure") return;

      const alt = String(node.properties?.alt || "");
      const title = String(node.properties?.title || "");
      const caption = title || alt;
      const figure = {
        type: "element",
        tagName: "figure",
        properties: {},
        children: [
          { ...node, properties: { ...node.properties, alt: alt || "" } },
          ...(caption
            ? [
                {
                  type: "element",
                  tagName: "figcaption",
                  properties: {},
                  children: [{ type: "text", value: caption }],
                },
              ]
            : []),
        ],
      };

      if (parent.tagName === "p") {
        const meaningful = parent.children.filter(
          (child) => !(child.type === "text" && !String(child.value).trim())
        );
        if (meaningful.length === 1 && parent.children[index] === node) {
          Object.assign(parent, figure);
          return;
        }
      }

      parent.children[index] = figure;
    });
  };
}

const CALLOUTS = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  quote: "Quote",
};

export function rehypeCallouts() {
  return (tree) => {
    walkHast(tree, null, 0, (node) => {
      if (node.tagName !== "blockquote" || !node.children?.length) return;
      const first = node.children.find((child) => child.tagName === "p");
      if (!first) return;
      const raw = textOf(first).trim();
      const match = raw.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|QUOTE)\]\s*([\s\S]*)/i);
      if (!match) return;

      const kind = match[1].toLowerCase();
      const leftover = match[2].trim();
      node.tagName = "aside";
      node.properties = { className: ["callout", `callout-${kind}`] };
      node.children.unshift({
        type: "element",
        tagName: "p",
        properties: { className: ["callout-label"] },
        children: [{ type: "text", value: CALLOUTS[kind] }],
      });
      if (leftover) {
        first.children = [{ type: "text", value: leftover }];
      } else {
        node.children = node.children.filter((child) => child !== first);
      }
    });
  };
}
