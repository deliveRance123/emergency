import { TemporalContext } from "./types";
import { ProcessedText } from "./preprocessor";

export interface TemporalAnalysis {
  context: TemporalContext;
  explanation: string;
  isOngoing: boolean;
}

const PAST_MARKERS = [
  "yesterday",
  "last night",
  "last week",
  "last month",
  "ago",
  "earlier today",
  "previous",
  "happened yesterday",
  "was resolved",
  "already left",
  "took place on",
];

const INQUIRY_MARKERS = [
  "how do",
  "how does",
  "how to",
  "what is",
  "what are",
  "want to know",
  "curious about",
  "tell me about",
  "can someone explain",
  "why does",
  "inquire",
  "procedure for",
];

const ACTIVE_PRESENT_MARKERS = [
  "right now",
  "currently",
  "there is",
  "there are",
  "help",
  "hurry",
  "trapped",
  "bleeding",
  "burning",
  "spreading",
  "collapsed",
  "unconscious",
  "active",
  "immediate",
  "attacking",
];

export function analyzeTemporalContext(processed: ProcessedText): TemporalAnalysis {
  const norm = processed.normalized;

  // 1. Check for informational/hypothetical inquiries
  for (const marker of INQUIRY_MARKERS) {
    if (norm.includes(marker)) {
      return {
        context: "hypothetical_inquiry",
        explanation: "Message is phrased as a general informational inquiry or educational question, not an active crisis.",
        isOngoing: false,
      };
    }
  }

  // 2. Check for historical markers
  for (const marker of PAST_MARKERS) {
    if (norm.includes(marker)) {
      return {
        context: "historical_past",
        explanation: "Incident refers to past events ('yesterday' or 'ago') with no immediate active distress indicated.",
        isOngoing: false,
      };
    }
  }

  // 3. Check for active present markers or default to present if descriptive distress
  const hasActiveMarker = ACTIVE_PRESENT_MARKERS.some((m) => norm.includes(m));
  return {
    context: "active_present",
    explanation: hasActiveMarker
      ? "Language indicates an unfolding, active incident requiring rapid response verification."
      : "Defaulted to active situation in the absence of past or inquiry markers to prioritize safety.",
    isOngoing: true,
  };
}
