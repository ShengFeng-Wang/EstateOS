const MAX_PAGE_SIZE = 100;
const MAX_PAGES = 4; // supports up to 400 records, comfortably above the current portfolio size

export async function fetchAllPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<{ items: T[]; total: number }>,
): Promise<T[]> {
  const first = await fetchPage(1, MAX_PAGE_SIZE);
  const items = [...first.items];
  const totalPages = Math.min(MAX_PAGES, Math.ceil(first.total / MAX_PAGE_SIZE));

  for (let page = 2; page <= totalPages; page++) {
    const next = await fetchPage(page, MAX_PAGE_SIZE);
    items.push(...next.items);
  }

  return items;
}
