import { SearchFilters } from '@/components/KeywordInput';

/**
 * Build a PubMed query string with filters applied using field tags.
 * Example output: "asthma AND randomized controlled trial[pt] AND 2021:2026[dp] AND child[mh]"
 */
export function buildPubMedQuery(keywords: string, filters: SearchFilters): string {
  const parts: string[] = [keywords];

  // Study type filter → [pt] publication type tag
  if (filters.studyType) {
    parts.push(`${filters.studyType}[pt]`);
  }

  // Date range filter → [dp] date of publication
  if (filters.dateRange) {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - parseInt(filters.dateRange, 10);
    parts.push(`${startYear}:${currentYear}[dp]`);
  }

  // Age group filter → [mh] MeSH heading
  if (filters.ageGroup) {
    parts.push(`${filters.ageGroup}[mh]`);
  }

  return parts.join(' AND ');
}
