import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Load .env.local if not already in environment
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      });
    }
  } catch (e) {
    console.warn("Could not read .env.local:", e);
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  console.log("Connecting to Neon database...");

  // 1. Create Enums
  await sql`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('citizen', 'responder', 'admin');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE report_status AS ENUM ('submitted', 'under_review', 'confirmed', 'assigned', 'resolved', 'rejected');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE urgency_level AS ENUM ('critical', 'high', 'moderate', 'low');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  console.log("Enums verified.");

  // 2. Create Tables
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role user_role NOT NULL DEFAULT 'citizen',
      phone TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS emergency_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      badge_color_hex TEXT NOT NULL,
      priority_level INTEGER NOT NULL DEFAULT 3,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS emergency_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_number TEXT NOT NULL UNIQUE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      original_message TEXT NOT NULL,
      category_id UUID REFERENCES emergency_categories(id),
      urgency urgency_level NOT NULL DEFAULT 'moderate',
      location_name TEXT,
      latitude REAL,
      longitude REAL,
      status report_status NOT NULL DEFAULT 'submitted',
      rejection_reason TEXT,
      assigned_responder TEXT,
      user_confirmed BOOLEAN NOT NULL DEFAULT true,
      user_correction_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS nlp_analyses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES emergency_reports(id) ON DELETE CASCADE,
      detected_category_code TEXT NOT NULL,
      detected_category_name TEXT NOT NULL,
      urgency_assessment urgency_level NOT NULL,
      confidence_score REAL NOT NULL,
      temporal_context TEXT NOT NULL,
      extracted_entities JSONB NOT NULL,
      detected_keywords JSONB NOT NULL,
      model_version TEXT NOT NULL DEFAULT 'v1.2-rule-semantic',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS report_updates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES emergency_reports(id) ON DELETE CASCADE,
      administrator_id UUID REFERENCES users(id) ON DELETE SET NULL,
      previous_status TEXT NOT NULL,
      new_status TEXT NOT NULL,
      internal_comment TEXT,
      public_notification_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      report_id UUID REFERENCES emergency_reports(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      is_read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log("Tables verified successfully.");

  // 3. Seed Standard Categories
  const categories = [
    {
      code: "medical",
      name: "Medical Emergency",
      description: "Cardiac arrests, respiratory failure, severe bleeding, unconsciousness, or acute trauma.",
      iconName: "HeartPulse",
      badgeColorHex: "#DC2626",
      priorityLevel: 1,
    },
    {
      code: "fire",
      name: "Fire & Rescue",
      description: "Structural fires, smoke emission, hazardous gas leaks, chemical spills, or trapped individuals.",
      iconName: "Flame",
      badgeColorHex: "#EA580C",
      priorityLevel: 1,
    },
    {
      code: "accident",
      name: "Road Traffic Accident",
      description: "Multi-vehicle collisions, overturned vehicles, pedestrian impacts, or blocked expressways.",
      iconName: "CarAlert",
      badgeColorHex: "#D97706",
      priorityLevel: 2,
    },
    {
      code: "security",
      name: "Public Safety & Security",
      description: "Physical assaults, robberies, weapon sightings, violent civil unrest, or active threats.",
      iconName: "ShieldAlert",
      badgeColorHex: "#7C3AED",
      priorityLevel: 2,
    },
    {
      code: "flood",
      name: "Natural Hazard & Flood",
      description: "Rising floodwaters, fallen power cables, landslides, or severe building structural collapse.",
      iconName: "Waves",
      badgeColorHex: "#0284C7",
      priorityLevel: 2,
    },
    {
      code: "other",
      name: "Other Urgent Incidents",
      description: "Critical events not explicitly classified under the primary categories.",
      iconName: "AlertTriangle",
      badgeColorHex: "#475569",
      priorityLevel: 3,
    },
    {
      code: "inquiry",
      name: "General Inquiry / Non-Emergency",
      description: "Non-critical inquiries, historical information requests, or informational checks.",
      iconName: "HelpCircle",
      badgeColorHex: "#16A34A",
      priorityLevel: 4,
    },
  ];

  for (const cat of categories) {
    await sql`
      INSERT INTO emergency_categories (code, name, description, icon_name, badge_color_hex, priority_level)
      VALUES (${cat.code}, ${cat.name}, ${cat.description}, ${cat.iconName}, ${cat.badgeColorHex}, ${cat.priorityLevel})
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon_name = EXCLUDED.icon_name,
        badge_color_hex = EXCLUDED.badge_color_hex,
        priority_level = EXCLUDED.priority_level;
    `;
  }
  console.log("Categories seeded.");

  // 4. Seed Standard Users
  const citizenHash = await bcrypt.hash("Emergency123!", 10);
  const adminHash = await bcrypt.hash("AdminCommand2026!", 10);

  const [citizenUser] = await sql`
    INSERT INTO users (full_name, email, password_hash, role, phone)
    VALUES ('Dr. Sarah Jenkins', 'citizen@emergencyconnect.org', ${citizenHash}, 'citizen', '+1 (555) 019-2834')
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id;
  `;

  const [adminUser] = await sql`
    INSERT INTO users (full_name, email, password_hash, role, phone)
    VALUES ('Chief Dispatcher Vance', 'admin@emergencyconnect.org', ${adminHash}, 'admin', '+1 (555) 911-0001')
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, role = 'admin'
    RETURNING id;
  `;

  console.log("Default users seeded (Citizen & Admin).");

  // 5. Seed Realistic Demonstration Incidents
  const [fireCategory] = await sql`SELECT id FROM emergency_categories WHERE code = 'fire'`;
  const [accidentCategory] = await sql`SELECT id FROM emergency_categories WHERE code = 'accident'`;

  // Sample Report 1: Fire
  const [rep1] = await sql`
    INSERT INTO emergency_reports (
      reference_number, user_id, original_message, category_id, urgency,
      location_name, latitude, longitude, status, user_confirmed
    )
    VALUES (
      'EC-2026-1042',
      ${citizenUser.id},
      'There is heavy black smoke and visible flames coming from the third floor of the grocery store near Market Square. Two people are trapped by the back exit door!',
      ${fireCategory.id},
      'critical',
      'Market Square, North Wing Building 4',
      39.9526,
      -75.1652,
      'under_review',
      true
    )
    ON CONFLICT (reference_number) DO NOTHING
    RETURNING id;
  `;

  if (rep1) {
    await sql`
      INSERT INTO nlp_analyses (
        report_id, detected_category_code, detected_category_name, urgency_assessment,
        confidence_score, temporal_context, extracted_entities, detected_keywords
      )
      VALUES (
        ${rep1.id},
        'fire',
        'Fire & Rescue',
        'critical',
        0.96,
        'active_present',
        ${JSON.stringify({
          incidentType: "Structural fire with entrapment",
          casualties: "2 persons trapped",
          hazards: "Heavy smoke, active flames",
          location: "Grocery store, Market Square, North Wing",
          actionNeeded: "Immediate aerial fire ladder and evacuation",
        })},
        ${JSON.stringify(["heavy smoke", "visible flames", "third floor", "trapped", "back exit door"])}
      );
    `;

    await sql`
      INSERT INTO report_updates (
        report_id, administrator_id, previous_status, new_status,
        internal_comment, public_notification_message
      )
      VALUES (
        ${rep1.id},
        ${adminUser.id},
        'submitted',
        'under_review',
        'NLP flagged critical entrapment. Contacting Station 4 ladder truck unit.',
        'Your report has been received and escalated to Priority 1 triage review.'
      );
    `;
  }

  // Sample Report 2: Accident
  const [rep2] = await sql`
    INSERT INTO emergency_reports (
      reference_number, user_id, original_message, category_id, urgency,
      location_name, latitude, longitude, status, user_confirmed
    )
    VALUES (
      'EC-2026-0988',
      ${citizenUser.id},
      'Two cars had a violent collision on the highway off-ramp near Exit 14. One driver is slumped over the steering wheel and not responding.',
      ${accidentCategory.id},
      'critical',
      'Highway Interstate 95, Exit 14 Northbound',
      39.9612,
      -75.1523,
      'confirmed',
      true
    )
    ON CONFLICT (reference_number) DO NOTHING
    RETURNING id;
  `;

  if (rep2) {
    await sql`
      INSERT INTO nlp_analyses (
        report_id, detected_category_code, detected_category_name, urgency_assessment,
        confidence_score, temporal_context, extracted_entities, detected_keywords
      )
      VALUES (
        ${rep2.id},
        'accident',
        'Road Traffic Accident',
        'critical',
        0.94,
        'active_present',
        ${JSON.stringify({
          incidentType: "High-speed multi-vehicle crash",
          casualties: "1 driver unresponsive",
          hazards: "Highway lane obstruction, possible fuel leak",
          location: "Highway off-ramp, Exit 14 Northbound",
          actionNeeded: "Trauma ambulance and highway safety patrol",
        })},
        ${JSON.stringify(["violent collision", "highway off-ramp", "slumped over", "not responding"])}
      );
    `;
  }

  console.log("Database initialized and demonstration dataset seeded successfully.");
}

main().catch((err) => {
  console.error("Migration/seed failed:", err);
  process.exit(1);
});
