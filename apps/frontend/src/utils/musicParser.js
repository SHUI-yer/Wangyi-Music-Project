/**
 * Robustly parses music filenames to extract Artist and Title.
 * Handles common patterns like "Artist - Title", "Title - Artist", 
 * or complex tags like "[Prefix] Title --- Artist".
 */
export function parseMusicFileName(filename) {
  // Remove extension
  let cleanName = filename.replace(/\.[^/.]+$/, "");
  
  // Pattern 1: "Artist - Title" or "Title - Artist" (most common)
  if (cleanName.includes(" - ")) {
    const parts = cleanName.split(" - ");
    if (parts.length >= 2) {
      let artist = parts[0].trim();
      let title = parts[1].trim();

      // Heuristic: If the second part has brackets like 《》, it's likely the title.
      // If the first part has 《》, swap them.
      if (artist.includes("《") && artist.includes("》") && !title.includes("《")) {
        [artist, title] = [title, artist];
      }

      return { title, artist };
    }
  }

  // Pattern 2: "Title --- Artist" or "Artist --- Title"
  if (cleanName.includes("---")) {
    const parts = cleanName.split("---");
    let artist = parts[1].trim();
    let title = parts[0].trim();

    if (artist.includes("《") && artist.includes("》") && !title.includes("《")) {
      [artist, title] = [title, artist];
    }

    return { title, artist };
  }

  // Pattern 3: "Artist_Title" or "Title_Artist"
  if (cleanName.includes("_") && !cleanName.includes(" ")) {
    const parts = cleanName.split("_");
    if (parts.length >= 2) {
      return {
        title: parts[1].trim(),
        artist: parts[0].trim()
      };
    }
  }

  // Fallback: Just return the filename as title and "Unknown Artist"
  return {
    title: cleanName,
    artist: "未知歌手"
  };
}
