# Business Pulse AI

An AI-powered business assistant that monitors company inventory, trends, and stock market insights and proactively notifies business owners.

## Tech Stack (Adapted for Node.js/TypeScript environment)
- **Frontend**: React 19, Vite, Tailwind CSS, ShadCN UI, Zustand, React Query, Framer Motion
- **Backend**: Express (TypeScript), Google Gen AI SDK
- **Deployment**: Docker, Cloud Run

## Prerequisites
- Node.js 20+
- Gemini API Key

## Setup
1. Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`
2. Install dependencies: `npm install`
3. Run in development: `npm run dev`
4. Build for production: `npm run build`
5. Start production server: `npm start`

## Docker
A `Dockerfile` and `docker-compose.yml` are provided for containerized deployment.

```bash
docker-compose up -d
```
