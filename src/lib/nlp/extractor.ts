import { ExtractedEntities, EmergencyCategoryCode } from "./types";
import { ProcessedText } from "./preprocessor";

export function extractEntities(
  processed: ProcessedText,
  categoryCode: EmergencyCategoryCode
): ExtractedEntities {
  const raw = processed.raw;

  // 1. Casualties extraction
  let casualties: string | null = null;
  const casualtyPatterns = [
    /(\d+|two|three|four|several|many|people|person|driver|child|infant)\s+(injured|hurt|bleeding|unconscious|trapped|dead|slumped|burned)/i,
    /(unconscious|not breathing|cannot breathe|bleeding profusely|broken bones|severe burns|in cardiac arrest)/i,
    /(\d+|two|three|four)\s+(victims|casualties|passengers)/i,
  ];

  for (const pattern of casualtyPatterns) {
    const match = raw.match(pattern);
    if (match) {
      casualties = match[0].trim();
      break;
    }
  }

  // 2. Hazards extraction
  let hazards: string | null = null;
  const hazardPatterns = [
    /(heavy smoke|visible flames|spreading fast|trapped inside|gas leak|explosion|smell gas)/i,
    /(armed with|gun|knife|shots fired|active shooter|violent|hostage)/i,
    /(power lines down|live wire|fuel leak|overturned tanker|road blocked)/i,
    /(rising water|fast current|landslide|submerged|building collapse)/i,
  ];

  for (const pattern of hazardPatterns) {
    const match = raw.match(pattern);
    if (match) {
      hazards = match[0].trim();
      break;
    }
  }

  // 3. Location extraction
  const locationMentions: string[] = [];
  const locationPrepositions = /(?:near|at|on|in front of|behind|by|corner of|intersection of|along|inside)\s+([A-Z0-9][A-Za-z0-9\s,.-]{2,40})/g;
  
  let match;
  while ((match = locationPrepositions.exec(raw)) !== null) {
    const candidate = match[1].replace(/[,;.].*$/, "").trim();
    if (candidate.length > 3 && !["the", "my", "our", "a"].includes(candidate.toLowerCase())) {
      locationMentions.push(candidate);
    }
  }

  // Fallback for street / avenue / road mentions
  const streetPattern = /\b(?:\d+\s+)?(?:[A-Z][a-z]+\s+)?(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Highway|Hwy|Square|Market|Mall|Park|Station|Exit\s+\d+)\b/g;
  while ((match = streetPattern.exec(raw)) !== null) {
    const loc = match[0].trim();
    if (!locationMentions.includes(loc)) {
      locationMentions.push(loc);
    }
  }

  // 4. Incident Type derivation
  let incidentType = "Reported Incident";
  switch (categoryCode) {
    case "medical":
      incidentType = casualties ? `Medical Crisis (${casualties})` : "Acute Medical Emergency";
      break;
    case "fire":
      incidentType = hazards ? `Fire Hazard (${hazards})` : "Fire & Smoke Outbreak";
      break;
    case "accident":
      incidentType = "Road Traffic Collision";
      break;
    case "security":
      incidentType = hazards ? `Security Threat (${hazards})` : "Public Safety Disturbance";
      break;
    case "flood":
      incidentType = "Flooding / Severe Environmental Hazard";
      break;
    case "inquiry":
      incidentType = "General Public Inquiry";
      break;
    default:
      incidentType = "Uncategorized Urgent Situation";
      break;
  }

  // 5. Action Recommendation
  let actionRecommendation = "Dispatch standard assessment unit.";
  if (categoryCode === "fire") {
    actionRecommendation = "Dispatch Fire & Rescue team with breathing apparatus. Evacuate surrounding perimeter.";
  } else if (categoryCode === "medical") {
    actionRecommendation = "Dispatch Advanced Life Support (ALS) paramedic ambulance immediately.";
  } else if (categoryCode === "accident") {
    actionRecommendation = "Dispatch emergency medical services and traffic control unit.";
  } else if (categoryCode === "security") {
    actionRecommendation = "Alert local police command. Ensure civilian standoff distance.";
  } else if (categoryCode === "flood") {
    actionRecommendation = "Alert swiftwater rescue and disaster response coordinator.";
  } else if (categoryCode === "inquiry") {
    actionRecommendation = "Route to non-emergency public communications registry.";
  }

  return {
    incidentType,
    casualties,
    hazards,
    locationMentions,
    actionRecommendation,
  };
}
