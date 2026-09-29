export function csvCell(value: unknown) {
    const text = value === null || value === undefined ? '' : String(value);
    const neutralized = /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text;
    return `"${neutralized.replace(/"/g, '""')}"`;
}

export function csvRow(values: unknown[]) {
    return values.map(csvCell).join(',');
}
