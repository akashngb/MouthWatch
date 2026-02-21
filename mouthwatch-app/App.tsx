import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import IntakeFormScreen from './screens/IntakeFormScreen';
import CameraScreen from './screens/CameraScreen';
import ResultsScreen from './screens/ResultsScreen';
import ProgressScreen from './screens/ProgressScreen';
import ClinicFinderScreen from './screens/ClinicFinderScreen';
import ChatScreen from './screens/ChatScreen';
import PDFPreviewScreen from './screens/PDFPreviewScreen';
import ModelViewerScreen from './screens/ModelViewerScreen';
import 'react-native-gesture-handler';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function PatientStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="IntakeForm" component={IntakeFormScreen} />
      <Stack.Screen name="PDFPreview" component={PDFPreviewScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="ModelViewer" component={ModelViewerScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarHideOnKeyboard: true,
            tabBarStyle: {
              backgroundColor: '#0d1321',
              borderTopColor: 'rgba(255,255,255,0.06)',
              borderTopWidth: 1,
              paddingBottom: 8,
              paddingTop: 8,
              height: 70,
              elevation: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
            },
            tabBarActiveTintColor: '#00c2ff',
            tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Scan"
            component={PatientStack}
            options={{
              tabBarIcon: ({ color }) => (
                <Feather name="home" size={22} color={color} />
              ),
              tabBarLabel: 'Home',
            }}
          />
          <Tab.Screen
            name="History"
            component={ProgressScreen}
            options={{
              tabBarIcon: ({ color }) => <Feather name="trending-up" size={22} color={color} />,
            }}
          />
          <Tab.Screen
            name="Find"
            component={ClinicFinderScreen}
            options={{
              tabBarIcon: ({ color }) => <Feather name="map-pin" size={22} color={color} />,
            }}
          />
          <Tab.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              tabBarIcon: ({ color }) => <Feather name="message-circle" size={22} color={color} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}