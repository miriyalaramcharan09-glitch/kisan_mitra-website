import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'kisan.db'));

// Setup tables with full schema — use IF NOT EXISTS to preserve data across restarts
db.exec(`
  CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    name_te TEXT,
    name_hi TEXT,
    disease TEXT,
    disease_te TEXT,
    disease_hi TEXT,
    severity TEXT,
    symptoms TEXT,
    causes TEXT,
    organic_remedies TEXT,
    chemical_remedies TEXT,
    precautions TEXT,
    suggestions TEXT,
    soil_type TEXT,
    growth_stages TEXT,
    npk_ratio TEXT,
    fertilizer TEXT
  );

  CREATE TABLE IF NOT EXISTS pests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_te TEXT,
    name_hi TEXT,
    target_crops TEXT,
    symptoms TEXT,
    identification TEXT,
    biological_control TEXT,
    chemical_control TEXT,
    prevention TEXT
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    crop TEXT NOT NULL,
    crop_te TEXT,
    crop_hi TEXT,
    title TEXT NOT NULL,
    title_te TEXT,
    title_hi TEXT,
    severity TEXT,
    region TEXT,
    trigger_weather TEXT,
    message TEXT,
    message_te TEXT,
    message_hi TEXT,
    action TEXT,
    valid_until TEXT,
    date TEXT
  );
`);

// Seed crops (only if empty)
try {
  const cropCount = db.prepare('SELECT COUNT(*) as count FROM crops').get();
  if (cropCount.count === 0) {
  const seedPath = path.join(__dirname, 'data', 'crops.json');
  if (fs.existsSync(seedPath)) {
    const crops = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    const insertCrop = db.prepare(`
      INSERT INTO crops (
        id, name, name_te, name_hi, disease, disease_te, disease_hi, severity,
        symptoms, causes, organic_remedies, chemical_remedies, precautions,
        suggestions, soil_type, growth_stages, npk_ratio, fertilizer
      ) VALUES (
        @id, @name, @name_te, @name_hi, @disease, @disease_te, @disease_hi, @severity,
        @symptoms, @causes, @organic_remedies, @chemical_remedies, @precautions,
        @suggestions, @soil_type, @growth_stages, @npk_ratio, @fertilizer
      )
    `);
    const insertManyCrops = db.transaction((rows) => {
      rows.forEach((r) => {
        insertCrop.run({
          id: r.id,
          name: r.name,
          name_te: r.name_te || '',
          name_hi: r.name_hi || '',
          disease: r.disease || '',
          disease_te: r.disease_te || '',
          disease_hi: r.disease_hi || '',
          severity: r.severity || 'Moderate',
          symptoms: r.symptoms || '',
          causes: r.causes || '',
          organic_remedies: r.organic_remedies || r.remedies || '',
          chemical_remedies: r.chemical_remedies || '',
          precautions: r.precautions || '',
          suggestions: r.suggestions || '',
          soil_type: r.soil_type || '',
          growth_stages: JSON.stringify(r.growth_stages || []),
          npk_ratio: r.npk_ratio || '',
          fertilizer: r.fertilizer || ''
        });
      });
    });
    insertManyCrops(crops);
    console.log(`Seeded ${crops.length} detailed crops into SQLite.`);
  }
  } else {
    console.log(`Crops table already has ${cropCount.count} rows — skipping seed.`);
  }
} catch (err) {
  console.error('Error seeding crops:', err);
}

// Seed pests (only if empty)
try {
  const pestCount = db.prepare('SELECT COUNT(*) as count FROM pests').get();
  if (pestCount.count === 0) {
  const pestsPath = path.join(__dirname, 'data', 'pests.json');
  if (fs.existsSync(pestsPath)) {
    const pests = JSON.parse(fs.readFileSync(pestsPath, 'utf-8'));
    const insertPest = db.prepare(`
      INSERT INTO pests (
        id, name, name_te, name_hi, target_crops, symptoms, identification,
        biological_control, chemical_control, prevention
      ) VALUES (
        @id, @name, @name_te, @name_hi, @target_crops, @symptoms, @identification,
        @biological_control, @chemical_control, @prevention
      )
    `);
    const insertManyPests = db.transaction((rows) => {
      rows.forEach((r) => {
        insertPest.run({
          id: r.id,
          name: r.name,
          name_te: r.name_te || '',
          name_hi: r.name_hi || '',
          target_crops: JSON.stringify(r.target_crops || []),
          symptoms: r.symptoms || '',
          identification: r.identification || '',
          biological_control: r.biological_control || '',
          chemical_control: r.chemical_control || '',
          prevention: r.prevention || ''
        });
      });
    });
    insertManyPests(pests);
    console.log(`Seeded ${pests.length} pests into SQLite.`);
  }
  } else {
    console.log(`Pests table already has ${pestCount.count} rows — skipping seed.`);
  }
} catch (err) {
  console.error('Error seeding pests:', err);
}

// Seed alerts (only if empty)
try {
  const alertCount = db.prepare('SELECT COUNT(*) as count FROM alerts').get();
  if (alertCount.count === 0) {
  const alertsPath = path.join(__dirname, 'data', 'alerts.json');
  if (fs.existsSync(alertsPath)) {
    const alerts = JSON.parse(fs.readFileSync(alertsPath, 'utf-8'));
    const insertAlert = db.prepare(`
      INSERT INTO alerts (
        id, crop, crop_te, crop_hi, title, title_te, title_hi, severity,
        region, trigger_weather, message, message_te, message_hi, action, valid_until, date
      ) VALUES (
        @id, @crop, @crop_te, @crop_hi, @title, @title_te, @title_hi, @severity,
        @region, @trigger_weather, @message, @message_te, @message_hi, @action, @valid_until, @date
      )
    `);
    const insertManyAlerts = db.transaction((rows) => {
      rows.forEach((r) => {
        insertAlert.run({
          id: r.id,
          crop: r.crop,
          crop_te: r.crop_te || '',
          crop_hi: r.crop_hi || '',
          title: r.title,
          title_te: r.title_te || '',
          title_hi: r.title_hi || '',
          severity: r.severity || 'Moderate',
          region: r.region || '',
          trigger_weather: r.trigger_weather || '',
          message: r.message || '',
          message_te: r.message_te || '',
          message_hi: r.message_hi || '',
          action: r.action || '',
          valid_until: r.valid_until || '',
          date: r.date || 'Active'
        });
      });
    });
    insertManyAlerts(alerts);
    console.log(`Seeded ${alerts.length} disease alerts into SQLite.`);
  }
  } else {
    console.log(`Alerts table already has ${alertCount.count} rows — skipping seed.`);
  }
} catch (err) {
  console.error('Error seeding alerts:', err);
}

export default db;
