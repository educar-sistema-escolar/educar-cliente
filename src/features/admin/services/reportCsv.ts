/** RFC 4180 quoting plus spreadsheet formula-injection protection. */
export function reportCsv(headers: string[], rows: string[][]): string {
  const cell = (value: string) => '"' + (/^[\s]*[=+@-]/.test(value) ? "'" + value : value).replace(/"/g, '""') + '"';
  return [headers, ...rows].map(row => row.map(cell).join(',')).join('\r\n');
}
