declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const TouchableOpacity: any;
  export const ScrollView: any;
  export const TextInput: any;
  export const Modal: any;
  export const StatusBar: any;
  export const StyleSheet: any;
  export const ActivityIndicator: any;
  export const RefreshControl: any;
  export const Animated: any;
  export const KeyboardAvoidingView: any;
  export const Platform: any;
  export const TouchableWithoutFeedback: any;
  export type ViewStyle = any;
  export type TextStyle = any;
  export type ImageStyle = any;
  export type TextInputProps = any;
}

declare module 'lucide-react-native' {
  export const Home: any;
  export const Calendar: any;
  export const BookOpen: any;
  export const CreditCard: any;
  export const User: any;
  export const Users: any;
  export const TrendingUp: any;
  export const FileCheck: any;
  export const Award: any;
  export const Clock: any;
  export const MapPin: any;
  export const CheckCircle: any;
  export const CheckCircle2: any;
  export const AlertCircle: any;
  export const Bell: any;
  export const CheckCheck: any;
  export const Info: any;
  export const AlertTriangle: any;
  export const Globe: any;
  export const ChevronLeft: any;
  export const ChevronRight: any;
  export const Check: any;
  export const X: any;
  export const UserCheck: any;
  export const Plus: any;
  export const PlusCircle: any;
  export const FileText: any;
  export const Send: any;
  export const Inbox: any;
  export const Eye: any;
  export const EyeOff: any;
  export const Mail: any;
  export const Phone: any;
  export const Lock: any;
  export const LogOut: any;
  export const Shield: any;
  export const ArrowRight: any;
}

declare module 'expo-constants' {
  const Constants: {
    expoConfig?: {
      extra?: Record<string, any>;
    };
  };
  export default Constants;
}

declare module 'expo' {
  export function registerRootComponent(component: any): void;
}

declare module 'react-native-safe-area-context' {
  export const SafeAreaProvider: any;
  export const SafeAreaView: any;
  export const useSafeAreaInsets: () => { top: number; bottom: number; left: number; right: number };
}
