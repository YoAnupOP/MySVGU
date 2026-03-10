export function extractAttendanceFromDom(studentId, tableSelector) {
  function normalizeText(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseNumber(value) {
    const normalized = normalizeText(value).replace(/,/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function roundToTwo(value) {
    return Math.round(value * 100) / 100;
  }

  function buildGrid(table) {
    const rows = Array.from(table.querySelectorAll("tr"));
    const grid = [];

    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.children).filter(
        (cell) => cell.tagName === "TD" || cell.tagName === "TH",
      );

      if (!grid[rowIndex]) {
        grid[rowIndex] = [];
      }

      let columnIndex = 0;

      cells.forEach((cell) => {
        while (grid[rowIndex][columnIndex] !== undefined) {
          columnIndex += 1;
        }

        const text = normalizeText(cell.textContent);
        const colspan = Number.parseInt(cell.getAttribute("colspan") || "1", 10) || 1;
        const rowspan = Number.parseInt(cell.getAttribute("rowspan") || "1", 10) || 1;

        for (let rowOffset = 0; rowOffset < rowspan; rowOffset += 1) {
          if (!grid[rowIndex + rowOffset]) {
            grid[rowIndex + rowOffset] = [];
          }

          for (let colOffset = 0; colOffset < colspan; colOffset += 1) {
            grid[rowIndex + rowOffset][columnIndex + colOffset] = text;
          }
        }

        columnIndex += colspan;
      });
    });

    return { rows, grid };
  }

  function buildColumnLabels(grid, headerRowCount) {
    const headerRows = grid.slice(0, headerRowCount);
    const width = headerRows.reduce((max, row) => Math.max(max, row.length), 0);
    const labels = [];

    for (let columnIndex = 0; columnIndex < width; columnIndex += 1) {
      const segments = [];

      for (const row of headerRows) {
        const text = normalizeText(row[columnIndex]);
        if (text && segments[segments.length - 1] !== text) {
          segments.push(text);
        }
      }

      labels.push(segments.join(" "));
    }

    return labels;
  }

  function stripMetricSuffix(label, metric) {
    if (metric === "percentage") {
      return normalizeText(label.replace(/\s*(percentage|%)$/i, ""));
    }

    if (metric === "present") {
      return normalizeText(label.replace(/\s*(present|attended)$/i, ""));
    }

    return normalizeText(label.replace(/\s*(total|lectures?|held)$/i, ""));
  }

  function describeColumn(label) {
    const normalizedLabel = normalizeText(label);
    const lowerLabel = normalizedLabel.toLowerCase();

    if (!normalizedLabel) {
      return null;
    }

    if (lowerLabel.includes("roll") || lowerLabel.includes("student id")) {
      return { kind: "id" };
    }

    if (lowerLabel === "name" || lowerLabel.includes("student name")) {
      return { kind: "name" };
    }

    let metric = null;
    if (/(percentage|%)$/i.test(normalizedLabel)) {
      metric = "percentage";
    } else if (/(present|attended)$/i.test(normalizedLabel)) {
      metric = "present";
    } else if (/(total|lectures?|held)$/i.test(normalizedLabel)) {
      metric = "total";
    }

    if (!metric) {
      return null;
    }

    return {
      kind: "metric",
      metric,
      subjectName: stripMetricSuffix(normalizedLabel, metric),
    };
  }

  function isSummaryLabel(label) {
    const normalized = label.toLowerCase();
    return ["total", "overall", "summary", "extra", "considered", "with extra"].some(
      (keyword) => normalized === keyword || normalized.startsWith(`${keyword} `),
    );
  }

  const table = document.querySelector(tableSelector);
  if (!table) {
    return null;
  }

  const { rows, grid } = buildGrid(table);
  const dataStartIndex = rows.findIndex((row) => row.querySelector("td"));

  if (dataStartIndex === -1) {
    return null;
  }

  const labels = buildColumnLabels(grid, dataStartIndex);
  let dataRow = null;

  for (let rowIndex = dataStartIndex; rowIndex < grid.length; rowIndex += 1) {
    const row = grid[rowIndex];
    if (!row) {
      continue;
    }

    const leadingCells = row.slice(0, 3).map(normalizeText);
    if (leadingCells.includes(studentId)) {
      dataRow = row;
      break;
    }
  }

  if (!dataRow) {
    const candidateRows = grid
      .slice(dataStartIndex)
      .filter((row) => Array.isArray(row) && row.some((cell) => normalizeText(cell)));

    if (candidateRows.length === 1) {
      dataRow = candidateRows[0];
    }
  }

  if (!dataRow) {
    return null;
  }

  const subjects = [];
  const subjectMap = new Map();

  labels.forEach((label, index) => {
    const descriptor = describeColumn(label);
    if (!descriptor || descriptor.kind !== "metric") {
      return;
    }

    if (!descriptor.subjectName || isSummaryLabel(descriptor.subjectName)) {
      return;
    }

    const current = subjectMap.get(descriptor.subjectName) || {
      name: descriptor.subjectName,
      present: 0,
      total: 0,
      percentage: 0,
      order: index,
    };

    current[descriptor.metric] = parseNumber(dataRow[index]);
    subjectMap.set(descriptor.subjectName, current);
  });

  for (const subject of subjectMap.values()) {
    if (!subject.total && !subject.present) {
      continue;
    }

    const percentage = subject.total
      ? roundToTwo((subject.present / subject.total) * 100)
      : roundToTwo(subject.percentage);

    subjects.push({
      name: subject.name,
      present: subject.present,
      total: subject.total,
      percentage,
      order: subject.order,
    });
  }

  subjects.sort((left, right) => left.order - right.order);

  const overallPresent = subjects.reduce((total, subject) => total + subject.present, 0);
  const overallTotal = subjects.reduce((total, subject) => total + subject.total, 0);

  return {
    student: {
      studentId,
      name: normalizeText(dataRow[1]) || studentId,
    },
    overall: {
      present: overallPresent,
      total: overallTotal,
      percentage: overallTotal ? roundToTwo((overallPresent / overallTotal) * 100) : 0,
    },
    subjects: subjects.map(({ order, ...subject }) => subject),
  };
}
