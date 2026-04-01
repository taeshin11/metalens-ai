'use client';

import { ExtractedData } from '@/lib/data-extraction';
import { PUBMED_BASE } from '@/lib/constants';

interface DataTableProps {
  data: ExtractedData[];
}

export default function DataTable({ data }: DataTableProps) {
  const hasData = data.some(d => d.effectSize !== null || d.sampleSize !== null);

  if (!hasData) {
    return (
      <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">
        No numerical data could be extracted from these abstracts.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-[var(--color-border)]">
            <th className="text-left py-2 pr-3 font-medium text-[var(--color-text-secondary)]">Study</th>
            <th className="text-right py-2 px-2 font-medium text-[var(--color-text-secondary)]">N</th>
            <th className="text-right py-2 px-2 font-medium text-[var(--color-text-secondary)]">Effect</th>
            <th className="text-right py-2 px-2 font-medium text-[var(--color-text-secondary)]">Type</th>
            <th className="text-right py-2 px-2 font-medium text-[var(--color-text-secondary)]">95% CI</th>
            <th className="text-right py-2 px-2 font-medium text-[var(--color-text-secondary)]">p-value</th>
            <th className="text-left py-2 pl-3 font-medium text-[var(--color-text-secondary)]">Outcome</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.pmid || i} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-primary)]/50">
              <td className="py-2 pr-3">
                <a
                  href={`${PUBMED_BASE}/${row.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] font-medium"
                >
                  {row.firstAuthor} {row.year}
                </a>
              </td>
              <td className="py-2 px-2 text-right font-mono text-[var(--color-text-primary)]">
                {row.sampleSize ?? '—'}
              </td>
              <td className="py-2 px-2 text-right font-mono font-semibold text-[var(--color-text-primary)]">
                {row.effectSize !== null ? row.effectSize.toFixed(2) : '—'}
              </td>
              <td className="py-2 px-2 text-right">
                {row.effectType !== 'other' ? (
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]">
                    {row.effectType}
                  </span>
                ) : '—'}
              </td>
              <td className="py-2 px-2 text-right font-mono text-xs text-[var(--color-text-secondary)]">
                {row.ciLower !== null && row.ciUpper !== null
                  ? `[${row.ciLower.toFixed(2)}, ${row.ciUpper.toFixed(2)}]`
                  : '—'}
              </td>
              <td className="py-2 px-2 text-right font-mono text-xs">
                {row.pValue !== null ? (
                  <span className={row.pValue < 0.05 ? 'text-[var(--color-success)] font-semibold' : 'text-[var(--color-text-muted)]'}>
                    {row.pValue < 0.001 ? '<0.001' : row.pValue.toFixed(3)}
                  </span>
                ) : '—'}
              </td>
              <td className="py-2 pl-3 text-xs text-[var(--color-text-secondary)] max-w-[150px] truncate">
                {row.outcome || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
