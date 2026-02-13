import { TagConfig } from "@/types";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Load tag patterns from configuration file
 * Falls back to environment variable or defaults in serverless environments
 */
export function loadTagPatterns(): TagConfig {
  try {
    // Try environment variable first (for Netlify/Vercel)
    const envPatterns = process.env.MONITORED_TAGS;
    if (envPatterns) {
      return {
        patterns: envPatterns.split(',').map(tag => tag.trim()),
        caseSensitive: false,
      };
    }

    // Try reading from file system
    const configPath = join(process.cwd(), "config", "monitored-tags.json");
    const configFile = readFileSync(configPath, "utf-8");
    return JSON.parse(configFile);
  } catch (error) {
    console.warn("Using default tag patterns. File read failed:", error);
    // Return default configuration if file cannot be loaded
    return {
      patterns: ["#sd", "#service-desk", "#servicedesk"],
      caseSensitive: false,
    };
  }
}

/**
 * Extract hashtags from text using regex
 * Matches patterns like #tag, #tag-name, #tag_name
 */
export function extractHashtags(text: string): string[] {
  if (!text) return [];

  // Match hashtags: # followed by alphanumeric, hyphens, or underscores
  const hashtagRegex = /#[\w-]+/g;
  const matches = text.match(hashtagRegex);

  return matches || [];
}

/**
 * Check if any extracted hashtag matches the monitored patterns
 */
export function matchesMonitoredPatterns(hashtags: string[]): string[] {
  const config = loadTagPatterns();

  if (!hashtags || hashtags.length === 0) {
    return [];
  }

  const matchedTags = hashtags.filter((tag) => {
    return config.patterns.some((pattern) => {
      if (config.caseSensitive) {
        return tag === pattern;
      }
      return tag.toLowerCase() === pattern.toLowerCase();
    });
  });

  return matchedTags;
}

/**
 * Extract and match tags from comment text in one step
 */
export function getMatchingTags(text: string): string[] {
  const hashtags = extractHashtags(text);
  return matchesMonitoredPatterns(hashtags);
}
