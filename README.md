# CrowdSpark Client

React, Vite, and TypeScript frontend for CrowdSpark.

## Links

- Live website: `ADD_VERCEL_CLIENT_URL`
- Client repository: `ADD_CLIENT_GITHUB_REPOSITORY_URL`
- Server repository: `ADD_SERVER_GITHUB_REPOSITORY_URL`
- API: `ADD_RENDER_SERVER_URL`

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Windows:

```powershell
Copy-Item .env.example .env
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_AUTH_BASE_URL=http://localhost:5000
VITE_GITHUB_URL=https://github.com/your-username/crowdspark-client
VITE_LINKEDIN_URL=https://www.linkedin.com/in/your-profile
VITE_FACEBOOK_URL=https://www.facebook.com/your-profile
VITE_CONTACT_EMAIL=your-email@example.com
VITE_CONTACT_PHONE=+8801XXXXXXXXX
```

## Commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```

## Deployment

Import this repository into Vercel, set the `VITE_*` environment variables, and deploy. `vercel.json` contains the SPA rewrite needed for direct private-route refreshes.
