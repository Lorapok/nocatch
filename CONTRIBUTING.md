# Contributing to NoCatch

Thank you for your interest in contributing to **NoCatch**, an official open-source product of [Lorapok Labs](https://lorapok.tech)! We welcome bug reports, documentation updates, feature requests, and code contributions.

---

## 📜 Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to [security@lorapok.tech](mailto:security@lorapok.tech).

---

## 🛠 Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **git**: modern git CLI

### Cloning the Repository
```bash
git clone https://github.com/Lorapok/nocatch.git
cd nocatch
npm install
```

### Monorepo Workspaces Structure
```
nocatch/
├── packages/core/       # Core extraction engine & CLI library (@lorapok/nocatch-core)
├── web/                 # Alive React 19 + Tailwind CSS frontend (nocatch.lorapok.tech)
├── server/              # Express API gateway & streaming proxy
├── discord-bot/         # Discord.js bot application
└── extension/           # Cross-browser social media extension (Manifest V3)
```

### Running Locally
- **Web Frontend**:
  ```bash
  npm run dev:web
  # Runs at http://localhost:5173
  ```
- **API Server**:
  ```bash
  npm run dev:server
  # Runs at http://localhost:3000
  ```
- **Core CLI**:
  ```bash
  node packages/core/bin/nocatch.js --help
  ```

### Running Tests
```bash
npm run test:core
npm run test:discord
```

---

## 🌿 Branching & Commit Guidelines

### Branch Naming Conventions
- `feat/feature-name` for new capabilities
- `fix/bug-description` for bug fixes
- `docs/documentation-update` for documentation changes
- `chore/task-name` for dependencies or refactoring

### Conventional Commits
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat(scope): add video canvas extraction support`
- `fix(stream): resolve Google CDN chunked range streaming`
- `docs(tutorial): add Discord bot invite instructions`
- `chore(release): bump version to 2.0.0`

---

## 🚀 Submitting Pull Requests

1. **Fork & Branch**: Create your feature branch from `main`.
2. **Verify Tests**: Ensure all unit tests pass (`npm run test:core`).
3. **Format & Build**: If touching web assets, run `npm run build:web` to verify bundle compilation.
4. **Submit PR**: Open a pull request against `Lorapok/nocatch:main`.
5. **PR Template**: Complete the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

---

## 🔒 Security Vulnerabilities

Please do **NOT** report security vulnerabilities via public GitHub issues. Follow the instructions in [SECURITY.md](SECURITY.md) or email [security@lorapok.tech](mailto:security@lorapok.tech).
