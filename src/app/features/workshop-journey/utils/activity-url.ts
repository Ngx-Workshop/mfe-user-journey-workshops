export function activityUrl(base: string, key: 'test' | 'lab', id?: string): string | null {
  if (!id) return null;
  const [path, query] = base.split('?');
  const params = new URLSearchParams(query);
  params.set(key, id);
  return path + '?' + params.toString();
}
