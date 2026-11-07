// Array of slang/profanity to censor (Expand this list for your production needs)
const RESTRICTED_WORDS = [
  "slangword1", "slangword2", "badword", "profanity"
];

/**
 * Replaces restricted words with asterisks while preserving case length.
 */
export function censorText(text: string): string {
  if (!text) return text;
  let sanitized = text;
  RESTRICTED_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, (match) => '*'.repeat(match.length));
  });
  return sanitized;
}

/**
 * Scaffold for Explicit Media Content Scanner (Images/Videos).
 * In production, wire this to AWS Rekognition, Google Cloud Vision, or Vercel Blob checks.
 */
export async function scanMediaContent(fileUrl: string, fileType: string): Promise<boolean> {
  if (!fileType.startsWith('image/') && !fileType.startsWith('video/')) {
    return true; // PDFs, Excel, PPTs bypass explicit visual scanning
  }
  
  // TODO: Implement cloud Vision API call here.
  // For now, assume media passes the baseline safety check.
  const isSafe = true; 
  return isSafe;
}
