import "server-only";

type CsvCell = string | number | boolean | null | undefined;

export interface ParsedCsvRow {
  rowNumber: number;
  values: Record<string, string>;
}

const FORMULA_PREFIX_PATTERN = /^[=+\-@]/;

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function escapeCsvCell(value: CsvCell) {
  if (value === null || value === undefined) {
    return "";
  }

  const normalizedValue = normalizeLineEndings(String(value));
  const safeValue =
    typeof value === "string" && FORMULA_PREFIX_PATTERN.test(normalizedValue)
      ? `'${normalizedValue}`
      : normalizedValue;

  if (/[",\n]/.test(safeValue)) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }

  return safeValue;
}

function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseCsvMatrix(text: string) {
  const rows: string[][] = [];
  const normalizedText = normalizeLineEndings(text);
  let currentValue = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < normalizedText.length; index += 1) {
    const character = normalizedText[index];
    const nextCharacter = normalizedText[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (character === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (character === "\n" && !inQuotes) {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  currentRow.push(currentValue);
  rows.push(currentRow);

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
}

export function parseCsv(text: string): {
  headers: string[];
  rows: ParsedCsvRow[];
} {
  const matrix = parseCsvMatrix(text);

  if (matrix.length === 0) {
    throw new Error("The CSV file is empty.");
  }

  const [rawHeaders, ...rawRows] = matrix;
  const headers = rawHeaders.map(normalizeHeader);

  if (!headers.some(Boolean)) {
    throw new Error("The CSV file needs a header row.");
  }

  const duplicates = headers.filter(
    (header, index) => header && headers.indexOf(header) !== index,
  );

  if (duplicates.length > 0) {
    throw new Error(
      `The CSV file has duplicate columns: ${Array.from(new Set(duplicates)).join(", ")}.`,
    );
  }

  const rows = rawRows.flatMap((rawRow, index) => {
    const values = headers.reduce<Record<string, string>>((result, header, headerIndex) => {
      if (!header) {
        return result;
      }

      result[header] = (rawRow[headerIndex] ?? "").trim();
      return result;
    }, {});

    if (!Object.values(values).some(Boolean)) {
      return [];
    }

    return [
      {
        rowNumber: index + 2,
        values,
      },
    ];
  });

  return {
    headers,
    rows,
  };
}

export function buildCsv(
  headers: string[],
  rows: Array<Record<string, CsvCell>>,
) {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvCell(row[header])).join(","),
    ),
  ];

  return `\uFEFF${lines.join("\r\n")}`;
}

export function createCsvDownloadResponse(filename: string, csv: string) {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
