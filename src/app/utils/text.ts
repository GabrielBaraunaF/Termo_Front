export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Algo deu errado. Tente de novo.';
}
