<p align="center">
  <img src="assets/logo.png" alt="MovieLix Logo" width="200"/>
</p>

A modern movie streaming platform built for speed and simplicity.  
Watch your favorite movies in high quality, anytime, anywhere.

👉 Start watching now: https://movielix.neytrix.app/

<p align="center">
  <img src="assets/banner.png" alt="MovieLix Banner" width="800"/>
</p>

## Features

- 🎥 **High-Quality Streaming** - Watch movies and TV shows in stunning clarity.
- ⚡ **Lightning Fast** - Built with Nuxt 3 and optimized for performance.
- 📱 **Mobile Ready** - Seamless experience on any device.
- ✨ **Modern UI** - A beautiful and intuitive interface.

## Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **State Management**: Pinia
- **Video Player**: Artplayer
- **Backend**: [API Movie Lix](https://github.com/Neytrix/movie-lix-api)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd MovieLix
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:

   ```env
   # API configuration
   API_URL=https://api.yourdomain.com
   BASE_URL=https://movielix.neytrix.app

   # Other settings
   NUXT_PUBLIC_APP_NAME="MovieLix"
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open your browser and go to [http://localhost:3000](http://localhost:3000)

### Production Build

To create a production build:

```bash
pnpm build
```

To run the production build locally:

```bash
pnpm start
```

## Available Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Run production build
- `pnpm preview` - Preview production build
- `pnpm lint` - Lint code
- `pnpm lint:fix` - Fix linting issues
