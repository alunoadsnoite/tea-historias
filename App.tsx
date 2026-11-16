import { openDatabaseAsync } from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo, ActivityIndicator, Alert, BackHandler, findNodeHandle, Image,
  Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  initialize, loadLibrary, loadSettings, loadStory, saveProgress, saveSettings, saveStory, setFavorite,
} from './src/database';
import type { Draft, Listing, ReadingSettings, Scene } from './src/database';

const illustrations: Record<string, ImageSourcePropType> = {
  calendar: require('./assets/calendar.png'),
  door: require('./assets/door.png'),
  chair: require('./assets/chair.png'),
  pause: require('./assets/pause.png'),
  done: require('./assets/done.png'),
  sound: require('./assets/sound.png'),
  note: require('./assets/note.png'),
};

const illustrationOptions = [
  ['', 'Sem ilustração'], ['calendar', 'Calendário'], ['door', 'Porta'], ['chair', 'Cadeira'],
  ['pause', 'Pausa'], ['done', 'Conclusão'], ['sound', 'Som'], ['note', 'Anotação'],
];
const emptyScene: Scene = { illustration: '', title: '', text: '' };
type Editor = Draft & { id?: string };
type Reader = { story: Listing; scenes: Scene[]; position: number };
const theme = {
  ink: '#19263E', muted: '#42546E', accent: '#214B73', canvas: '#F4F7FC',
  white: '#FFFFFF', line: '#BBC9D9', pale: '#E3EDF7',
};

function Button({ label, action, secondary, disabled }: {
  label: string; action: () => void; secondary?: boolean; disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={action}
      style={({ pressed }) => [
        styles.button, secondary && styles.secondary, pressed && styles.pressed, disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const db = useRef<SQLiteDatabase | null>(null);
  const pending = useRef(false);
  const heading = useRef<Text>(null);
  const scroller = useRef<ScrollView>(null);
  const [library, setLibrary] = useState<Listing[] | null>(null);
  const [reader, setReader] = useState<Reader | null>(null);
  const [category, setCategory] = useState('Todas');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [settings, setSettings] = useState<ReadingSettings>({ large_text: 0, hide_images: 0 });
  const editorChanged = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const moveFocus = useRef(false);

  async function perform(action: () => Promise<void>, message: string) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch {
      setError(message);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function start() {
    void perform(async () => {
      db.current ??= await openDatabaseAsync('tea-historias.db');
      await initialize(db.current);
      setSettings(await loadSettings(db.current));
      setLibrary(await loadLibrary(db.current));
    }, 'Não foi possível abrir a biblioteca. Tente novamente.');
  }

  useEffect(start, []);

  const reading = reader !== null;
  const scenePosition = reader?.position;
  const editing = editor !== null;

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    scroller.current?.scrollTo({ y: 0, animated: false });
    const frame = requestAnimationFrame(() => {
      const target = findNodeHandle(heading.current);
      if (target) AccessibilityInfo.setAccessibilityFocus(target);
    });
    return () => cancelAnimationFrame(frame);
  }, [reading, scenePosition, editing, showSettings]);

  function leave() {
    if (pending.current) return;
    setError('');
    moveFocus.current = true;
    setReader(null);
  }

  function closePanel() {
    if (pending.current) return;
    if (editing && editorChanged.current) {
      Alert.alert('Descartar as alterações?', 'As mudanças desta edição ainda não foram salvas.', [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: returnToLibrary },
      ]);
      return;
    }
    returnToLibrary();
  }

  function returnToLibrary() {
    moveFocus.current = true;
    setError('');
    setEditor(null);
    setShowSettings(false);
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (editing || showSettings) closePanel();
      else if (reading) leave();
      else return false;
      return true;
    });
    return () => subscription.remove();
  }, [reading, editing, showSettings]);

  function edit(story?: Listing) {
    const database = db.current;
    if (!database) return;
    void perform(async () => {
      const draft = story ? {
        id: story.id, title: story.title, category: story.category,
        scenes: (await loadStory(database, story.id)).scenes,
      } : { title: '', category: '', scenes: [{ ...emptyScene }] };
      editorChanged.current = false;
      moveFocus.current = true;
      setEditor(draft);
    }, 'Não foi possível abrir o editor. Tente novamente.');
  }

  function updateDraft(update: Partial<Draft>) {
    if (!editor || pending.current) return;
    editorChanged.current = true;
    setEditor({ ...editor, ...update });
  }

  function submit() {
    const database = db.current;
    if (!editor || !database) return;
    if (!editor.title.trim() || !editor.category.trim() ||
        editor.scenes.some(({ title, text }) => !title.trim() || !text.trim())) {
      setError('Preencha o título, a categoria e o título e texto de cada cena.');
      scroller.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    void perform(async () => {
      await saveStory(database, editor, editor.id);
      setLibrary(await loadLibrary(database));
      setCategory('Todas');
      setFavoriteOnly(false);
      returnToLibrary();
    }, 'Não foi possível salvar a história. Tente novamente.');
  }

  function toggleFavorite(story: Listing) {
    const database = db.current;
    if (!database) return;
    void perform(async () => {
      await setFavorite(database, story.id, !story.favorite);
      setLibrary((current) => current?.map((item) =>
        item.id === story.id ? { ...item, favorite: Number(!story.favorite) } : item) ?? null);
    }, 'Não foi possível atualizar os favoritos. Tente novamente.');
  }

  function changeSetting(key: keyof ReadingSettings, value: boolean) {
    const database = db.current;
    if (!database) return;
    const updated = { ...settings, [key]: Number(value) };
    void perform(async () => {
      await saveSettings(database, updated);
      setSettings(updated);
    }, 'Não foi possível salvar a preferência. Tente novamente.');
  }

  function open(story: Listing) {
    const database = db.current;
    if (!database) return;
    void perform(async () => {
      const saved = await loadStory(database, story.id);
      moveFocus.current = true;
      setReader({ story, ...saved });
    }, 'Não foi possível abrir esta história. Tente novamente.');
  }

  function goTo(position: number) {
    const database = db.current;
    if (!reader || !database) return;
    const finished = position === reader.scenes.length;
    void perform(async () => {
      await saveProgress(database, reader.story.id, finished ? reader.position : position, finished);
      moveFocus.current = true;
      setReader(finished ? null : { ...reader, position });
    }, 'Não foi possível salvar a leitura. Tente novamente.');
  }

  const scene = reader?.scenes[reader.position];
  const categories = ['Todas', ...new Set(library?.map((story) => story.category).filter((name) => name !== 'Todas'))];
  const visible = library?.filter((story) =>
    (category === 'Todas' || story.category === category) && (!favoriteOnly || !!story.favorite));

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <ScrollView ref={scroller} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
          {editor ? (
            <>
              <Button label="Voltar à biblioteca" action={closePanel} secondary disabled={busy} />
              <Text accessible ref={heading} accessibilityRole="header" style={styles.heading}>
                {editor.id ? 'Editar história' : 'Nova história'}
              </Text>
              <Field label="Título da história" value={editor.title} change={(title) => updateDraft({ title })} />
              <Field label="Categoria" value={editor.category} change={(category) => updateDraft({ category })} />
              {editor.scenes.map((item, index) => {
                const updateScene = (patch: Partial<Scene>) => updateDraft({
                  scenes: editor.scenes.map((entry, position) => position === index ? { ...entry, ...patch } : entry),
                });
                const label = `Cena ${index + 1}`;
                return (
                  <View key={index} style={styles.card}>
                    <Text accessibilityRole="header" style={styles.cardTitle}>{label}</Text>
                    <Field label={`Título da cena ${index + 1}`} value={item.title}
                      change={(title) => updateScene({ title })} />
                    <Field label={`Texto da cena ${index + 1}`} value={item.text} multiline
                      change={(text) => updateScene({ text })} />
                    <Text style={styles.caption}>Ilustração da cena {index + 1}</Text>
                    <View style={styles.categories}>
                      {illustrationOptions.map(([value, name]) => (
                        <Choice key={value} label={name} selected={item.illustration === value}
                          action={() => updateScene({ illustration: value })} />
                      ))}
                    </View>
                    {editor.scenes.length > 1 && <Button label={`Remover cena ${index + 1}`} secondary
                      action={() => updateDraft({ scenes: editor.scenes.filter((_, position) => index !== position) })} />}
                  </View>
                );
              })}
              <Button label="Adicionar cena" secondary action={() => updateDraft({ scenes: [...editor.scenes, { ...emptyScene }] })} />
              <Button label="Salvar história" action={submit} disabled={busy} />
            </>
          ) : showSettings ? (
            <>
              <Button label="Voltar à biblioteca" action={closePanel} secondary disabled={busy} />
              <Text accessible ref={heading} accessibilityRole="header" style={styles.heading}>Ajustes de leitura</Text>
              <Setting label="Texto maior" value={!!settings.large_text} disabled={busy}
                change={(value) => changeSetting('large_text', value)} />
              <Setting label="Ocultar ilustrações" value={!!settings.hide_images} disabled={busy}
                change={(value) => changeSetting('hide_images', value)} />
            </>
          ) : reader && scene ? (
            <>
              <Button label="Voltar à biblioteca" action={leave} secondary disabled={busy} />
              <Text style={styles.storyTitle}>{reader.story.title}</Text>
              <Text style={styles.caption}>Cena {reader.position + 1} de {reader.scenes.length}</Text>
              <Text accessible ref={heading} accessibilityRole="header"
                accessibilityLabel={`Cena ${reader.position + 1} de ${reader.scenes.length}. ${scene.title}`}
                style={[styles.heading, settings.large_text ? styles.largeHeading : null]}>{scene.title}</Text>
              {!settings.hide_images && illustrations[scene.illustration] && (
                <Image accessible={false} source={illustrations[scene.illustration]} style={styles.illustration} />
              )}
              <Text style={[styles.body, settings.large_text ? styles.largeBody : null]}>{scene.text}</Text>
              <View style={styles.controls}>
                {reader.position > 0 && (
                  <Button label="Cena anterior" action={() => goTo(reader.position - 1)} secondary disabled={busy} />
                )}
                <Button
                  label={reader.position === reader.scenes.length - 1 ? 'Concluir história' : 'Próxima cena'}
                  action={() => goTo(reader.position + 1)}
                  disabled={busy}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.brand}>
                <Image accessible={false} source={require('./assets/icon.png')} style={styles.logo} />
                <Text style={styles.storyTitle}>TEA Histórias</Text>
              </View>
              <Text accessible ref={heading} accessibilityRole="header" style={styles.heading}>Biblioteca</Text>
              {library ? (
                <>
                  <View style={styles.categories}>
                    <Choice label="Favoritos" selected={favoriteOnly} action={() => setFavoriteOnly(!favoriteOnly)} />
                    {categories.map((name) => (
                      <Choice key={name} label={name} selected={category === name} action={() => setCategory(name)} />
                    ))}
                  </View>
                  {visible?.map((story) => (
                    <View key={story.id} style={styles.card}>
                      <Pressable accessibilityRole="button" disabled={busy}
                        accessibilityState={{ disabled: busy }}
                        style={({ pressed }) => [styles.storyLink, pressed && styles.pressed]}
                        onPress={() => open(story)}>
                        <Text style={styles.caption}>{story.category} · {story.count} {story.count === 1 ? 'cena' : 'cenas'}</Text>
                        <Text style={styles.cardTitle}>{story.title}</Text>
                      </Pressable>
                      <View style={styles.categories}>
                        <Choice label={story.favorite ? 'Remover dos favoritos' : 'Favoritar'}
                          accessibilityLabel={`${story.favorite ? 'Remover dos favoritos' : 'Favoritar'}: ${story.title}`}
                          selected={!!story.favorite} disabled={busy} action={() => toggleFavorite(story)} />
                        {!!story.custom && <Button label="Editar história" action={() => edit(story)} secondary disabled={busy} />}
                      </View>
                    </View>
                  ))}
                  {!visible?.length && <Text style={styles.caption}>Nenhuma história neste filtro.</Text>}
                  <Button label="Nova história" action={() => edit()} disabled={busy} />
                  <Button label="Ajustes de leitura" action={() => {
                    setError('');
                    moveFocus.current = true;
                    setShowSettings(true);
                  }} secondary disabled={busy} />
                </>
              ) : busy || !error ? (
                <ActivityIndicator accessibilityLabel="Carregando biblioteca" color={theme.accent} />
              ) : <Button label="Tentar novamente" action={start} />}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Choice({ label, selected, action, accessibilityLabel, disabled }: {
  label: string; selected: boolean; action: () => void; accessibilityLabel?: string; disabled?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected, disabled }} disabled={disabled} onPress={action}
      style={[styles.chip, selected && styles.selectedChip, disabled && styles.disabled]}>
      <Text style={[styles.chipText, selected && styles.buttonText]}>{label}</Text>
    </Pressable>
  );
}

function Setting({ label, value, disabled, change }: {
  label: string; value: boolean; disabled: boolean; change: (value: boolean) => void;
}) {
  return (
    <View style={styles.setting}>
      <Text importantForAccessibility="no" style={styles.cardTitle}>{label}</Text>
      <Switch accessibilityLabel={label} value={value} disabled={disabled} onValueChange={change} />
    </View>
  );
}

function Field({ label, value, change, multiline }: {
  label: string; value: string; change: (value: string) => void; multiline?: boolean;
}) {
  return (
    <View style={styles.storyLink}>
      <Text importantForAccessibility="no" style={styles.caption}>{label}</Text>
      <TextInput accessibilityLabel={label} value={value} onChangeText={change}
        multiline={multiline} style={[styles.input, multiline && styles.multiline]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.canvas },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  brand: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  logo: { width: 46, height: 46, borderRadius: 12 },
  storyTitle: { color: theme.accent, fontSize: 19, fontWeight: '700', flexShrink: 1 },
  heading: { color: theme.ink, fontSize: 31, fontWeight: '700' },
  caption: { color: theme.muted, fontSize: 15, fontWeight: '500' },
  cardTitle: { color: theme.ink, fontSize: 21, fontWeight: '700' },
  body: { color: theme.ink, fontSize: 22, lineHeight: 33 },
  largeHeading: { fontSize: 37 },
  largeBody: { fontSize: 29, lineHeight: 42 },
  storyLink: { gap: 6 },
  input: {
    minHeight: 48, backgroundColor: theme.white, borderWidth: 1, borderColor: theme.line,
    borderRadius: 10, color: theme.ink, fontSize: 18, paddingHorizontal: 12, paddingVertical: 10,
  },
  multiline: { minHeight: 108, textAlignVertical: 'top' },
  setting: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    backgroundColor: theme.white, padding: 12, borderRadius: 12,
  },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: theme.white, borderColor: theme.line, borderWidth: 1, minHeight: 48,
    justifyContent: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8,
  },
  selectedChip: { backgroundColor: theme.accent, borderColor: theme.accent },
  chipText: { color: theme.accent, fontSize: 16, fontWeight: '600' },
  card: {
    backgroundColor: theme.white, borderColor: theme.line, borderWidth: 1,
    borderRadius: 17, padding: 18, gap: 6,
  },
  illustration: { width: '100%', height: 160, borderRadius: 16, backgroundColor: theme.pale, resizeMode: 'contain' },
  controls: { gap: 10 },
  button: {
    backgroundColor: theme.accent, minHeight: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
  },
  secondary: { backgroundColor: theme.white, borderColor: theme.line, borderWidth: 1 },
  buttonText: { color: theme.white, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  secondaryText: { color: theme.accent },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.6 },
  error: { color: '#8A2838', fontSize: 16 },
});
