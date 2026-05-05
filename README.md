# DevAudit — AI Code Vulnerability Scanner

A production-ready, full-stack Next.js application that uses **Ollama (CodeLlama)** for **local/free** AI-powered code vulnerability scanning, syntax analysis, and security audits across 16+ languages.

---

## Features

**AI-Powered Scanning** — Uses Ollama CodeLlama (local, free) to detect vulnerabilities, syntax errors across 16+ languages
- **Authentication** — Email/password + GitHub OAuth + Google OAuth (via NextAuth.js)
- **16+ Languages** — JS, TS, Python, Java, Go, Rust, PHP, Ruby, SQL, Bash, C/C++, C#, Kotlin, Swift, Solidity, YAML
- **File Upload + Drag & Drop** — Upload code files directly
- **Severity Filtering** — Filter by CRITICAL / HIGH / MEDIUM / LOW / INFO
- **Security Score** — 0-100 score with visual ring indicator
- **Detailed Reports** — CWE IDs, OWASP categories, code snippets, working fixes
- **Export Reports** — Download as Markdown
- **Scan History** — Browse previous scans with localStorage persistence
- **Settings Page** — Configure preferences

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourusername/devaudit.git
cd devaudit
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# No API key needed for Ollama (local)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=`openssl rand -base64 32`

# Optional OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Getting API Keys

### Setup Ollama (for scanning)
1. Download: https://ollama.com
2. `ollama pull codellama:7b-instruct-q4_0`
3. `ollama serve` (run before scanning)
4. **100% local/free – no API key needed!**

### GitHub OAuth (optional)
1. Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. Set Homepage URL: `http://localhost:3000`
3. Set Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

### Google OAuth (optional)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → Create OAuth 2.0 Client
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js v4 |
| AI | Ollama + CodeLlama (local, free)
| Icons | Lucide React |
| Date utils | date-fns |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts     # Core scanning API
│   │   └── auth/[...nextauth]/  # Auth handler
│   ├── dashboard/page.tsx       # Main scanner UI
│   ├── history/page.tsx         # Scan history
│   ├── settings/page.tsx        # Settings
│   ├── sign-in/page.tsx         # Login
│   ├── sign-up/page.tsx         # Registration
│   └── page.tsx                 # Landing page
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Providers.tsx
│   └── scanner/
│       ├── Scanner.tsx          # Main scanner component
│       ├── ScoreRing.tsx        # Security score ring
│       └── SeverityBadge.tsx    # Severity label
└── types/index.ts
```

---

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Add all environment variables in the Vercel dashboard under Project → Settings → Environment Variables.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Adding a Database

The current implementation uses in-memory storage for users and localStorage for scan history. For production, integrate a database:

### Option A: PostgreSQL + Prisma
```bash
npm install @prisma/client prisma
npx prisma init
```

### Option B: MongoDB + Mongoose
```bash
npm install mongoose
```

### Option C: PlanetScale / Supabase (hosted)
Follow their Next.js integration guides.

---

## License

MIT
