# Zombie.Digital - Twitch Management Platform

A comprehensive Twitch management platform built with Next.js 14, providing streamers with professional tools for social media management, interactive stream overlays, analytics, and community engagement.

## 🚀 Features

- **Social Links Management** - Drag-and-drop link organization with 20+ platform support
- **Interactive Canvas System** - Real-time collaborative overlays for OBS integration
- **Twitch Analytics** - Stream stats, follower tracking, and performance metrics
- **User Profile Pages** - Custom public profiles with social sharing
- **Admin Panel** - User management and site-wide notifications
- **Real-time Updates** - Live synchronization across all features

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Authentication**: NextAuth.js with Twitch OAuth
- **State Management**: React Query, Zustand
- **Package Manager**: Bun

## 📋 Documentation

- **[Product Requirements Document (PRD)](./PRD.md)** - Comprehensive project overview, roadmap, and technical requirements
- **[Cursor Rules](./.cursor/rules/)** - Development guidelines and coding standards

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 18+ (for compatibility)
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/zombie-digital.git
cd zombie-digital
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase and Twitch credentials
```

4. Run the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Development

### Package Management
This project uses **Bun** for package management. Always use:
- `bun add package-name` for installation
- `bunx package-name` for execution
- `bun run script-name` for scripts

### Code Standards
- TypeScript strict mode
- Tailwind CSS for styling (no inline CSS)
- Framer Motion for animations
- Supabase for all database operations
- React Query for server state
- Zustand for client state

### Browser Debugging with BrowserTools MCP
This project integrates with BrowserTools MCP for AI-powered browser debugging:

```bash
# Start the BrowserTools middleware server
bun run browsertools

# Or manually:
bunx -y @agentdeskai/browser-tools-server@1.2.1
```

**Available debugging commands in Cursor:**
- "Take a screenshot and check console logs"
- "Run a performance audit on this page"
- "Check for accessibility issues"
- "Enter debugger mode"

See [docs/browsertools-mcp-setup.md](./docs/browsertools-mcp-setup.md) for complete setup instructions.

### Project Structure
```
├── app/                    # Next.js app router
├── components/             # Reusable UI components
├── lib/                   # Utility functions and configurations
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── prisma/               # Database schema
├── .cursor/rules/        # Development guidelines
└── PRD.md               # Product Requirements Document
```

## 🎯 Roadmap

See the [PRD.md](./PRD.md) for detailed roadmap and feature planning.

### Phase 1: Performance & Stability (Q1 2024)
- Database optimization
- Performance improvements
- Testing implementation
- Error monitoring

### Phase 2: Feature Enhancement (Q2 2024)
- Advanced analytics
- Stream integration
- Enhanced canvas tools

### Phase 3: Community & Monetization (Q3 2024)
- Team management
- Viewer interaction tools
- Revenue tracking

## 🤝 Contributing

1. Check existing components before creating new ones
2. Follow the coding standards in `.cursor/rules/`
3. Use proper TypeScript types
4. Implement proper error handling
5. Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Demo](https://zombie.digital)
- [Documentation](./PRD.md)
- [Issues](https://github.com/your-username/zombie-digital/issues)

---

Built with ❤️ for the Twitch community
