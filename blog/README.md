# Blog

Drop a Markdown file into this folder. After the site builds, it shows up at `/blog`.

## Add a post

1. Export from Notion as **Markdown & CSV**, or write a `.md` file yourself.
2. Drag the file into **`blog/`** (this folder). Drag any images next to it.
3. Add the frontmatter block at the top (below).
4. Name the file with lowercase words and hyphens. That name is the URL.

`blog/a-note-on-the-work.md` → `/blog/a-note-on-the-work`

Do not name a post `README.md`. This file is ignored.

## Frontmatter

```md
---
title: "The title that appears on the site"
date: 2026-08-16
description: "One line for the blog index."
cover: "./cover.jpg"
---
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Page heading and list title |
| `date` | yes | `YYYY-MM-DD`. Newest first |
| `description` | no | Preview on `/blog` |
| `cover` | no | Hero image. Local (`./file.jpg`) or full URL |
| `draft` | no | `true` hides the post |

Do not put an `# Title` heading in the body. The site already prints `title`.

## What works (Notion → this blog)

| In Notion | In the `.md` file |
| --- | --- |
| Photo / image | `![Caption under the photo](photo.jpg)` |
| Quote | `> The line you want to pull.` |
| Callout | `> [!NOTE]` then the text on the next line |
| Heading | `## Heading` / `### Heading` |
| Bold / italic / strike | `**bold**` `*italic*` `~~strike~~` |
| Bullet / numbered list | `- item` / `1. item` |
| To-do | `- [ ] not done` / `- [x] done` |
| Link | `[text](https://…)` |
| Divider | `---` |
| Table | Markdown table (Notion tables export) |
| Code | `` `inline` `` or fenced ` ``` ` blocks |
| Video file | `![Caption](clip.mp4)` next to the post |
| YouTube / Vimeo | Paste the URL on its own line |
| Bookmark / URL | Becomes a normal link |

Drop images (and video) **into this folder**, next to the `.md` file:

```md
![Late light on the desk](desk.jpg)
```

Or keep them in `public/blog/your-slug/` and link `/blog/your-slug/desk.jpg`.

Callout types: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `QUOTE`.

```md
> [!NOTE]
> A short aside. Use this for a Notion callout.
```

```md
> I like people more than I like sales.
```

```
https://www.youtube.com/watch?v=xxxxxxxxxxx
```

## What Notion does not export

These will not come through, or will flatten:

- Columns / side-by-side layout
- Toggles
- Databases
- Page comments
- Colored text and highlights
- Embeds that are not YouTube/Vimeo (Figma, Twitter, etc. become links)

Write those as a photo, a quote, or a link instead.

## Notion export shortcut

Unzip the export and run:

```bash
npm run notion -- ./path-to-unzipped-export
```

That adds frontmatter, copies images, and writes a `.md` file into this folder.

## Example

See `placeholder.md`.
