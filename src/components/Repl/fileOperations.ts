const FILE_TYPES = [
  { description: 'Strudel Files', accept: { 'text/plain': ['.str'] } },
  { description: 'JavaScript Files', accept: { 'text/javascript': ['.js'] } },
];

export function supportsFileSystemAccess(): boolean {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
}

export async function saveFile(
  code: string,
  existingHandle?: FileSystemFileHandle | null,
): Promise<FileSystemFileHandle | null> {
  // If we have an existing handle, write directly to it
  if (existingHandle) {
    try {
      const writable = await existingHandle.createWritable();
      await writable.write(code);
      await writable.close();
      return existingHandle;
    } catch {
      // Handle may be stale, fall through to saveAs
    }
  }
  return saveFileAs(code);
}

export async function saveFileAs(code: string): Promise<FileSystemFileHandle | null> {
  if (supportsFileSystemAccess()) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: 'pattern.str',
        types: FILE_TYPES,
      });
      const writable = await handle.createWritable();
      await writable.write(code);
      await writable.close();
      return handle;
    } catch (e: any) {
      if (e?.name === 'AbortError') return null; // User cancelled
      throw e;
    }
  }
  // Fallback: download
  downloadFile(code, 'pattern.str');
  return null;
}

export async function openFile(): Promise<{ name: string; code: string; handle: FileSystemFileHandle | null } | null> {
  if (supportsFileSystemAccess()) {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: FILE_TYPES,
        multiple: false,
      });
      const file = await handle.getFile();
      const code = await file.text();
      return { name: file.name.replace(/\.(str|js)$/, ''), code, handle };
    } catch (e: any) {
      if (e?.name === 'AbortError') return null;
      throw e;
    }
  }
  // Fallback: file input
  return openFileFallback();
}

function downloadFile(code: string, filename: string): void {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function openFileFallback(): Promise<{ name: string; code: string; handle: null } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.str,.js,.txt';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const code = await file.text();
      resolve({ name: file.name.replace(/\.(str|js|txt)$/, ''), code, handle: null });
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
