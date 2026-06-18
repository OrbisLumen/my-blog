# Diary Function Change Log

## Purpose

The diary feature was changed from a manually maintained TypeScript array to Markdown-driven content. Diary entries and their images can now be maintained under `src/content/diary/` without editing the page component for every new entry.

This log covers only the diary function changes. Personalized site configuration and blog post updates are intentionally excluded.

## Files involved

### Added

- `src/types/diary.ts`
- `src/utils/diary-content.ts`
- `src/content/diary/**`

### Modified

- `src/content.config.ts`
- `src/pages/diary.astro`
- `src/components/features/diary/MomentCard.astro`

The old `src/data/diary.ts` data source is no longer used by the diary page.

## Data flow

```text
src/content/diary/**/*.md
        |
        v
src/utils/diary-content.ts
  - imports Markdown as raw text
  - parses diary blocks
  - resolves local images
  - validates required fields
  - sorts entries and collects tags
        |
        v
src/pages/diary.astro
  - loads entries and tags
  - builds tag filters
        |
        v
src/components/features/diary/MomentCard.astro
  - renders content, images, tags, time, location, and mood
```

## Markdown format

A Markdown file may contain multiple diary entries. Each entry is stored in its own `---` block:

```markdown
---
id: 1
content: "Finally finishing my first blog"
date: "2026-04-11T17:21:00Z"
images:
  - ./1/sakura.jpg
  - ./1/1.webp
location: "Chengdu, Sichuan"
mood: "Excited"
tags:
  - Blog
  - OrbisLumen
  - FE
---
---
id: 2
content: "Another diary entry"
date: "2026-04-12T13:14:00Z"
tags: [Life]
---
```

Supported fields:

| Field | Required | Type | Purpose |
| --- | --- | --- | --- |
| `id` | Yes | number | Unique diary identifier |
| `content` | Yes | string | Diary text |
| `date` | Yes | string | Timestamp used for display and sorting |
| `images` | No | string array | Local, public, or remote image paths |
| `location` | No | string | Displayed location |
| `mood` | No | string | Displayed mood |
| `tags` | No | string array | Filtering and labels |

An entry missing a numeric `id`, string `content`, or string `date` is ignored by the loader.

## Loader and parser

`src/utils/diary-content.ts` eagerly imports every `src/content/diary/**/*.md` file as raw text. Its custom parser:

1. Finds every block enclosed by `---` markers.
2. Reads scalar values, quoted strings, inline arrays, and indented list arrays.
3. Adds the source Markdown path internally so relative image paths can be resolved.
4. Normalizes parsed values into `MarkdownDiaryItem` objects.
5. Drops invalid entries that do not contain the required fields.

`getMarkdownDiaryList()` returns entries sorted by `date` from newest to oldest.

`getMarkdownDiaryTags()` combines all entry tags, removes duplicates with a `Set`, and returns them alphabetically.

## Image handling

Diary images support three path styles:

- Relative paths such as `./1/photo.webp` are resolved from the Markdown file's directory.
- Root-relative paths such as `/images/diary/photo.webp` are returned unchanged.
- `http://` and `https://` URLs are returned unchanged.

Local images are eagerly imported through Astro as `ImageMetadata`. `MomentCard.astro` accepts either a URL string or `ImageMetadata` and converts both to a renderable image source. The same resolved source is used by the image element and Fancybox preview.

Supported local extensions are `png`, `jpg`, `jpeg`, `webp`, `gif`, and `avif`.

## Page integration

`src/pages/diary.astro` now calls `getMarkdownDiaryList()` and `getMarkdownDiaryTags()` instead of reading from `src/data/diary.ts`.

The existing diary interface remains in place:

- Entries are displayed newest first.
- Tags populate the filter tabs and entry counts.
- Existing relative-time formatting is preserved.
- Images, location, mood, and tags continue to render through `MomentCard.astro`.

## Content collection definition

`src/content.config.ts` defines a `diary` collection with the same required and optional fields. The current diary page does not query this collection directly; its runtime data comes from the custom raw Markdown loader in `src/utils/diary-content.ts`.

## Maintenance rules

- Diary Markdown may be organized in any subdirectory below `src/content/diary/`.
- Multiple entries may be kept in one file, such as one file per year.
- Keep each `id` unique even though sorting uses `date` rather than `id`.
- Keep local images near the Markdown file and reference them with relative paths.
- Use ISO-style timestamps so chronological sorting remains reliable.
- The custom parser supports the documented simple field format; it is not a complete YAML parser.

## Result

The diary page is now content-driven and can be updated by editing Markdown and adding nearby image files. The visual diary experience remains largely unchanged, while diary maintenance is separated from the original TypeScript data file.