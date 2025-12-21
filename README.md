<div align="center">
  <img src="./assets/icon.png" alt="Espresso Shot Timer Logo" width="120" height="120" />

  # Espresso Shot Timer
  
  **Precision Brewing Assistant for Home Baristas**
  
  [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg?style=for-the-badge)](https://creativecommons.org/licenses/by-nc/4.0/)

  <p align="center">
    <b>Auto-Start Timer</b> • <b>Vibration Analysis</b> • <b>Hands-Free Operation</b><br>
    <br>
    <i>The official Espresso Shot Timer by Jan Hartje</i>
  </p>
</div>

---

## ☕ Overview

**Espresso Shot Timer** transforms your smartphone into a precision coffee tool. By utilizing the device's accelerometer, it detects the subtle vibration signature of your espresso machine's pump, automatically starting and stopping the shot timer. 

## 💻 Development

### Prerequisites
- **Node.js** (LTS recommended)
- **Expo Go** app installed on your physical mobile device.
- **Git**

### Core Libraries
- **React Native Reanimated**: For high-performance animations (60fps UI).
- **NativeWind**: Tailwind CSS implementation for styling.
- **Expo Sensors**: Access to accelerometer data.

### Project Structure
```
src/
├── components/   # UI Building blocks (Timer, Visualizer, etc.)
├── hooks/        # Core logic (useShotTimer, useCalibration)
├── i18n/         # Localization & Translations
├── utils/        # Shared helpers (Math, Logger, Storage)
└── assets/       # Images and Icons
```

### Contribution

We welcome contributions! Please read our [Contribution Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1.  **Fork** the project.
2.  **Create a Branch** (`git checkout -b feature/NewFeature`).
3.  **Commit** (`git commit -m 'Add some NewFeature'`).
4.  **Push** (`git push origin feature/NewFeature`).
5.  **Open a Pull Request**.

## ⚖️ License

**Copyright © 2025 Jan Hartje. All Rights Reserved.**

This project is made available under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license.

This means you are welcome to:
- **View the source code** to understand how it works.
- **Contribute** fixes or new features (Pull Requests are welcome!).
- **Fork** the repository for your own personal, non-commercial use.

**However, you may NOT:**
- Sell this app or a derivative of it.
- Use the code for any commercial product or service without explicit permission from Jan Hartje.

See the [LICENSE](LICENSE) file for the full legal text.

---

<div align="center">
  Made with ☕ by Jan Hartje
</div>
