import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportJSON(filename: string, payload: unknown): Promise<void> {
  const uri = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2));
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Compartir no está disponible en este dispositivo.');
  }
  await Sharing.shareAsync(uri);
}

export async function importJSON<T>(): Promise<T | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return null;
  const uri = result.assets[0].uri;
  const content = await FileSystem.readAsStringAsync(uri);
  return JSON.parse(content) as T;
}
