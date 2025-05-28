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
