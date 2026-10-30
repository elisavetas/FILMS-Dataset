# FILMS dataset explorer

FILMS is an open-source dataset project for academic research. This lightweight
browser app makes it easy to inspect a dataset, find records relevant to a
research question, and export a focused subset.

## Use the app

Open [`index.html`](index.html) in a modern browser. Choose or drop a dataset
file to get started. No installation, account, or server is required.

Supported formats:

- **CSV** (`.csv`), including quoted fields and commas or newlines inside quotes
- **Tab-separated values** (`.tsv`)
- **JSON** (`.json`) as a non-empty array of objects, for example:

  ```json
  [
    { "study_id": "S001", "year": 2024, "topic": "Example" },
    { "study_id": "S002", "year": 2025, "topic": "Another example" }
  ]
  ```

Search across all fields or select a field to narrow the search. Results are
shown 25 records at a time; **Export results** downloads every matching record
as a CSV file. Clear the current dataset to start again.

## Privacy

The app reads files in your browser. Dataset contents are not uploaded or sent
to a server.