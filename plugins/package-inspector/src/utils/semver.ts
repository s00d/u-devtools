export function getVersionColor(
  current: string,
  latest: string
): 'gray' | 'green' | 'yellow' | 'red' {
  if (!current || !latest) return 'gray';
  if (current === latest) return 'green';

  const currentParts = current.replace(/[^0-9.]/g, '').split('.');
  const latestParts = latest.replace(/[^0-9.]/g, '').split('.');

  // Major update
  if (currentParts[0] !== latestParts[0]) return 'red';
  // Minor update
  if (currentParts[1] !== latestParts[1]) return 'yellow';

  return 'gray'; // Patch or same
}
