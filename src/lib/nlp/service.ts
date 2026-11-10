import { INlpService, NlpAnalysisResult } from "./types";
import { preprocessText } from "./preprocessor";
import { analyzeTemporalContext } from "./temporal";
import { classifyEmergencyCategory } from "./classifier";
import { extractEntities } from "./extractor";
import { evaluateUrgency } from "./urgency";

export class NlpService implements INlpService {
  private readonly modelVersion = "v1.2-rule-semantic-pipeline";

  async analyze(text: string): Promise<NlpAnalysisResult> {
    if (!text || text.trim().length === 0) {
      throw new Error("Cannot analyze empty emergency text.");
    }

    // Stage 1: Preprocessing & Tokenization
    const processed = preprocessText(text);

    // Stage 2: Temporal & Intent Analysis
    const temporal = analyzeTemporalContext(processed);

    // Stage 3: Emergency Category Classification
    const category = classifyEmergencyCategory(processed, temporal);

    // Stage 4: Named Entity & Slot Extraction
    const entities = extractEntities(processed, category.code);

    // Stage 5: Contextual Urgency Assessment
    const urgency = evaluateUrgency(processed, category.code, temporal, entities);

    // Stage 6: Uncertainty Evaluation
    let uncertaintyWarning: string | null = null;
    if (category.confidence < 0.70) {
      uncertaintyWarning =
        "The model detected ambiguous terminology. Please confirm or adjust the category manually before submitting.";
    } else if (entities.locationMentions.length === 0) {
      uncertaintyWarning =
        "No explicit street address or landmark was identified in your description. Please verify the incident location below.";
    }

    return {
      detectedCategory: {
        code: category.code,
        name: category.name,
        confidence: category.confidence,
      },
      urgency: {
        level: urgency.level,
        rationale: urgency.rationale,
        score: urgency.score,
      },
      temporalContext: {
        type: temporal.context,
        explanation: temporal.explanation,
      },
      extractedEntities: entities,
      detectedKeywords: category.matchedKeywords,
      uncertaintyWarning,
      modelVersion: this.modelVersion,
      processedAt: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const nlpService = new NlpService();
