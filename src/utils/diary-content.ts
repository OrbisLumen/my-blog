import { getCollection, type CollectionEntry } from "astro:content";
import type { MarkdownDiaryItem } from "../types/diary";

type DiaryEntry = CollectionEntry<"diary">;

function mapDiaryEntry(entry: DiaryEntry): MarkdownDiaryItem {
	return {
		id: entry.data.id,
		content: entry.data.content,
		date: entry.data.date,
		images: entry.data.images ?? [],
		location: entry.data.location,
		mood: entry.data.mood,
		tags: entry.data.tags ?? [],
	};
}

export async function getMarkdownDiaryList() {
	const entries = await getCollection("diary");
	return entries
		.map(mapDiaryEntry)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getMarkdownDiaryTags() {
	const entries = await getCollection("diary");
	const tagSet = new Set<string>();

	for (const entry of entries) {
		for (const tag of entry.data.tags ?? []) {
			tagSet.add(tag);
		}
	}

	return Array.from(tagSet).sort();
}