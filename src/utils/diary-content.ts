import type { ImageMetadata } from "astro";
import type { MarkdownDiaryItem } from "../types/diary";

type RawDiaryItem = {
  id?: number;
  content?: string;
  date?: string;
  images?: string[];
  location?: string;
  mood?: string;
  tags?: string[];

  /**
   * Internal field.
   * Used to resolve image paths relative to the md file.
   */
  _sourcePath?: string;
};

const diarySources = import.meta.glob<string>("../content/diary/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  "../content/**/*.{png,jpg,jpeg,webp,gif,avif}",
  {
    eager: true,
  },
);

function normalizeImportPath(path: string) {
  const parts: string[] = [];

  for (const part of path.split("/")) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      if (parts.length > 0 && parts[parts.length - 1] !== "..") {
        parts.pop();
      } else {
        parts.push(part);
      }
      continue;
    }

    parts.push(part);
  }

  return parts.join("/");
}

function getDirname(path: string) {
  return path.slice(0, path.lastIndexOf("/"));
}

function parseScalar(value: string): string | number | string[] {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        if (
          (item.startsWith('"') && item.endsWith('"')) ||
          (item.startsWith("'") && item.endsWith("'"))
        ) {
          return item.slice(1, -1);
        }

        return item;
      });
  }

  const numberValue = Number(trimmed);

  if (!Number.isNaN(numberValue) && trimmed !== "") {
    return numberValue;
  }

  return trimmed;
}

function parseDiaryBlock(block: string, sourcePath: string): RawDiaryItem {
  const item: Record<string, unknown> = {
    _sourcePath: sourcePath,
  };

  let currentArrayKey: string | null = null;

  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const arrayMatch = line.match(/^\s*-\s+(.*)$/);

    if (arrayMatch && currentArrayKey) {
      const arr = (item[currentArrayKey] ?? []) as unknown[];
      arr.push(parseScalar(arrayMatch[1]));
      item[currentArrayKey] = arr;
      continue;
    }

    const keyValueMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

    if (!keyValueMatch) {
      continue;
    }

    const [, key, value] = keyValueMatch;
    currentArrayKey = null;

    if (value.trim() === "") {
      item[key] = [];
      currentArrayKey = key;
    } else {
      item[key] = parseScalar(value);
    }
  }

  return item as RawDiaryItem;
}

function parseDiaryMarkdown(source: string, sourcePath: string): RawDiaryItem[] {
  const blocks: RawDiaryItem[] = [];

  const blockRegex = /(?:^|\r?\n)---\s*\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/g;

  for (const match of source.matchAll(blockRegex)) {
    blocks.push(parseDiaryBlock(match[1], sourcePath));
  }

  return blocks;
}

function resolveImage(image: string, sourcePath?: string): string | ImageMetadata {
  if (
    image.startsWith("/") ||
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (!sourcePath) {
    return image;
  }

  const sourceDir = getDirname(sourcePath);
  const candidate = normalizeImportPath(`${sourceDir}/${image}`);

  const mod = imageModules[candidate];

  if (mod) {
    return mod.default;
  }

  return image;
}

function normalizeDiaryItem(item: RawDiaryItem): MarkdownDiaryItem | null {
  if (
    typeof item.id !== "number" ||
    typeof item.content !== "string" ||
    typeof item.date !== "string"
  ) {
    return null;
  }

  return {
    id: item.id,
    content: item.content,
    date: item.date,
    images: (item.images ?? []).map((image) =>
      resolveImage(image, item._sourcePath),
    ),
    location: item.location,
    mood: item.mood,
    tags: item.tags ?? [],
  };
}

async function readDiaryItems(): Promise<MarkdownDiaryItem[]> {
  return Object.entries(diarySources)
    .flatMap(([sourcePath, source]) => parseDiaryMarkdown(source, sourcePath))
    .map(normalizeDiaryItem)
    .filter((item): item is MarkdownDiaryItem => item !== null);
}

export async function getMarkdownDiaryList() {
  const items = await readDiaryItems();

  return items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function getMarkdownDiaryTags() {
  const items = await readDiaryItems();
  const tagSet = new Set<string>();

  for (const item of items) {
    for (const tag of item.tags ?? []) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}