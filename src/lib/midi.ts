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

export async function getMidiDevice(id: string, callback: (input: MIDIInput) => void) {
  const access = await navigator.requestMIDIAccess();
  for (const input of access.inputs.values()) {
    if (input.id === id) {
      callback(input);
      break;
    }
  }
}
