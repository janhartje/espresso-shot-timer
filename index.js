import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

try {
    configureReanimatedLogger({
        level: ReanimatedLogLevel.warn,
        strict: false, // Disable strict mode to silence "Reading from value during render" warnings
    });
} catch (e) {
    // Ignore if reanimated is not fully linked or mocking issues
}

registerRootComponent(App);
