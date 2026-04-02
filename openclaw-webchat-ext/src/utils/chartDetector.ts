export type DataType =
  | 'time-series'
  | 'comparison'
  | 'proportion'
  | 'distribution'
  | 'ranking'
  | 'relationship'
  | 'hierarchical';

const TIME_FIELD_PATTERN = /time|date|年|月|日|季度|时刻|timestamp/i;

function isNumeric(val: unknown): val is number {
  return typeof val === 'number' && !isNaN(val);
}

function extractNumericValues(data: Record<string, any>[]): number[] {
  const values: number[] = [];
  data.forEach(item => {
    Object.values(item).forEach(v => {
      if (isNumeric(v)) values.push(v);
    });
  });
  return values;
}

export function detectDataType(data: Record<string, any>[]): DataType {
  if (!data || data.length === 0) return 'comparison';

  const keys = Object.keys(data[0] || {});

  const hasTimeField = keys.some(k => TIME_FIELD_PATTERN.test(k));
  if (hasTimeField && data.length > 2) return 'time-series';

  const hasChildren = data.some(d => d.children && Array.isArray(d.children));
  if (hasChildren) return 'hierarchical';

  const numericValues = extractNumericValues(data);
  if (numericValues.length > 0) {
    const sum = numericValues.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 100) < 15 || (Math.abs(sum - 1) < 0.15 && sum > 0)) {
      return 'proportion';
    }
  }

  const numericKeys = keys.filter(k => {
    return data.every(d => isNumeric(d[k]));
  });

  if (numericKeys.length >= 3 && data.length <= 10) return 'relationship';

  if (keys.length === 2 && data.length <= 12) return 'comparison';

  if (data.length <= 8 && numericKeys.length >= 2) return 'distribution';

  return 'comparison';
}

const CHART_TYPE_MAP: Record<DataType, string> = {
  'time-series': 'line',
  'comparison': 'bar',
  'proportion': 'pie',
  'distribution': 'scatter',
  'ranking': 'bar',
  'relationship': 'radar',
  'hierarchical': 'tree',
};

export function generateVisSyntax(data: any[], dataType: DataType): string {
  const chartType = CHART_TYPE_MAP[dataType];
  const keys = Object.keys(data[0] || {});

  if (dataType === 'hierarchical') {
    const buildHierarchy = (node: any, indent: string = '  '): string => {
      let lines = `${indent}- name ${node.name || node[keys[0]] || ''}`;
      if (node.value !== undefined) {
        lines += `\n${indent}  value ${node.value}`;
      }
      if (node.children && node.children.length > 0) {
        lines += '\n' + indent + '  children';
        node.children.forEach((child: any) => {
          lines += '\n' + buildHierarchy(child, indent + '    ');
        });
      }
      return lines;
    };
    const dataStr = data.map(item => buildHierarchy(item)).join('\n');
    return `vis ${chartType}\ndata\n${dataStr}`;
  }

  const valueKey = keys.find(k => data.every(d => isNumeric(d[k]))) || keys[1] || 'value';
  const labelKey = keys.find(k => k !== valueKey) || keys[0] || 'label';

  const dataStr = data
    .map(item => `  - ${labelKey} ${item[labelKey]}\n    ${valueKey} ${item[valueKey]}`)
    .join('\n');

  return `vis ${chartType}\ndata\n${dataStr}`;
}

export interface ChartData {
  data: any[];
  dataType: DataType;
  visSyntax: string;
}

const CHART_BLOCK_REGEX = /```(?:chart|vis)\s*\n([\s\S]*?)```/;

export function extractChartData(content: string): ChartData | null {
  const match = content.match(CHART_BLOCK_REGEX);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1].trim());
    const dataArray = Array.isArray(parsed) ? parsed : [parsed];
    if (dataArray.length === 0) return null;

    const dataType = detectDataType(dataArray);
    const visSyntax = generateVisSyntax(dataArray, dataType);

    return { data: dataArray, dataType, visSyntax };
  } catch {
    return null;
  }
}
