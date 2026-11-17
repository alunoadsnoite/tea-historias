import type { SQLiteDatabase } from 'expo-sqlite';
import type { Language } from './i18n.ts';
import { stories } from './stories.ts';

export type Listing = { id: string; title: string; category: string; count: number; custom: number; favorite: number };
export type Scene = { illustration: string; title: string; text: string };
export type Progress = { position: number; completed: number };
export type Database = Pick<SQLiteDatabase, 'execAsync' | 'runAsync' | 'getAllAsync' | 'getFirstAsync'>;

export async function initialize(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.withExclusiveTransactionAsync(async (tx) => {
    const version = await tx.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    if (version?.user_version === 4) return;
    if (!version || version.user_version < 0 || version.user_version > 3) {
      throw new Error('Versão do banco incompatível');
    }
    if (version.user_version === 0) {
      await tx.execAsync(`
        CREATE TABLE stories (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, ordinal INTEGER NOT NULL);
        CREATE TABLE scenes (
          story_id TEXT NOT NULL REFERENCES stories(id), position INTEGER NOT NULL,
          illustration TEXT NOT NULL, title TEXT NOT NULL, text TEXT NOT NULL,
          PRIMARY KEY (story_id, position)
        );
        CREATE TABLE progress (
          story_id TEXT PRIMARY KEY REFERENCES stories(id),
          position INTEGER NOT NULL, completed INTEGER NOT NULL DEFAULT 0
        );
      `);
    }
    if (version.user_version < 2) {
      await tx.execAsync(`
        ALTER TABLE stories ADD COLUMN custom INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE stories ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0;
        CREATE TABLE reading_settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          large_text INTEGER NOT NULL DEFAULT 0,
          hide_images INTEGER NOT NULL DEFAULT 0
        );
        INSERT INTO reading_settings (id) VALUES (1);
      `);
    }
    if (version.user_version < 3) {
      for (const [ordinal, story] of stories.entries()) {
        await tx.runAsync(`
          INSERT INTO stories (id, title, category, ordinal) VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO NOTHING
        `, story.id, story.title, story.category, ordinal);
        for (const [position, scene] of story.scenes.entries()) {
          await tx.runAsync(`
            INSERT INTO scenes (story_id, position, illustration, title, text) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(story_id, position) DO NOTHING
          `, story.id, position, scene.illustration, scene.title, scene.text);
        }
      }
    }
    await tx.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        language TEXT NOT NULL CHECK (language IN ('pt', 'en', 'es', 'fr')),
        theme TEXT NOT NULL CHECK (theme IN ('light', 'dark', 'system'))
      );
      INSERT INTO app_settings (id, language, theme) VALUES (1, 'pt', 'light')
        ON CONFLICT(id) DO NOTHING;
      PRAGMA user_version = 4;
    `);
  });
}

export async function loadLibrary(db: Database) {
  return db.getAllAsync<Listing>(`
    SELECT stories.id, stories.title, stories.category, COUNT(scenes.position) AS count, stories.custom, stories.favorite
    FROM stories JOIN scenes ON scenes.story_id = stories.id
    GROUP BY stories.id ORDER BY stories.custom, stories.ordinal, stories.id
  `);
}

export async function loadStory(db: Database, id: string) {
  const scenes = await db.getAllAsync<Scene>(
    'SELECT illustration, title, text FROM scenes WHERE story_id = ? ORDER BY position', id);
  if (!scenes.length) throw new Error('História indisponível');
  const progress = await db.getFirstAsync<Progress>(
    'SELECT position, completed FROM progress WHERE story_id = ?', id);
  const position = progress?.completed ? 0 : Math.min(Math.max(progress?.position ?? 0, 0), scenes.length - 1);
  return { scenes, position };
}

export async function saveProgress(db: Database, id: string, position: number, completed = false) {
  await db.runAsync(`
    INSERT INTO progress (story_id, position, completed) VALUES (?, ?, ?)
    ON CONFLICT(story_id) DO UPDATE SET position = excluded.position, completed = excluded.completed
  `, id, position, Number(completed));
}

export type Draft = { title: string; category: string; scenes: Scene[] };
export type ReadingSettings = { large_text: number; hide_images: number };

export async function setFavorite(db: Database, id: string, value: boolean) {
  await db.runAsync('UPDATE stories SET favorite = ? WHERE id = ?', Number(value), id);
}

export async function loadSettings(db: Database) {
  const settings = await db.getFirstAsync<ReadingSettings>(
    'SELECT large_text, hide_images FROM reading_settings WHERE id = 1');
  if (!settings) throw new Error('Preferências indisponíveis');
  return settings;
}

export async function saveSettings(db: Database, settings: ReadingSettings) {
  await db.runAsync('UPDATE reading_settings SET large_text = ?, hide_images = ? WHERE id = 1',
    settings.large_text, settings.hide_images);
}

export async function saveStory(db: SQLiteDatabase, draft: Draft, id?: string) {
  const title = draft.title.trim();
  const category = draft.category.trim();
  const scenes = draft.scenes.map((scene) => ({
    ...scene, title: scene.title.trim(), text: scene.text.trim(),
  }));
  if (!title || !category || !scenes.length || scenes.some((scene) => !scene.title || !scene.text)) {
    throw new Error('Preencha o título, a categoria e os campos de cada cena');
  }
  await db.withExclusiveTransactionAsync(async (tx) => {
    if (id) {
      const existing = await tx.getFirstAsync<{ custom: number }>('SELECT custom FROM stories WHERE id = ?', id);
      if (!existing?.custom) throw new Error('História indisponível para edição');
      await tx.runAsync('UPDATE stories SET title = ?, category = ? WHERE id = ?', title, category, id);
      await tx.runAsync('DELETE FROM scenes WHERE story_id = ?', id);
      await tx.runAsync('DELETE FROM progress WHERE story_id = ?', id);
    } else {
      const key = await tx.getFirstAsync<{ id: string }>("SELECT lower(hex(randomblob(16))) AS id");
      if (!key) throw new Error('Identificador indisponível');
      id = key.id;
      await tx.runAsync(`
        INSERT INTO stories (id, title, category, ordinal, custom)
        SELECT ?, ?, ?, COALESCE(MAX(ordinal), -1) + 1, 1 FROM stories
      `, id, title, category);
    }
    for (const [position, scene] of scenes.entries()) {
      await tx.runAsync('INSERT INTO scenes VALUES (?, ?, ?, ?, ?)',
        id, position, scene.illustration, scene.title, scene.text);
    }
  });
}

export async function deleteStory(db: SQLiteDatabase, id: string) {
  await db.withExclusiveTransactionAsync(async (tx) => {
    const story = await tx.getFirstAsync<{ custom: number }>('SELECT custom FROM stories WHERE id = ?', id);
    if (!story?.custom) throw new Error('História indisponível para exclusão');
    await tx.runAsync('DELETE FROM progress WHERE story_id = ?', id);
    await tx.runAsync('DELETE FROM scenes WHERE story_id = ?', id);
    await tx.runAsync('DELETE FROM stories WHERE id = ?', id);
  });
}

export const themeOptions = ['light', 'dark', 'system'] as const;
export type AppSettings = { language: Language; theme: typeof themeOptions[number] };

export async function loadAppSettings(db: Database) {
  const settings = await db.getFirstAsync<AppSettings>('SELECT language, theme FROM app_settings WHERE id = 1');
  if (!settings) throw new Error('Preferências do aplicativo indisponíveis');
  return settings;
}

export async function saveAppSettings(db: Database, settings: AppSettings) {
  await db.runAsync('UPDATE app_settings SET language = ?, theme = ? WHERE id = 1',
    settings.language, settings.theme);
}
