'use client';

import { useTranslations } from 'next-intl';
import { ExtractedData } from '@/lib/data-extraction';
import { PUBMED_BASE } from '@/lib/constants';
import { clog } from '@/lib/client-logger';

interface DataTableProps {
  data: ExtractedData[];
}

function exportCsv(data: ExtractedData[]) {
  clog.info('export_csv_start', 'DataTable', { rows: data.length });
  try {
    const headers = ['Study', 'PMID', 'Year', 'Sample Size', 'Effect Size', 'Effect Type', 'CI Lower', 'CI Upper', 'p-value', 'Outcome'];
    const rows = data.map(d => [
      `${d.firstAuthor} ${d.year}`,
      d.pmid,
      d.year,
      d.sampleSize ?? '',
      d.effectSize !== null ? d.effectSize.toFixed(4) : '',
      d.effectType !== 'other' ? d.effectType : '',
      d.ciLower !== null ? d.ciLower.toFixed(4) : '',
      d.ciUpper !== null ? d.ciUpper.toFixed(4) : '',
      d.pValue !== null ? d.pValue.toFixed(6) : '',
      d.outcome || '',
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metalens-extracted-data.csv';
    a.click();
    URL.revokeObjectURL(url);
    clog.info('export_csv_done', 'DataTable', { rows: data.length, bytes: blob.size });
  } catch (err) {
    clog.error('export_csv_failed', 'DataTable', err, { rows: data.length });
  }
}

function copyTable(data: ExtractedData[]) {
  clog.info('copy_table_start', 'DataTable', { rows: data.length });
  const headers = 'Study\tPMID\tN\tEffect\tType\t95% CI\tp-value\tOutcome';
  const rows = data.map(d =>
    [
      `${d.firstAuthor} ${d.year}`,
      d.pmid,
      d.sampleSize ?? '—',
      d.effectSize !== null ? d.effectSize.toFixed(2) : '—',
      d.effectType !== 'other' ? d.effectType : '—',
      d.ciLower !== null && d.ciUpper !== null ? `[${d.ciLower.toFixed(2)}, ${d.ciUpper.toFixed(2)}]` : '—',
      d.pValue !== null ? (d.pValue < 0.001 ? '<0.001' : d.pValue.toFixed(3)) : '—',
      d.outcome || '—',
    ].join('\t')
  );

  const payload = [headers, ...rows].join('\n');
  navigator.clipboard.writeText(payload).then(
    () => clog.info('copy_table_done', 'DataTable', { rows: data.length, bytes: payload.length }),
    (err) => clog.error('copy_table_failed', 'DataTable', err, { rows: data.length }),
  );
}

export default function DataTable({ data }: DataTableProps) {
  const t = useTranslations('dataTable');
  const hasData = data.some(d => d.effectSize !== null || d.sampleSize !== null);

  if (!hasData) {
    return (
      <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">
        {t('noData')}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-[var(--color-border)]">
              <th className="text-left py-2 pr-3 font-medium text-[var(--color-text-secondary)]">{t('study')}</th>
              <th className="text-right py-2 px-2 font-medium text-[var(--color-text-secondary)]">N</th>
              <th className="text-right py-2 px-2 font-medium text-[var(--color-text-secondary)]">{t('effect')}</th>
              <th className="text-right py-2 px-2 font-medium text-[var(--color-text-secondary)]">{t('type')}</th>
              <th className="text-right py-2 px-2 font-medium text-[var(--color-text-secondary)]">{t('ci')}</th>
              <th className="text-right py-2 px-2 font-medium text-[var(--color-text-secondary)]">{t('pvalue')}</th>
              <th className="text-left py-2 pl-3 font-medium text-[var(--color-text-secondary)]">{t('outcome')}</th>
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

      {/* Export buttons */}
      <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
        <button
          onClick={() => exportCsv(data)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          {t('exportCsv')}
        </button>
        <button
          onClick={() => { copyTable(data); }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          {t('copyTable')}
        </button>
      </div>
      <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-2">
        {t('exportHint')}
      </p>
    </div>
  );
}
