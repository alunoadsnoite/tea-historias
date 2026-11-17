import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { deleteStory, initialize, loadAppSettings, loadLibrary, loadSettings, loadStory, saveAppSettings, saveProgress, saveSettings, saveStory, setFavorite } from '../src/database.ts';

function connect(path: string) {
  const sqlite = new DatabaseSync(path);
  const db = {
    async execAsync(sql: string) { sqlite.exec(sql); },
    async runAsync(sql: string, ...params: (string | number)[]) { sqlite.prepare(sql).run(...params); },
    async getAllAsync(sql: string, ...params: (string | number)[]) { return sqlite.prepare(sql).all(...params); },
    async getFirstAsync(sql: string, ...params: (string | number)[]) { return sqlite.prepare(sql).get(...params) ?? null; },
    async withExclusiveTransactionAsync(action: (tx: typeof db) => Promise<void>) {
      sqlite.exec('BEGIN EXCLUSIVE');
      try {
        await action(db);
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return { db, close: () => sqlite.close() };
}

test('inicializa a biblioteca uma vez e preserva a ordem das cenas', async () => {
  const { db, close } = connect(':memory:');
  try {
    await initialize(db);
    await initialize(db);
    const library = await loadLibrary(db);
    assert.deepEqual(library.slice(0, 3).map(({ title, count }) => [title, count]), [
      ['Vou ao dentista', 5],
      ['Posso pedir uma pausa', 4],
      ['Vou a uma entrevista de emprego', 5],
    ]);
    const { scenes, position } = await loadStory(db, 'dentista');
    assert.equal(position, 0);
    assert.equal(scenes[0].title, 'Antes da consulta');
    assert.equal(scenes[4].title, 'A consulta termina');
    await assert.rejects(loadStory(db, 'ausente'), /indisponível/);
  } finally {
    close();
  }
});

test('persiste o progresso ao reabrir o banco e reinicia uma história concluída', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'tea-historias-'));
  const path = join(folder, 'test.db');
  try {
    const first = connect(path);
    try {
      await initialize(first.db);
      await saveProgress(first.db, 'entrevista', 2);
    } finally {
      first.close();
    }
    const second = connect(path);
    try {
      await initialize(second.db);
      assert.equal((await loadStory(second.db, 'entrevista')).position, 2);
      assert.equal((await loadStory(second.db, 'pausa')).position, 0);
      await saveProgress(second.db, 'entrevista', 4, true);
      assert.equal((await loadStory(second.db, 'entrevista')).position, 0);
    } finally {
      second.close();
    }
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});

test('atualiza um banco da Sprint 1 preservando histórias e progresso', async () => {
  const { db, close } = connect(':memory:');
  try {
    await db.execAsync(`
      CREATE TABLE stories (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, ordinal INTEGER NOT NULL);
      CREATE TABLE scenes (
        story_id TEXT NOT NULL REFERENCES stories(id), position INTEGER NOT NULL,
        illustration TEXT NOT NULL, title TEXT NOT NULL, text TEXT NOT NULL,
        PRIMARY KEY (story_id, position)
      );
      CREATE TABLE progress (
        story_id TEXT PRIMARY KEY REFERENCES stories(id), position INTEGER NOT NULL, completed INTEGER NOT NULL DEFAULT 0
      );
      INSERT INTO stories VALUES ('original', 'História original', 'Saúde', 0);
      INSERT INTO scenes VALUES ('original', 0, '', 'Primeira', 'Começo');
      INSERT INTO scenes VALUES ('original', 1, '', 'Segunda', 'Continuação');
      INSERT INTO progress VALUES ('original', 1, 0);
      PRAGMA user_version = 1;
    `);
    await initialize(db);
    await initialize(db);
    assert.deepEqual((await loadLibrary(db)).filter((story) => story.id === "original").map((story) => ({ ...story })), [
      { id: 'original', title: 'História original', category: 'Saúde', count: 2, custom: 0, favorite: 0 },
    ]);
    assert.equal((await loadStory(db, 'original')).position, 1);
    assert.deepEqual({ ...await loadSettings(db) }, { large_text: 0, hide_images: 0 });
  } finally {
    close();
  }
});

test('permite criar e editar histórias próprias, favoritar e ajustar o leitor', async () => {
  const { db, close } = connect(':memory:');
  const draft = {
    title: '  Minha rotina  ', category: '  Casa ',
    scenes: [
      { illustration: '', title: 'Início', text: 'Organizo minha mochila.' },
      { illustration: 'door', title: 'Saída', text: 'Confiro se está tudo pronto.' },
    ],
  };
  try {
    await initialize(db);
    await saveStory(db, draft);
    const created = (await loadLibrary(db)).find((story) => story.custom);
    assert.ok(created);
    assert.equal(created.title, 'Minha rotina');
    assert.equal(created.category, 'Casa');
    await setFavorite(db, created.id, true);
    await saveProgress(db, created.id, 1);
    await saveStory(db, { ...draft, title: 'Rotina atualizada', scenes: draft.scenes.slice(1) }, created.id);
    const updated = (await loadLibrary(db)).find((story) => story.id === created.id);
    assert.equal(updated?.title, 'Rotina atualizada');
    assert.equal(updated?.favorite, 1);
    assert.equal(updated?.count, 1);
    const loaded = await loadStory(db, created.id);
    assert.equal(loaded.position, 0);
    assert.equal(loaded.scenes[0].title, 'Saída');
    await assert.rejects(saveStory(db, { ...draft, title: ' ' }, created.id), /Preencha/);
    await assert.rejects(saveStory(db, draft, 'dentista'), /indisponível para edição/);
    await saveSettings(db, { large_text: 1, hide_images: 1 });
    await initialize(db);
    assert.deepEqual({ ...await loadSettings(db) }, { large_text: 1, hide_images: 1 });
  } finally {
    close();
  }
});

test('salva a nova ordem e exclui somente histórias próprias com seus dados', async () => {
  const { db, close } = connect(':memory:');
  const first = { title: 'Primeira', text: 'Começo', illustration: '' };
  const second = { title: 'Segunda', text: 'Continuação', illustration: 'door' };
  const draft = { title: 'Rotina', category: 'Casa', scenes: [first, second] };
  try {
    await initialize(db);
    await saveStory(db, draft);
    const created = (await loadLibrary(db)).find((story) => story.custom);
    assert.ok(created);
    await saveStory(db, { ...draft, scenes: [second, first] }, created.id);
    assert.deepEqual((await loadStory(db, created.id)).scenes.map((scene) => ({ ...scene })), [second, first]);
    await saveProgress(db, created.id, 1);
    await setFavorite(db, created.id, true);

    await assert.rejects(deleteStory(db, 'dentista'), /indisponível para exclusão/);
    await deleteStory(db, created.id);
    assert.equal(await db.getFirstAsync('SELECT 1 FROM progress WHERE story_id = ?', created.id), null);
    await assert.rejects(loadStory(db, created.id), /indisponível/);
    const library = await loadLibrary(db);
    assert.equal(library.length, 9);
    assert.ok(library.some((story) => story.id === 'dentista'));
  } finally {
    close();
  }
});

test('acrescenta as seis histórias a uma instalação existente sem perder dados', async () => {
  const { db, close } = connect(':memory:');
  try {
    await initialize(db);
    await db.execAsync(`
      DELETE FROM scenes WHERE story_id IN ('onibus', 'mercado', 'mudanca', 'trabalho-ajuda', 'barulho', 'festa');
      DELETE FROM stories WHERE id IN ('onibus', 'mercado', 'mudanca', 'trabalho-ajuda', 'barulho', 'festa');
      PRAGMA user_version = 2;
    `);
    await setFavorite(db, 'dentista', true);
    await saveProgress(db, 'dentista', 1);
    await saveSettings(db, { large_text: 1, hide_images: 1 });
    await saveStory(db, {
      title: 'Minha história', category: 'Casa',
      scenes: [{ title: 'Início', text: 'Começo', illustration: '' }],
    });
    await initialize(db);
    await initialize(db);
    const library = await loadLibrary(db);
    assert.equal(library.length, 10);
    assert.equal(library.find((story) => story.id === 'dentista')?.favorite, 1);
    assert.equal((await loadStory(db, 'dentista')).position, 1);
    assert.equal((await loadStory(db, 'onibus')).scenes.length, 4);
    assert.equal(library.at(-1)?.title, 'Minha história');
    assert.deepEqual({ ...await loadSettings(db) }, { large_text: 1, hide_images: 1 });
  } finally {
    close();
  }
});

test('adiciona idioma e tema a um banco anterior e preserva as escolhas', async () => {
  const { db, close } = connect(':memory:');
  try {
    await initialize(db);
    await db.execAsync('DROP TABLE app_settings; PRAGMA user_version = 3;');
    await saveSettings(db, { large_text: 1, hide_images: 1 });
    await saveProgress(db, 'dentista', 2);
    await initialize(db);
    assert.deepEqual({ ...await loadAppSettings(db) }, { language: 'pt', theme: 'light' });
    await saveAppSettings(db, { language: 'fr', theme: 'system' });
    await initialize(db);
    assert.deepEqual({ ...await loadAppSettings(db) }, { language: 'fr', theme: 'system' });
    assert.deepEqual({ ...await loadSettings(db) }, { large_text: 1, hide_images: 1 });
    assert.equal((await loadStory(db, 'dentista')).position, 2);
  } finally {
    close();
  }
});
