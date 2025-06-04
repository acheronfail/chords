export interface Device {
  id: string;
  name: string;
}

export async function getMidiDevices(): Promise<Device[]> {
  const access = await navigator.requestMIDIAccess();
  const devices: Device[] = [];
  for (const { id, name } of access.inputs.values()) {
    devices.push({ id, name: name ?? id });
  }

  return devices;
}

export async function getMidiDevice(
  id: string,
  callback: (err: Error | null, input: MIDIInput | null) => void,
) {
  const access = await navigator.requestMIDIAccess();
  for (const input of access.inputs.values()) {
    if (input.id === id) {
      callback(null, input);
      return;
    }
  }

  callback(new Error(`MIDI device with id ${id} not found`), null);
}

export function intervals(keys: number[]) {
  const min = Math.min(...keys);
  return keys.map((n) => n - min);
}

export function keysMatch(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}
