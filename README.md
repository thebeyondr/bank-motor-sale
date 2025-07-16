# LIMBO - Bank Motor Sale

A modern web application for browsing repossessed vehicles from Jamaican banks. Built with React, TypeScript, and IndexedDB for offline-first functionality.

## Features

- 🚗 Browse repossessed vehicles from multiple banks (NCB, CIBC, JMMB)
- 🔍 Advanced filtering by:
  - Make and model
  - Year
  - Price range
  - Bank
- 💾 Offline-first with IndexedDB storage
- 🎨 Modern UI with TailwindCSS
- 📱 Responsive design
- ⚡️ Fast and efficient search

## Tech Stack

- React + TypeScript
- IndexedDB for local storage
- TailwindCSS for styling
- React Router for navigation

## Getting Started

### Installation

Install the dependencies:

```bash
bun install
```

### Development

Start the development server with HMR:

```bash
bun run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
bun run build
```

## Deployment

### Docker Deployment

This template includes three Dockerfiles optimized for different package managers:

- `Dockerfile` - for npm
- `Dockerfile.pnpm` - for pnpm
- `Dockerfile.bun` - for bun

To build and run using Docker:

```bash
# For npm
docker build -t LIMBO .

# For pnpm
docker build -f Dockerfile.pnpm -t LIMBO .

# For bun
docker build -f Dockerfile.bun -t LIMBO .

# Run the container
docker run -p 3000:3000 LIMBO
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `bun run build`

```bash
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Project Structure

```bash
LIMBO/
├── app/
│   ├── components/     # Reusable UI components
│   ├── routes/        # Route components and loaders
│   ├── utils/         # Utility functions and DB logic
│   └── types/         # TypeScript type definitions
├── public/           # Static assets
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for Jamaican car buyers.
