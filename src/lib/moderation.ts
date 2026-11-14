import { sanitizeString, validateBase64Upload } from "@/lib/security";

const RESTRICTED_TERMS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "dick",
  "pussy",
  "cunt",
  "whore",
  "slut",
  "nigger",
  "faggot",
  "retard",
  "kys"
];

export function censorText(rawText: string): string {
  const sanitized = sanitizeString(rawText, 8000);
  if (!sanitized) return "";

  let output = sanitized;
  for (const word of RESTRICTED_TERMS) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    output = output.replace(regex, "*".repeat(word.length));
  }
  return output;
}

export async function scanMediaContent(
  fileUrl: string,
  fileType: string,
  fileName?: string
): Promise<boolean> {
  const check = validateBase64Upload(fileUrl, fileName);
  if (!check.valid) return false;

  const blockedTypes = ["application/x-msdownload", "application/x-sh", "text/html", "text/javascript"];
  if (blockedTypes.some(t => fileType?.toLowerCase().includes(t))) {
    return false;
  }

  return true;
}
