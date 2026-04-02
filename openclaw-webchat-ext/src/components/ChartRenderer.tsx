import { GPTVis } from '@antv/gpt-vis';

interface ChartRendererProps {
  visSyntax: string;
}

export default function ChartRenderer({ visSyntax }: ChartRendererProps) {
  return (
    <div
      style={{
        padding: 'var(--spacing-md)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        margin: 'var(--spacing-sm) 0',
        overflow: 'hidden',
      }}
    >
      <GPTVis>{visSyntax}</GPTVis>
    </div>
  );
}
