import { EmergencyCategoryCode } from "./types";
import { ProcessedText } from "./preprocessor";
import { TemporalAnalysis } from "./temporal";

export interface CategoryClassification {
  code: EmergencyCategoryCode;
  name: string;
  confidence: number;
  matchedKeywords: string[];
}

interface CategoryProfile {
  code: EmergencyCategoryCode;
  name: string;
  keywords: { term: string; weight: number }[];
}

const CATEGORY_PROFILES: CategoryProfile[] = [
  {
    code: "medical",
    name: "Medical Emergency",
    keywords: [
      { term: "chest pain", weight: 3.5 },
      { term: "heart attack", weight: 4.0 },
      { term: "unconscious", weight: 4.0 },
      { term: "not breathing", weight: 4.0 },
      { term: "cannot breathe", weight: 3.5 },
      { term: "bleeding", weight: 3.0 },
      { term: "seizure", weight: 3.5 },
      { term: "stroke", weight: 3.5 },
      { term: "overdose", weight: 3.5 },
      { term: "fainted", weight: 2.5 },
      { term: "allergic", weight: 3.0 },
      { term: "ambulance", weight: 2.0 },
      { term: "injured", weight: 2.5 },
      { term: "injury", weight: 2.0 },
      { term: "patient", weight: 2.0 },
      { term: "blood", weight: 2.0 },
      { term: "cardiac", weight: 3.5 },
      { term: "pain", weight: 1.2 },
      { term: "hospital", weight: 1.5 },
    ],
  },
  {
    code: "fire",
    name: "Fire & Rescue",
    keywords: [
      { term: "fire", weight: 3.5 },
      { term: "flames", weight: 3.5 },
      { term: "smoke", weight: 3.0 },
      { term: "burning", weight: 3.0 },
      { term: "explosion", weight: 4.0 },
      { term: "exploded", weight: 4.0 },
      { term: "gas leak", weight: 4.0 },
      { term: "trapped", weight: 3.0 },
      { term: "blaze", weight: 3.5 },
      { term: "firefighter", weight: 2.5 },
      { term: "smell smoke", weight: 3.0 },
      { term: "chemical spill", weight: 3.0 },
      { term: "building fire", weight: 4.0 },
      { term: "wildfire", weight: 3.5 },
      { term: "arson", weight: 3.0 },
    ],
  },
  {
    code: "accident",
    name: "Road Traffic Accident",
    keywords: [
      { term: "car crash", weight: 4.0 },
      { term: "accident", weight: 3.0 },
      { term: "collision", weight: 3.5 },
      { term: "head-on", weight: 4.0 },
      { term: "hit and run", weight: 4.0 },
      { term: "pedestrian", weight: 3.0 },
      { term: "overturned", weight: 3.5 },
      { term: "slumped", weight: 2.5 },
      { term: "highway", weight: 2.0 },
      { term: "traffic", weight: 1.5 },
      { term: "vehicle", weight: 2.0 },
      { term: "motorcycle", weight: 2.5 },
      { term: "truck crash", weight: 4.0 },
      { term: "pileup", weight: 4.0 },
      { term: "off-ramp", weight: 2.0 },
    ],
  },
  {
    code: "security",
    name: "Public Safety & Security",
    keywords: [
      { term: "robbery", weight: 4.0 },
      { term: "gun", weight: 4.0 },
      { term: "gunshot", weight: 4.5 },
      { term: "shooting", weight: 4.5 },
      { term: "armed", weight: 4.0 },
      { term: "weapon", weight: 3.5 },
      { term: "assault", weight: 3.5 },
      { term: "attacked", weight: 3.5 },
      { term: "stabbed", weight: 4.0 },
      { term: "knife", weight: 3.5 },
      { term: "intruder", weight: 3.5 },
      { term: "burglary", weight: 3.5 },
      { term: "hostage", weight: 4.5 },
      { term: "fighting", weight: 2.5 },
      { term: "violence", weight: 3.0 },
      { term: "threat", weight: 2.5 },
    ],
  },
  {
    code: "flood",
    name: "Natural Hazard & Flood",
    keywords: [
      { term: "flood", weight: 4.0 },
      { term: "flooding", weight: 4.0 },
      { term: "water rising", weight: 3.5 },
      { term: "river broke", weight: 4.0 },
      { term: "landslide", weight: 4.0 },
      { term: "mudslide", weight: 4.0 },
      { term: "earthquake", weight: 4.0 },
      { term: "storm surge", weight: 4.0 },
      { term: "submerged", weight: 3.5 },
      { term: "dam broke", weight: 4.5 },
      { term: "heavy rain", weight: 2.0 },
    ],
  },
];

export function classifyEmergencyCategory(
  processed: ProcessedText,
  temporal: TemporalAnalysis
): CategoryClassification {
  // If the temporal analyzer determined this is a pure inquiry/hypothetical question
  if (temporal.context === "hypothetical_inquiry") {
    return {
      code: "inquiry",
      name: "General Inquiry / Non-Emergency",
      confidence: 0.92,
      matchedKeywords: ["inquiry", "how do", "question"],
    };
  }

  const scores: Record<EmergencyCategoryCode, { score: number; matched: string[] }> = {
    medical: { score: 0, matched: [] },
    fire: { score: 0, matched: [] },
    accident: { score: 0, matched: [] },
    security: { score: 0, matched: [] },
    flood: { score: 0, matched: [] },
    other: { score: 0, matched: [] },
    inquiry: { score: 0, matched: [] },
  };

  const text = processed.normalized;

  for (const cat of CATEGORY_PROFILES) {
    for (const kw of cat.keywords) {
      if (text.includes(kw.term)) {
        scores[cat.code].score += kw.weight;
        scores[cat.code].matched.push(kw.term);
      }
    }
  }

  // Sort by highest score
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([code, data]) => ({ code: code as EmergencyCategoryCode, ...data }));

  const top = sorted[0];

  // If score is negligible, categorize as other
  if (top.score < 1.0) {
    return {
      code: "other",
      name: "Other Urgent Incidents",
      confidence: 0.55,
      matchedKeywords: ["uncategorized_incident"],
    };
  }

  // Calculate calibrated confidence
  const profile = CATEGORY_PROFILES.find((p) => p.code === top.code);
  const totalScore = sorted.reduce((sum, s) => sum + s.score, 0);
  const ratio = totalScore > 0 ? top.score / totalScore : 0.6;
  const confidence = Math.min(0.98, Math.max(0.65, Number((ratio * 0.95 + 0.05).toFixed(2))));

  return {
    code: top.code,
    name: profile?.name || "Incident",
    confidence,
    matchedKeywords: top.matched,
  };
}
