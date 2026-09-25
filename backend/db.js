import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load base seed data
const cropsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'crops.json'), 'utf-8'));
const pestsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'pests.json'), 'utf-8'));
const alertsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'alerts.json'), 'utf-8'));

let dbInstance = null;

// Try initializing better-sqlite3 safely
try {
  const Database = (await import('better-sqlite3')).default;
  const sqlite = new Database(path.join(__dirname, 'kisan.db'));

  sqlite.exec(`
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

  // Check seed counts
  const cropCheck = sqlite.prepare('SELECT COUNT(*) as count FROM crops').get();
  if (cropCheck.count === 0) {
    const insertCrop = sqlite.prepare(`
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
    const insertMany = sqlite.transaction((rows) => {
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
    insertMany(cropsData);
  }

  // Check pest seed
  const pestCheck = sqlite.prepare('SELECT COUNT(*) as count FROM pests').get();
  if (pestCheck.count === 0) {
    const insertPest = sqlite.prepare(`
      INSERT INTO pests (
        id, name, name_te, name_hi, target_crops, symptoms, identification,
        biological_control, chemical_control, prevention
      ) VALUES (
        @id, @name, @name_te, @name_hi, @target_crops, @symptoms, @identification,
        @biological_control, @chemical_control, @prevention
      )
    `);
    const insertManyPests = sqlite.transaction((rows) => {
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
    insertManyPests(pestsData);
  }

  // Check alerts seed
  const alertCheck = sqlite.prepare('SELECT COUNT(*) as count FROM alerts').get();
  if (alertCheck.count === 0) {
    const insertAlert = sqlite.prepare(`
      INSERT INTO alerts (
        id, crop, crop_te, crop_hi, title, title_te, title_hi, severity,
        region, trigger_weather, message, message_te, message_hi, action, valid_until, date
      ) VALUES (
        @id, @crop, @crop_te, @crop_hi, @title, @title_te, @title_hi, @severity,
        @region, @trigger_weather, @message, @message_te, @message_hi, @action, @valid_until, @date
      )
    `);
    const insertManyAlerts = sqlite.transaction((rows) => {
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
    insertManyAlerts(alertsData);
  }

  dbInstance = sqlite;
  console.log('✅ SQLite Database initialized and seeded.');
} catch (nativeErr) {
  console.warn('⚠️ Native SQLite initialization fallback active:', nativeErr.message);
}

// Resilient memory-backed fallback if native sqlite3 ever fails or has Node 24 GC hooks issue
class ResilientDB {
  constructor() {
    this.crops = cropsData.map((c) => ({
      ...c,
      growth_stages: JSON.stringify(c.growth_stages || [])
    }));
    this.pests = pestsData.map((p) => ({
      ...p,
      target_crops: JSON.stringify(p.target_crops || [])
    }));
    this.alerts = alertsData.map((a) => ({ ...a }));
  }

  prepare(query) {
    const q = query.trim().toLowerCase();
    const self = this;

    return {
      all(...params) {
        if (dbInstance) {
          try {
            return dbInstance.prepare(query).all(...params);
          } catch (e) {
            console.warn('SQLite statement error, falling back to memory store:', e.message);
          }
        }

        if (q.includes('from crops')) {
          if (q.includes('where id =')) {
            const id = Number(params[0]);
            return self.crops.filter((c) => c.id === id);
          }
          if (q.includes('like')) {
            const term = (params[0] || '').replace(/%/g, '').toLowerCase();
            return self.crops.filter((c) =>
              c.name.toLowerCase().includes(term) ||
              (c.name_te && c.name_te.includes(term)) ||
              (c.name_hi && c.name_hi.includes(term)) ||
              (c.disease && c.disease.toLowerCase().includes(term))
            ).slice(0, 8);
          }
          return self.crops;
        }

        if (q.includes('from pests')) {
          if (q.includes('where id =')) {
            const id = String(params[0]);
            return self.pests.filter((p) => p.id === id);
          }
          if (q.includes('like')) {
            const term = (params[0] || '').replace(/%/g, '').toLowerCase();
            return self.pests.filter((p) =>
              p.name.toLowerCase().includes(term) ||
              (p.symptoms && p.symptoms.toLowerCase().includes(term))
            ).slice(0, 4);
          }
          return self.pests;
        }

        if (q.includes('from alerts')) {
          let res = [...self.alerts];
          if (params.length > 0) {
            params.forEach((param) => {
              if (param) {
                const term = String(param).replace(/%/g, '').toLowerCase();
                res = res.filter((a) =>
                  a.crop.toLowerCase().includes(term) ||
                  a.title.toLowerCase().includes(term) ||
                  a.severity.toLowerCase() === term
                );
              }
            });
          }
          return res;
        }

        return [];
      },

      get(...params) {
        const results = this.all(...params);
        return results.length > 0 ? results[0] : null;
      },

      run(...params) {
        return { changes: 1, lastInsertRowid: 1 };
      }
    };
  }

  exec(sql) {
    if (dbInstance) {
      try {
        return dbInstance.exec(sql);
      } catch (e) {
        console.warn('exec fallback:', e.message);
      }
    }
  }

  transaction(fn) {
    return (items) => fn(items);
  }
}

const resilientDB = new ResilientDB();
export default resilientDB;
