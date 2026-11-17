import { openDatabaseAsync } from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo, ActivityIndicator, Alert, Appearance, BackHandler, findNodeHandle, Image, Linking,
  Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, useColorScheme, View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  deleteStory, initialize, loadAppSettings, loadLibrary, loadSettings, loadStory, saveAppSettings, saveProgress, saveSettings, saveStory, setFavorite, themeOptions,
} from './src/database';
import type { AppSettings, Draft, Listing, ReadingSettings, Scene } from './src/database';
import { languages, translate } from './src/i18n';
import type { Language, Message } from './src/i18n';

const developerEmail = 'valdenor.sa@proton.me';
const catalogCategories = new Map<string, Message>([
  ['Saúde', 'health'], ['Bem-estar', 'wellbeing'], ['Trabalho', 'work'],
  ['Transporte', 'transport'], ['Dia a dia', 'dailyLife'], ['Convivência', 'socialLife'],
]);

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
  ['', 'noImage'], ['calendar', 'calendar'], ['door', 'door'], ['chair', 'chair'],
  ['pause', 'pause'], ['done', 'done'], ['sound', 'sound'], ['note', 'note'],
] as const;
const emptyScene: Scene = { illustration: '', title: '', text: '' };
type EditorScene = Scene & { key: number };
type Editor = Omit<Draft, 'scenes'> & { id?: string; scenes: EditorScene[] };

function searchable(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
type Reader = { story: Listing; scenes: Scene[]; position: number };
const lightTheme = {
  ink: '#19263E', muted: '#42546E', accent: '#214B73', canvas: '#F4F7FC',
  surface: '#FFFFFF', onAccent: '#FFFFFF', line: '#BBC9D9', pale: '#E3EDF7', error: '#8A2838',
};

const darkTheme: typeof lightTheme = {
  ink: '#F2F5FC', muted: '#B8C6DC', accent: '#9CCBFF', canvas: '#111827',
  surface: '#202C40', onAccent: '#122847', line: '#6E819D', pale: '#2C3E58', error: '#FFB3BD',
};

function Button({ label, action, secondary, disabled, accessibilityLabel, role = 'button' }: {
  label: string; action: () => void; secondary?: boolean; disabled?: boolean; accessibilityLabel?: string; role?: 'button' | 'link';
}) {
  const styles = useContext(StylesContext);
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel}
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
  return <SafeAreaProvider><AppContent /></SafeAreaProvider>;
}

function AppContent() {
  const db = useRef<SQLiteDatabase | null>(null);
  const pending = useRef(false);
  const heading = useRef<Text>(null);
  const scroller = useRef<ScrollView>(null);
  const [library, setLibrary] = useState<Listing[] | null>(null);
  const [reader, setReader] = useState<Reader | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const nextSceneKey = useRef(0);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [settings, setSettings] = useState<ReadingSettings>({ large_text: 0, hide_images: 0 });
  const [appSettings, setAppSettings] = useState<AppSettings>({ language: 'pt', theme: 'light' });
  const systemScheme = useColorScheme();
  const dark = appSettings.theme === 'dark' || (appSettings.theme === 'system' && systemScheme === 'dark');
  const theme = dark ? darkTheme : lightTheme;
  const styles = dark ? darkStyles : lightStyles;
  const t = (message: Message, values?: Record<string, string | number>) =>
    translate(appSettings.language, message, values);
  const editorChanged = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Message | null>(null);
  const moveFocus = useRef(false);

  async function perform(action: () => Promise<void>, message: Message) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
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
      setAppSettings(await loadAppSettings(db.current));
      setLibrary(await loadLibrary(db.current));
    }, 'libraryError');
  }

  useEffect(start, []);
  useEffect(() => {
    Appearance.setColorScheme(appSettings.theme === 'system' ? 'unspecified' : appSettings.theme);
  }, [appSettings.theme]);

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
    setError(null);
    moveFocus.current = true;
    setReader(null);
  }

  function closePanel() {
    if (pending.current) return;
    if (editing && editorChanged.current) {
      Alert.alert(t('discardQuestion'), t('unsaved'), [
        { text: t('keepEditing'), style: 'cancel' },
        { text: t('discard'), style: 'destructive', onPress: returnToLibrary },
      ]);
      return;
    }
    returnToLibrary();
  }

  function returnToLibrary() {
    moveFocus.current = true;
    setError(null);
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
  }, [reading, editing, showSettings, appSettings.language]);

  function edit(story?: Listing) {
    const database = db.current;
    if (!database) return;
    void perform(async () => {
      const draft = story ? {
        id: story.id, title: story.title, category: story.category,
        scenes: (await loadStory(database, story.id)).scenes.map(keyScene),
      } : { title: '', category: '', scenes: [keyScene(emptyScene)] };
      editorChanged.current = false;
      moveFocus.current = true;
      setEditor(draft);
    }, 'editorError');
  }

  function keyScene(scene: Scene): EditorScene {
    return { ...scene, key: nextSceneKey.current++ };
  }

  function moveScene(index: number, offset: -1 | 1) {
    if (!editor || pending.current) return;
    const destination = index + offset;
    if (destination < 0 || destination >= editor.scenes.length) return;
    const scenes = [...editor.scenes];
    const moved = scenes[index];
    scenes[index] = scenes[destination];
    scenes[destination] = moved;
    updateDraft({ scenes });
    AccessibilityInfo.announceForAccessibility(
      t('sceneMoved', { name: moved.title.trim() || t('scene', { n: index + 1 }), n: destination + 1, total: scenes.length }),
    );
  }

  function confirmDelete(story: Listing) {
    const database = db.current;
    if (!database || !story.custom || pending.current) return;
    Alert.alert(t('deleteQuestion'), t('deleteDetails', { title: story.title }), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => {
        void perform(async () => {
          await deleteStory(database, story.id);
          const updated = await loadLibrary(database);
          setLibrary(updated);
          if (!updated.some((item) => item.category === category)) setCategory(null);
        }, 'deleteError');
      } },
    ], { cancelable: true });
  }

  function updateDraft(update: Partial<Editor>) {
    if (!editor || pending.current) return;
    editorChanged.current = true;
    setEditor({ ...editor, ...update });
  }

  function submit() {
    const database = db.current;
    if (!editor || !database) return;
    if (!editor.title.trim() || !editor.category.trim() ||
        editor.scenes.some(({ title, text }) => !title.trim() || !text.trim())) {
      setError('required');
      scroller.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    void perform(async () => {
      await saveStory(database, editor, editor.id);
      setLibrary(await loadLibrary(database));
      setCategory(null);
      setQuery('');
      setFavoriteOnly(false);
      returnToLibrary();
    }, 'saveError');
  }

  function toggleFavorite(story: Listing) {
    const database = db.current;
    if (!database) return;
    void perform(async () => {
      await setFavorite(database, story.id, !story.favorite);
      setLibrary((current) => current?.map((item) =>
        item.id === story.id ? { ...item, favorite: Number(!story.favorite) } : item) ?? null);
    }, 'favoriteError');
  }

  function changeSetting(key: keyof ReadingSettings, value: boolean) {
    const database = db.current;
    if (!database) return;
    const updated = { ...settings, [key]: Number(value) };
    void perform(async () => {
      await saveSettings(database, updated);
      setSettings(updated);
    }, 'savePreferenceError');
  }

  function changeAppearance(update: Partial<AppSettings>) {
    const database = db.current;
    if (!database) return;
    const updated = { ...appSettings, ...update };
    void perform(async () => {
      await saveAppSettings(database, updated);
      setAppSettings(updated);
    }, 'savePreferenceError');
  }

  function contactDeveloper() {
    setError(null);
    void Linking.openURL(`mailto:${developerEmail}`).catch(() => setError('emailError'));
  }

  function open(story: Listing) {
    const database = db.current;
    if (!database) return;
    void perform(async () => {
      const saved = await loadStory(database, story.id);
      moveFocus.current = true;
      setReader({ story, ...saved });
    }, 'storyError');
  }

  function goTo(position: number) {
    const database = db.current;
    if (!reader || !database) return;
    const finished = position === reader.scenes.length;
    void perform(async () => {
      await saveProgress(database, reader.story.id, finished ? reader.position : position, finished);
      moveFocus.current = true;
      setReader(finished ? null : { ...reader, position });
    }, 'progressError');
  }

  const scene = reader?.scenes[reader.position];
  const categories = [...new Set(library?.map((story) => story.category))];
  const search = searchable(query);
  function categoryLabel(name: string) {
    const message = catalogCategories.get(name);
    return message ? t(message) : name;
  }
  const visible = library?.filter((story) =>
    (category === null || story.category === category) &&
    (!favoriteOnly || !!story.favorite) &&
    searchable(`${story.title} ${story.category} ${categoryLabel(story.category)}`).includes(search));

  return (
    <StylesContext.Provider value={styles}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <ScrollView ref={scroller} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{t(error)}</Text> : null}
          {editor ? (
            <>
              <Button label={t('back')} action={closePanel} secondary disabled={busy} />
              <Text accessible ref={heading} accessibilityRole="header" style={styles.heading}>
                {editor.id ? t('editStory') : t('newStory')}
              </Text>
              <Field label={t('title')} value={editor.title} change={(title) => updateDraft({ title })} />
              <Field label={t('category')} value={editor.category} change={(category) => updateDraft({ category })} />
              {editor.scenes.map((item, index) => {
                const updateScene = (patch: Partial<Scene>) => updateDraft({
                  scenes: editor.scenes.map((entry, position) => position === index ? { ...entry, ...patch } : entry),
                });
                const label = t('scene', { n: index + 1 });
                return (
                  <View key={item.key} style={styles.card}>
                    <Text accessibilityRole="header" style={styles.cardTitle}>{label}</Text>
                    <Field label={t('sceneTitle', { n: index + 1 })} value={item.title}
                      change={(title) => updateScene({ title })} />
                    <Field label={t('sceneText', { n: index + 1 })} value={item.text} multiline
                      change={(text) => updateScene({ text })} />
                    <Text style={styles.caption}>{t('sceneIllustration', { n: index + 1 })}</Text>
                    <View style={styles.categories}>
                      {illustrationOptions.map(([value, name]) => (
                        <Choice key={value} label={t(name)} selected={item.illustration === value}
                          action={() => updateScene({ illustration: value })} />
                      ))}
                    </View>
                    {editor.scenes.length > 1 && (
                      <View style={styles.categories}>
                        <Button label={t('moveUp', { n: index + 1 })} secondary
                          disabled={busy || index === 0} action={() => moveScene(index, -1)} />
                        <Button label={t('moveDown', { n: index + 1 })} secondary
                          disabled={busy || index === editor.scenes.length - 1} action={() => moveScene(index, 1)} />
                      </View>
                    )}
                    {editor.scenes.length > 1 && <Button label={t('removeScene', { n: index + 1 })} secondary
                      action={() => updateDraft({ scenes: editor.scenes.filter((_, position) => index !== position) })} />}
                  </View>
                );
              })}
              <Button label={t('addScene')} secondary action={() => updateDraft({ scenes: [...editor.scenes, keyScene(emptyScene)] })} />
              <Button label={t('save')} action={submit} disabled={busy} />
            </>
          ) : showSettings ? (
            <>
              <Button label={t('back')} action={closePanel} secondary disabled={busy} />
              <Text accessible ref={heading} accessibilityRole="header" style={styles.heading}>{t('settings')}</Text>
              <View style={styles.card}>
                <Text accessibilityRole="header" style={styles.cardTitle}>{t('language')}</Text>
                <View style={styles.categories}>
                  {(Object.keys(languages) as Language[]).map((language) => (
                    <Choice key={language} label={languages[language]} selected={appSettings.language === language}
                      disabled={busy} action={() => changeAppearance({ language })} />
                  ))}
                </View>
              </View>
              <View style={styles.card}>
                <Text accessibilityRole="header" style={styles.cardTitle}>{t('theme')}</Text>
                <View style={styles.categories}>
                  {themeOptions.map((mode) => (
                    <Choice key={mode} label={t(mode)} selected={appSettings.theme === mode}
                      disabled={busy} action={() => changeAppearance({ theme: mode })} />
                  ))}
                </View>
              </View>
              <Text accessibilityRole="header" style={styles.cardTitle}>{t('reading')}</Text>
              <Setting label={t('larger')} value={!!settings.large_text} disabled={busy}
                change={(value) => changeSetting('large_text', value)} />
              <Setting label={t('hide')} value={!!settings.hide_images} disabled={busy}
                change={(value) => changeSetting('hide_images', value)} />
              <View style={styles.card}>
                <Text accessibilityRole="header" style={styles.cardTitle}>{t('contact')}</Text>
                <Button role="link" label={developerEmail} action={contactDeveloper} secondary />
              </View>
            </>
          ) : reader && scene ? (
            <>
              <Button label={t('back')} action={leave} secondary disabled={busy} />
              <Text style={styles.storyTitle}>{reader.story.title}</Text>
              <Text importantForAccessibility="no" style={styles.caption}>{t('scenePosition', { n: reader.position + 1, total: reader.scenes.length })}</Text>
              <Text accessible ref={heading} accessibilityRole="header"
                accessibilityLabel={`${t('scenePosition', { n: reader.position + 1, total: reader.scenes.length })}. ${scene.title}`}
                style={[styles.heading, settings.large_text ? styles.largeHeading : null]}>{scene.title}</Text>
              {!settings.hide_images && illustrations[scene.illustration] && (
                <Image accessible={false} source={illustrations[scene.illustration]} style={styles.illustration} />
              )}
              <Text style={[styles.body, settings.large_text ? styles.largeBody : null]}>{scene.text}</Text>
              <View style={styles.controls}>
                {reader.position > 0 && (
                  <Button label={t('previous')} action={() => goTo(reader.position - 1)} secondary disabled={busy} />
                )}
                <Button
                  label={reader.position === reader.scenes.length - 1 ? t('finish') : t('next')}
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
              <Text accessible ref={heading} accessibilityRole="header" style={styles.heading}>{t('library')}</Text>
              {library ? (
                <>
                  <View style={styles.categories}>
                    <Button label={t('newStory')} action={() => edit()} disabled={busy} />
                    <Button label={t('settings')} action={() => {
                      setError(null);
                      moveFocus.current = true;
                      setShowSettings(true);
                    }} secondary disabled={busy} />
                  </View>
                  <Field label={t('search')} value={query} change={setQuery} />
                  <View style={styles.categories}>
                    <Choice label={t('all')} selected={category === null} action={() => setCategory(null)} />
                    <Choice label={t('favorites')} selected={favoriteOnly} action={() => setFavoriteOnly(!favoriteOnly)} />
                    {categories.map((name) => (
                      <Choice key={name} label={name === 'Todas' ? `${t('category')} ${name}` : categoryLabel(name)} selected={category === name} action={() => setCategory(name)} />
                    ))}
                  </View>
                  {visible?.map((story) => (
                    <View key={story.id} style={styles.card}>
                      <Pressable accessibilityRole="button" disabled={busy}
                        accessibilityState={{ disabled: busy }}
                        style={({ pressed }) => [styles.storyLink, pressed && styles.pressed]}
                        onPress={() => open(story)}>
                        <Text style={styles.caption}>{categoryLabel(story.category)} · {t(story.count === 1 ? 'sceneCount' : 'scenesCount', { n: story.count })}</Text>
                        <Text style={styles.cardTitle}>{story.title}</Text>
                      </Pressable>
                      <View style={styles.categories}>
                        <Choice label={story.favorite ? t('unfavorite') : t('favorite')}
                          accessibilityLabel={`${story.favorite ? t('unfavorite') : t('favorite')}: ${story.title}`}
                          selected={!!story.favorite} disabled={busy} action={() => toggleFavorite(story)} />
                        {!!story.custom && (
                          <>
                            <Button label={t('editStory')} accessibilityLabel={`${t('editStory')}: ${story.title}`}
                              action={() => edit(story)} secondary disabled={busy} />
                            <Button label={t('deleteStory')} accessibilityLabel={`${t('deleteStory')}: ${story.title}`}
                              action={() => confirmDelete(story)} secondary disabled={busy} />
                          </>
                        )}
                      </View>
                    </View>
                  ))}
                  {!visible?.length && <Text style={styles.caption}>{t('empty')}</Text>}
                </>
              ) : busy || !error ? (
                <ActivityIndicator accessibilityLabel={t('loading')} color={theme.accent} />
              ) : <Button label={t('retry')} action={start} />}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </StylesContext.Provider>
  );
}

function Choice({ label, selected, action, accessibilityLabel, disabled }: {
  label: string; selected: boolean; action: () => void; accessibilityLabel?: string; disabled?: boolean;
}) {
  const styles = useContext(StylesContext);
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
  const styles = useContext(StylesContext);
  return (
    <Pressable style={styles.setting} accessibilityLabel={label} accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }} disabled={disabled} onPress={() => change(!value)}>
      <Text style={[styles.cardTitle, styles.settingLabel]}>{label}</Text>
      <View pointerEvents="none" importantForAccessibility="no-hide-descendants">
        <Switch value={value} disabled={disabled} />
      </View>
    </Pressable>
  );
}

function Field({ label, value, change, multiline }: {
  label: string; value: string; change: (value: string) => void; multiline?: boolean;
}) {
  const styles = useContext(StylesContext);
  return (
    <View style={styles.storyLink}>
      <Text importantForAccessibility="no" style={styles.caption}>{label}</Text>
      <TextInput accessibilityLabel={label} value={value} onChangeText={change}
        multiline={multiline} style={[styles.input, multiline && styles.multiline]} />
    </View>
  );
}

function createStyles(theme: typeof lightTheme) {
  return StyleSheet.create({
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
      minHeight: 48, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line,
      borderRadius: 10, color: theme.ink, fontSize: 18, paddingHorizontal: 12, paddingVertical: 10,
    },
    multiline: { minHeight: 108, textAlignVertical: 'top' },
    settingLabel: { flexShrink: 1 },
    setting: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      backgroundColor: theme.surface, padding: 12, borderRadius: 12,
    },
    categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, minHeight: 48,
      justifyContent: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8,
    },
    selectedChip: { backgroundColor: theme.accent, borderColor: theme.accent },
    chipText: { color: theme.accent, fontSize: 16, fontWeight: '600' },
    card: {
      backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1,
      borderRadius: 17, padding: 18, gap: 6,
    },
    illustration: { width: '100%', height: 160, borderRadius: 16, backgroundColor: theme.pale, resizeMode: 'contain' },
    controls: { gap: 10 },
    button: {
      backgroundColor: theme.accent, minHeight: 48, borderRadius: 12,
      justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    },
    secondary: { backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1 },
    buttonText: { color: theme.onAccent, fontSize: 16, fontWeight: '700', textAlign: 'center' },
    secondaryText: { color: theme.accent },
    pressed: { opacity: 0.75 },
    disabled: { opacity: 0.6 },
    error: { color: theme.error, fontSize: 16 },
  });
}

const lightStyles = createStyles(lightTheme);
const darkStyles = createStyles(darkTheme);
const StylesContext = createContext(lightStyles);
