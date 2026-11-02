(() => {
  "use strict";

  const datasetFiles = {
    tsv: "data/dataset.tsv",
    excel: "data/dataset.xlsx"
  };
  const previewLimit = 8;
  const menuToggle = document.querySelector("#menu-toggle");
  const navigation = document.querySelector("#site-nav");

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navigation.classList.toggle("open", !expanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("open");
    }
  });

  function parseTsv(text) {
    const lines = text.replace(/^\uFEFF/, "").split(/\r\n|\n|\r/).filter((line) => line.length > 0);
    if (lines.length < 2) throw new Error("The TSV file has no data rows.");

    const columns = lines[0].split("\t");
    if (columns.length === 0 || columns.every((column) => column.trim() === "")) {
      throw new Error("The TSV file has no column names.");
    }
    const rows = lines.slice(1).map((line) => {
      const values = line.split("\t");
      return columns.map((_, index) => values[index] ?? "");
    });

    return { columns, rows };
  }

  function setDownloadState(link, available, url, label) {
    if (available) {
      link.href = url;
      link.removeAttribute("aria-disabled");
      link.removeAttribute("title");
      link.setAttribute("download", "");
      link.textContent = `Download ${label}`;
    } else {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("title", "This file has not been added to the repository yet.");
      link.removeAttribute("download");
      link.textContent = `${label} not available`;
    }
  }

  async function checkFile(url) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  function renderTable(columns, rows) {
    const table = document.querySelector("#preview-table");
    const message = document.querySelector("#preview-message");
    const head = table.querySelector("thead");
    const body = table.querySelector("tbody");
    const headerRow = document.createElement("tr");

    columns.forEach((column) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = column;
      headerRow.append(cell);
    });
    head.replaceChildren(headerRow);

    const bodyRows = rows.slice(0, previewLimit).map((record) => {
      const row = document.createElement("tr");
      columns.forEach((_, index) => {
        const cell = document.createElement("td");
        cell.textContent = record[index] ?? "";
        row.append(cell);
      });
      return row;
    });
    body.replaceChildren(...bodyRows);
    table.hidden = false;
    message.hidden = true;

    document.querySelector("#preview-count").textContent =
      `Showing ${bodyRows.length} of ${rows.length} records · ${columns.length} columns`;
  }

  function renderNumericChart(columns, rows) {
    const chart = document.querySelector("#numeric-chart");
    const chartMessage = document.querySelector("#chart-message");
    const candidates = columns.map((column, index) => ({
      column,
      values: rows.map((row) => row[index]?.trim() ?? "")
    })).filter(({ values }) => values.length > 0 && values.every((value) => value !== "" && Number.isFinite(Number(value))));

    if (candidates.length === 0) {
      chart.hidden = true;
      chartMessage.hidden = false;
      chartMessage.textContent = "No numeric variables are available to chart in the published data.";
      return;
    }

    const { column, values } = candidates[0];
    const numbers = values.map(Number);
    const minimum = Math.min(...numbers);
    const maximum = Math.max(...numbers);
    const binCount = Math.min(8, Math.max(1, Math.ceil(Math.sqrt(numbers.length))));
    const bins = Array.from({ length: binCount }, () => 0);
    const range = maximum - minimum;

    numbers.forEach((value) => {
      const index = range === 0 ? 0 : Math.min(binCount - 1, Math.floor(((value - minimum) / range) * binCount));
      bins[index] += 1;
    });

    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    const chartWidth = 640;
    const chartHeight = 190;
    const plotLeft = 34;
    const plotTop = 10;
    const plotWidth = 590;
    const plotHeight = 132;
    const maxCount = Math.max(...bins);
    const gap = 8;
    const barWidth = (plotWidth - gap * (binCount - 1)) / binCount;
    svg.setAttribute("viewBox", `0 0 ${chartWidth} ${chartHeight}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `Histogram of ${column} from ${numbers.length} records`);
    svg.classList.add("chart-svg");

    const axis = document.createElementNS(svgNamespace, "line");
    axis.setAttribute("x1", String(plotLeft));
    axis.setAttribute("x2", String(plotLeft + plotWidth));
    axis.setAttribute("y1", String(plotTop + plotHeight));
    axis.setAttribute("y2", String(plotTop + plotHeight));
    axis.classList.add("chart-axis");
    svg.append(axis);

    bins.forEach((count, index) => {
      const height = count / maxCount * plotHeight;
      const x = plotLeft + index * (barWidth + gap);
      const y = plotTop + plotHeight - height;
      const bar = document.createElementNS(svgNamespace, "rect");
      bar.setAttribute("x", String(x));
      bar.setAttribute("y", String(y));
      bar.setAttribute("width", String(barWidth));
      bar.setAttribute("height", String(height));
      bar.setAttribute("rx", "2");
      bar.classList.add("chart-bar");

      const title = document.createElementNS(svgNamespace, "title");
      const lower = range === 0 ? minimum : minimum + (range * index / binCount);
      const upper = range === 0 ? maximum : minimum + (range * (index + 1) / binCount);
      title.textContent = `${lower.toLocaleString()}–${upper.toLocaleString()}: ${count} records`;
      bar.append(title);
      svg.append(bar);
    });

    const axisLabel = document.createElementNS(svgNamespace, "text");
    axisLabel.setAttribute("x", String(plotLeft + plotWidth / 2));
    axisLabel.setAttribute("y", "174");
    axisLabel.setAttribute("text-anchor", "middle");
    axisLabel.classList.add("chart-label");
    axisLabel.textContent = column;
    svg.append(axisLabel);

    chart.replaceChildren(svg);
    chart.hidden = false;
    chartMessage.hidden = true;
    document.querySelector("#chart-title").textContent = `Distribution of ${column}`;
    document.querySelector("#chart-subtitle").textContent = `Computed from ${numbers.length} non-empty numeric values in the published TSV.`;
  }

  async function initializeDataset() {
    const tsvLink = document.querySelector("#tsv-download");
    const excelLink = document.querySelector("#excel-download");
    const status = document.querySelector("#data-status");
    const tsvAvailable = await checkFile(datasetFiles.tsv);
    const excelAvailable = await checkFile(datasetFiles.excel);

    setDownloadState(tsvLink, tsvAvailable, datasetFiles.tsv, "TSV");
    setDownloadState(excelLink, excelAvailable, datasetFiles.excel, "Excel");

    if (!tsvAvailable) {
      status.textContent = "Dataset files are not included yet. Download links, preview columns, and charts will become available when the verified TSV and Excel files are published.";
      return;
    }

    try {
      const response = await fetch(datasetFiles.tsv);
      if (!response.ok) throw new Error("Could not load the published TSV file.");
      const dataset = parseTsv(await response.text());
      renderTable(dataset.columns, dataset.rows);
      renderNumericChart(dataset.columns, dataset.rows);
      status.textContent = `The preview and exploratory chart use the published TSV file (${dataset.rows.length} records).`;
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "The published dataset could not be loaded.";
    }
  }

  initializeDataset();
})();
