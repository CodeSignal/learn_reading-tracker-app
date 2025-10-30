// Local lightweight UUID v4 shim to avoid external dependency issues.
// This is sufficient for demo/testing purposes and not cryptographically secure.
export function v4(): string {
  // RFC4122-ish template
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export { v4 as uuidv4 };

