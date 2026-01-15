# Futuristic Portfolio

Lightweight single-page portfolio served from `public/` with a small Node/Express helper server.

## Quick start (local)

1. Install dependencies (if you haven't):

```powershell
npm install
```

2. Start the server on an interactive port (recommended):

```powershell
npm run start-local
# or
npm start
```

3. Open the URL written to `last_url.txt` or visit `http://localhost:4000` in your browser.

## Analytics / Cookie consent

The project includes a consent banner at `public/cookie-consent.js`. It stores the user's choice in `localStorage` under the key `fp_cookie_ok`.

- Configure provider in `public/cookie-consent.js` by editing the `ANALYTICS` object.
  - For Plausible: set `provider: 'plausible'` and `domain: 'yourdomain.com'` (or leave domain blank to use current hostname).
  - For Google Analytics: set `provider: 'ga'` and `measurementId: 'G-XXXXXXX'`.
  - `provider: 'auto'` (default) will skip analytics on localhost and prefer GA if `measurementId` is set.

Analytics scripts are loaded only after the user clicks **Allow** on the banner.

## Run notes

- The server serves static files from `public/` and provides a small API for testimonials.
- Use `start-local.js` to pick an available port interactively (it writes the chosen URL to `last_url.txt`).

## Next steps

- Add a small admin UI to edit `public/data/testimonials.json` (planned).
- Add CI/deploy instructions if you want to publish to Vercel/Netlify or a VPS.
 
## Deployment

You can publish the full Node app (API + admin UI) to a service like Render or Heroku, or containerize with Docker.

1) Quick: Render (recommended for full Node apps)

- Push your repository to GitHub.
- Go to Render (https://render.com) → New → Web Service → Connect your repo.
- Use `npm install` as the build command and `npm start` as the start command. Set the `ADMIN_SECRET` env var on Render.
- Optionally commit the provided `.render.yaml` to automate the Render setup.

2) Heroku

- Install the Heroku CLI and log in.
- From the project root:
```powershell
heroku create my-portfolio-app
git push heroku main
heroku config:set ADMIN_SECRET=your_secret_here
```
- Heroku will use the `Procfile` (included) to start the server.

3) Docker (self-host or any container platform)

- Build and run locally:
```powershell
docker build -t futuristic-portfolio .
docker run -p 4000:4000 -e ADMIN_SECRET=your_secret futuristic-portfolio
```

Notes:
- Ensure you set `ADMIN_SECRET` and any SMTP/Twilio env vars before enabling the admin UI or notifications.
- The project serves static assets from `public/` and exposes small admin endpoints at `/admin` that require a session cookie.

If you want, I can create a GitHub repository for this project and push these changes, or walk you through connecting the repo to Render/Heroku and finishing the deployment.

If you want, I can set your analytics `measurementId` or Plausible `domain` now and mark the todo done.
