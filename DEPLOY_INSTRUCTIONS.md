Deployment checklist — www.hyperwebdesignz.com

1) GitHub Pages
- Repository: https://github.com/cbancman69/www.Hyperwebdesignz.com
- Branch published: `gh-pages` (workflow will create/update this branch)
- Ensure Pages is enabled in the repo Settings → Pages and set the source to `gh-pages` branch (or `master`/`main` if you prefer).

2) DNS (custom domain)
- For the subdomain `www.hyperwebdesignz.com` add a CNAME record pointing to:

  `cbancman69.github.io`

  Example DNS record:

  - Type: CNAME
  - Name: www
  - Value: cbancman69.github.io
  - TTL: your provider default

3) Trigger a deploy
- Option A — GitHub UI: go to Actions → choose "Deploy to GitHub Pages" workflow → Run workflow (select `master` or `main` branch).
- Option B — GitHub CLI (requires `gh` and authentication):

  ```powershell
  gh workflow run gh-pages.yml --repo cbancman69/www.Hyperwebdesignz.com --ref master
  ```

- Option C — curl with a Personal Access Token (set `GITHUB_TOKEN` env var):

  ```powershell
  curl -X POST -H "Accept: application/vnd.github+json" -H "Authorization: token $env:GITHUB_TOKEN" https://api.github.com/repos/cbancman69/www.Hyperwebdesignz.com/actions/workflows/gh-pages.yml/dispatches -d '{"ref":"master"}'
  ```

4) Verify
- After a successful run, the workflow will publish `public` to `gh-pages` and include the `CNAME` file so Pages serves `www.hyperwebdesignz.com`.
- Check Actions tab for the workflow run and the Pages section in repo Settings for any required enforcement (HTTPS certificate provisioning may take a few minutes).

5) Notes & troubleshooting
---
Auto-trigger note: repository updated to force a push-triggered deploy on 2026-01-22.

