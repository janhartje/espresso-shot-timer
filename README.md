# Espresso Shot Timer

A high-end, precision utility app designed for home baristas. The Espresso Shot Timer utilizes your smartphone's accelerometer to detect the vibration of your espresso machine's pump, automatically starting and stopping the timer for hands-free extraction tracking.

## Features

- **Auto-Start/Stop**: Sophisticated sensor logic detects pump vibration with customizable thresholds.
- **Vibration Sensing**: Real-time visualizer of pump intensity and stability.
- **Smart Smoothing**: Signal processing algorithms filter out accidental bumps and noise.
- **Calibration Mode**: One-tap calibration to adapt to different machines and environments.
- **Always-On Display**: Keeps your screen awake during usage.
- **Premium Aesthetic**: Deep dark mode (#121212) with copper accents (#D4AF37) and glassmorphism UI.

## Tech Stack

- **Framework**: React Native with Expo (Managed Workflow)
- **Styling**: NativeWind (Tailwind CSS)
- **Animations**: React Native Reanimated
- **Sensors**: Expo Sensors (Accelerometer)
- **Icons**: Lucide React Native

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/janhartje/espresso-shot-timer.git
   cd espresso-shot-timer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

## Usage

> **Note:** High-frequency sensor monitoring requires a physical device. This app will not function fully in a Simulator/Emulator.

1. **Open the App**: Scan the QR code with Expo Go on your physical device.
2. **Placement**: Place your phone on the drip tray or a flat, stable surface on top of your espresso machine.
3. **Calibration**:
   - Tap the **Settings** (Gear) icon.
   - Wait 2 seconds while the app measures the baseline vibration of your machine/environment in an idle state.
   - The threshold will automatically update.
4. **Brew**: Start your espresso shot.
   - The visualizer will react to the pump's vibration.
   - The timer will start automatically when vibration exceeds the threshold.
   - The timer will stop automatically when the pump stops (with a 1-second debounce to prevent false stops).

## Customization

You can adjust sensor sensitivity settings in `src/hooks/useShotTimer.ts`:
- `threshold`: Default trigger point (auto-adjusted by calibration).
- `smoothingBufferSize`: Size of the rolling average window (default: 15).
- `startDelay`: Time vibration must be sustained to start (default: 400ms).
- `stopDelay`: Time vibration must be absent to stop (default: 1000ms).

## License

This project is open source and available under the [MIT License](LICENSE).
