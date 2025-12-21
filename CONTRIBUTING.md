# Contributing to Espresso Shot Timer

First off, thank you for considering contributing to Espresso Shot Timer! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## 🤝 Code of Conduct

By participating in this project, you are expected to uphold a safe and welcoming environment for everyone. Please be respectful and inclusive in your communications.

## 🛠️ How Can I Contribute?

### Reporting Bugs
- **Check existing issues** to see if the bug has already been reported.
- **Open a new issue** with a clear title and description. Include snippets of logs or screenshots where possible.

### Suggesting Enhancements
- Open an issue describing your proposed feature.
- Explain *why* this enhancement would be useful to most users.

### Pull Requests
1.  **Fork** the repo and create your branch from `main`.
2.  **Clone** the project to your machine.
3.  **Install dependencies** (`npm install`).
4.  **Make your changes**.
5.  **Test** your changes on a physical device if possible (sensors do not work on simulators).
6.  **Push** to your fork and submit a Pull Request.

## 💻 Development Setup

### Prerequisites
- **Node.js**: (LTS version recommended)
- **Expo Go**: Installed on your physical iOS/Android device.
- **Git**

### Installation
```bash
git clone https://github.com/YOUR_USERNAME/espresso-shot-timer.git
cd espresso-shot-timer
npm install
npx expo start
```

### Coding Standards
- **TypeScript**: Please keep the codebase typed. Avoid `any` where possible.
- **Tailwind**: Use `NativeWind` classes for styling. Try to avoid inline `style={{}}` unless necessary for animations.
- **Clean Code**: Keep components small and focused.

## ⚖️ License Agreement

By contributing to this repository, you agree that your contributions will be licensed under the project's **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license. You retain copyright of your contributions but grant Jan Hartje and the community the rights to use them under the terms of the project license.
