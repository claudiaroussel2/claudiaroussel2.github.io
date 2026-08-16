# Blog

Drop a Markdown file into this folder. After the site builds, it shows up at `/blog`.

## Add a post

1. Export from Notion as **Markdown & CSV**, or write a `.md` file yourself.
2. Drag the file into **`blog/`** (this folder).
3. Name it with lowercase words and hyphens. That name is the URL.

`blog/a-note-on-the-work.md` → `https://claudiaroussel2.github.io/blog/a-note-on-the-work`

Do not name a post `README.md`. This file is ignored.

## Format

Every post needs a block of frontmatter at the very top:

```md
---
title: "The title that appears on the site"
date: 2026-08-16
description: "One line for the blog index."
---

Write the post here. Normal Markdown: headings, lists, quotes, links, images.
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Shown as the page heading and in the list |
| `date` | yes | `YYYY-MM-DD`. Newest posts first |
| `description` | no | Short preview on `/blog` |
| `draft` | no | Set to `true` to hide the post |

If `title` is missing, the filename is used. If `date` is missing, the post still publishes but sorts last.

Do not put an `# Title` heading in the body. The site already prints `title`.

## Images

Put images in `public/blog/your-slug/` and link them like this:

```md
![A caption](/blog/your-slug/photo.jpg)
```

`your-slug` is the markdown filename without `.md`.

## Notion export

Notion’s Markdown is fine once you add the frontmatter block at the top.

Or unzip the export and run:

```bash
npm run notion -- ./path-to-unzipped-export
```

That writes a formatted `.md` file into this folder and copies images into `public/blog`.

## Example

See `placeholder.md` in this folder.
