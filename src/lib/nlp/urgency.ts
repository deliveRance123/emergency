import { UrgencyLevel, EmergencyCategoryCode, ExtractedEntities } from "./types";
import { TemporalAnalysis } from "./temporal";
import { ProcessedText } from "./preprocessor";

export interface UrgencyCalculation {
  level: UrgencyLevel;
  score: number;
  rationale: string;
}

export function evaluateUrgency(
  processed: ProcessedText,
  categoryCode: EmergencyCategoryCode,
  temporal: TemporalAnalysis,
  entities: ExtractedEntities
): UrgencyCalculation {
  // 1. Inquiry cases
  if (temporal.context === "hypothetical_inquiry" || categoryCode === "inquiry") {
    return {
      level: "low",
      score: 15,
      rationale: "Classified as informational or non-emergency inquiry. No immediate responder action required.",
    };
  }

  // 2. Historical past incidents
  if (temporal.context === "historical_past") {
    return {
      level: "low",
      score: 30,
      rationale: "Incident occurred in the past (e.g. yesterday). No ongoing immediate life safety threat detected.",
    };
  }

  const norm = processed.normalized;
  let score = 50;
  const criticalReasons: string[] = [];

  // Domain baseline weights
  if (categoryCode === "fire" || categoryCode === "medical") {
    score += 20;
  } else if (categoryCode === "accident" || categoryCode === "security") {
    score += 15;
  }

  // Critical indicators
  const lifeThreatIndicators = [
    "not breathing",
    "unconscious",
    "trapped",
    "heart attack",
    "bleeding profusely",
    "gunshot",
    "shooting",
    "explosion",
    "hostage",
    "slumped over",
  ];

  for (const indicator of lifeThreatIndicators) {
    if (norm.includes(indicator)) {
      score += 25;
      criticalReasons.push(`Mention of '${indicator}'`);
    }
  }

  if (entities.casualties) {
    score += 15;
    criticalReasons.push(`Casualty reported: ${entities.casualties}`);
  }

  if (entities.hazards) {
    score += 10;
    criticalReasons.push(`Active hazard: ${entities.hazards}`);
  }

  // Determine final urgency level
  let level: UrgencyLevel = "moderate";
  let rationale = "Standard incident report requiring orderly review.";

  if (score >= 85) {
    level = "critical";
    rationale = `Critical life-safety threat detected (${criticalReasons.join(", ") || "Active high-hazard scenario"}). Requires immediate emergency dispatch review.`;
  } else if (score >= 65) {
    level = "high";
    rationale = `High-priority active emergency (${entities.incidentType}). Rapid verification recommended.`;
  } else if (score >= 45) {
    level = "moderate";
    rationale = "Incident reported without immediate life-threatening markers. Scheduled for dispatcher triage.";
  } else {
    level = "low";
    rationale = "Low urgency indicator or administrative follow-up required.";
  }

  return {
    level,
    score: Math.min(100, Math.max(10, score)),
    rationale,
  };
}
