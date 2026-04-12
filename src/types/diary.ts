import type { ImageMetadata } from "astro";

export interface MarkdownDiaryItem {
	id: number;
	content: string;
	date: string;
	images?: (string | ImageMetadata)[];
	location?: string;
	mood?: string;
	tags?: string[];
}