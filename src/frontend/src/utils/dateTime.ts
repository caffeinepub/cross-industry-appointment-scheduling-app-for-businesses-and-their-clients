export function formatAppointmentDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatAppointmentTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timestampToDate(timestamp: bigint): Date {
  return new Date(Number(timestamp) / 1_000_000);
}

export function dateToTimestamp(date: Date): bigint {
  return BigInt(date.getTime() * 1_000_000);
}
