# FILMS Dataset

Public-facing home for the FILMS academic dataset project. This is a static
HTML, CSS, and JavaScript site designed to deploy on GitHub Pages. Dataset scope,
background, methodology, and citation details are intentionally not inferred;
add verified project information when it is available.

## Website files

- [`index.html`](index.html) contains the page structure and site content.
- [`assets/css/styles.css`](assets/css/styles.css) contains layout, visual
  styling, responsive breakpoints, and reduced-motion behavior.
- [`assets/js/main.js`](assets/js/main.js) contains the mobile navigation,
  published-file checks, TSV preview, and data-derived numeric chart.

## Preview locally

Open `index.html` in a browser to inspect the static page. To test data loading,
serve the repository directory with a local static web server; browsers may
restrict `fetch()` when a page is opened directly as a `file://` URL.

## Publish on GitHub Pages

1. Add the verified dataset files at `data/dataset.tsv` and
   `data/dataset.xlsx`. Keep the original data files unchanged.
2. In the repository's **Settings → Pages**, select deployment from the
   `main` branch and the repository root, then save.
3. Wait for the Pages deployment to finish and open the published site URL.

The site checks whether each download file exists before enabling its link.
When the TSV is available, the preview displays its column names and up to
eight actual records. The visualization generates a histogram from the first
column whose non-empty values are all numeric. No sample records or chart
values are embedded in the site.

## Maintain and update

- Replace neither source file in place without preserving the authoritative
  version. Review and publish data updates through the repository's normal
  version-control process.
- If the published filenames change, update `datasetFiles` near the top of
  `assets/js/main.js`. Keep both files in the repository root's `data/`
  directory so their URLs work on GitHub Pages project sites.
- Add verified project background, scope, variable definitions, methodology,
  and citation details to their corresponding sections in `index.html`.
- Keep this README aligned with any changes to deployment, file paths, or
  preview and visualization behavior.
- Review the site at desktop and mobile widths after content or layout changes.

The website does not upload data to a service. GitHub Pages serves the static
site and files from this repository.