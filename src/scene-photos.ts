import { Directory, File, Paths } from 'expo-file-system';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { loadIllustrations } from './database';
import type { Database } from './database';

const photoName = /^photo-[a-z0-9-]+\.[a-z0-9]{2,5}$/;

function photoDirectory() {
  return new Directory(Paths.document, 'scene-photos');
}

export function scenePhoto(illustration: string) {
  if (!photoName.test(illustration)) return undefined;
  return { uri: new File(photoDirectory(), illustration).uri };
}

export async function pickScenePhoto() {
  const result = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (result.canceled) return undefined;

  const source = new File(result.assets[0].uri);
  const extension = source.extension.toLowerCase();
  const directory = photoDirectory();
  directory.create({ idempotent: true, intermediates: true });

  const suffix = /^\.[a-z0-9]{2,5}$/.test(extension) ? extension : '.jpg';
  let destination: File;
  do {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    destination = new File(directory, `photo-${id}${suffix}`);
  } while (destination.exists);

  source.copy(destination);
  return destination.name;
}

export async function removeUnusedScenePhotos(db: Database) {
  try {
    const directory = photoDirectory();
    if (!directory.exists) return;
    const used = new Set(await loadIllustrations(db));
    for (const entry of directory.list()) {
      if (entry instanceof File && photoName.test(entry.name) && !used.has(entry.name)) {
        entry.delete();
      }
    }
  } catch {
    // Retry cleanup on the next launch if storage or SQLite is unavailable.
  }
}
