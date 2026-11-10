export type EmergencyCategoryCode =
  | "medical"
  | "fire"
  | "accident"
  | "security"
  | "flood"
  | "other"
  | "inquiry";

export type UrgencyLevel = "critical" | "high" | "moderate" | "low";

export type TemporalContext = "active_present" | "historical_past" | "hypothetical_inquiry";

export interface ExtractedEntities {
  incidentType: string;
  casualties: string | null;
  hazards: string | null;
  locationMentions: string[];
  actionRecommendation: string;
}

export interface NlpAnalysisResult {
  detectedCategory: {
    code: EmergencyCategoryCode;
    name: string;
    confidence: number; // 0.0 to 1.0
  };
  urgency: {
    level: UrgencyLevel;
    rationale: string;
    score: number; // 0 to 100
  };
  temporalContext: {
    type: TemporalContext;
    explanation: string;
  };
  extractedEntities: ExtractedEntities;
  detectedKeywords: string[];
  uncertaintyWarning: string | null;
  modelVersion: string;
  processedAt: string;
}

export interface INlpService {
  analyze(text: string): Promise<NlpAnalysisResult>;
}
