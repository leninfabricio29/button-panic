import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import Layout from './app/_layout';




// Registra la app principal
AppRegistry.registerComponent(appName, () => Layout);
