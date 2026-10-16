import { useState } from 'react';
import { Overlay } from '@/components/ui/Overlay';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

const TABLES = {
  tops: {
    head: ['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'],
    rows: [
      ['XS', '36', '26', '16.5'],
      ['S', '38', '27', '17'],
      ['M', '40', '28', '17.75'],
      ['L', '42', '29', '18.5'],
      ['XL', '44', '30', '19.25'],
      ['XXL', '46', '31', '20'],
    ],
  },
  bottoms: {
    head: ['Size', 'Waist (in)', 'Hip (in)', 'Inseam (in)'],
    rows: [
      ['24 / 28', '24–28', '35–38', '30'],
      ['26 / 30', '26–30', '37–40', '30.5'],
      ['28 / 32', '28–32', '39–42', '31'],
      ['30 / 34', '30–34', '41–44', '31.5'],
      ['32 / 36', '32–36', '43–46', '32'],
    ],
  },
  shoes: {
    head: ['UK', 'EU', 'US', 'Foot length (cm)'],
    rows: [
      ['6', '40', '7', '24.6'],
      ['7', '41', '8', '25.4'],
      ['8', '42', '9', '26.2'],
      ['9', '43', '10', '27.1'],
      ['10', '44', '11', '27.9'],
      ['11', '45', '12', '28.8'],
    ],
  },
};

type TableKey = keyof typeof TABLES;

const guess = (p?: Product): TableKey => {
  const first = p?.sizes[0]?.label ?? '';
  if (first.startsWith('UK')) return 'shoes';
  if (/^\d+$/.test(first) && Number(first) < 36) return 'bottoms';
  return 'tops';
};

export function SizeGuide({ open, onClose, product }: { open: boolean; onClose: () => void; product?: Product }) {
  const [tab, setTab] = useState<TableKey>(guess(product));
  const t = TABLES[tab];
  return (
    <Overlay open={open} onClose={onClose} label="Size guide" className="max-w-2xl">
      <div className="p-6 md:p-10">
        <p className="eyebrow text-muted">Fit help</p>
        <h2 className="h-display mt-2 text-4xl">Size guide</h2>
        <p className="mt-3 max-w-md text-sm text-ink-soft">
          Measurements are of the body, not the garment. Between sizes? Size up for a relaxed fit, down for a closer one.
        </p>
        <div className="mt-8 flex gap-6 border-b border-line">
          {(Object.keys(TABLES) as TableKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn('-mb-px border-b-2 pb-3 text-xs font-medium uppercase tracking-[0.16em] transition-colors', tab === k ? 'border-ink' : 'border-transparent text-muted')}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr>
                {t.head.map((h) => (
                  <th key={h} className="py-4 pr-4 text-xs font-medium uppercase tracking-wider text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r) => (
                <tr key={r[0]} className="border-t border-line">
                  {r.map((c, i) => (
                    <td key={i} className={cn('py-3.5 pr-4 tabular-nums', i === 0 && 'font-medium')}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Overlay>
  );
}
