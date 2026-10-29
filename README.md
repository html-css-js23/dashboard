# Dashboard

Up/down status for my websites, hosted on GitHub Pages.

- Sites to watch go in `sites.json`.
- A GitHub Action (`.github/workflows/check.yml`) checks them every 5 minutes and saves the results to the `status` branch.
- `index.html` shows the latest results. It also checks each site from your browser every 30 seconds.
