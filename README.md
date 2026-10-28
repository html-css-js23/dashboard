# Dashboard

Up/down status for my websites, hosted on GitHub Pages.

- Sites to watch go in `sites.json`.
- A GitHub Action (`.github/workflows/check.yml`) checks them every 10 minutes and saves the results to `data/`.
- `index.html` shows the latest results. It also pings each site from your browser when you open the page.
