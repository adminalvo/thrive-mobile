import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from './config/theme';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Screens
import { SplashScreen } from './screens/auth/SplashScreen';
import { LoginScreen } from './screens/auth/LoginScreen';
import { NotificationsScreen } from './screens/global/NotificationsScreen';

// Student Screens
import { StudentHomeScreen } from './screens/student/StudentHomeScreen';
import { StudentScheduleScreen } from './screens/student/StudentScheduleScreen';
import { StudentLearningScreen } from './screens/student/StudentLearningScreen';
import { StudentPaymentsScreen } from './screens/student/StudentPaymentsScreen';
import { StudentProfileScreen } from './screens/student/StudentProfileScreen';

// Parent Screens
import { ParentHomeScreen } from './screens/parent/ParentHomeScreen';
import { ParentChildrenScreen } from './screens/parent/ParentChildrenScreen';
import { ParentScheduleScreen } from './screens/parent/ParentScheduleScreen';
import { ParentProgressScreen } from './screens/parent/ParentProgressScreen';
import { ParentPaymentsScreen } from './screens/parent/ParentPaymentsScreen';
import { ParentProfileScreen } from './screens/parent/ParentProfileScreen';

// Teacher Screens
import { TeacherHomeScreen } from './screens/teacher/TeacherHomeScreen';
import { TeacherScheduleScreen } from './screens/teacher/TeacherScheduleScreen';
import { TeacherGroupsScreen } from './screens/teacher/TeacherGroupsScreen';
import { TeacherAssignmentsScreen } from './screens/teacher/TeacherAssignmentsScreen';
import { TeacherProfileScreen } from './screens/teacher/TeacherProfileScreen';

// Navigation Components
import { BottomTabBar } from './components/navigation/BottomTabBar';

const MainNavigator: React.FC = () => {
  const { session, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [showNotifications, setShowNotifications] = useState(false);

  if (loading) {
    return <SplashScreen />;
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (showNotifications) {
    return <NotificationsScreen onBack={() => setShowNotifications(false)} />;
  }

  const role = session.role;

  const renderScreen = () => {
    // 1. STUDENT SCREENS
    if (role === 'student') {
      switch (currentTab) {
        case 'schedule':
          return <StudentScheduleScreen />;
        case 'learning':
          return <StudentLearningScreen />;
        case 'payments':
          return <StudentPaymentsScreen />;
        case 'profile':
          return <StudentProfileScreen />;
        case 'home':
        default:
          return (
            <StudentHomeScreen
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenNotifications={() => setShowNotifications(true)}
            />
          );
      }
    }

    // 2. PARENT SCREENS
    if (role === 'parent') {
      switch (currentTab) {
        case 'children':
          return (
            <ParentChildrenScreen
              onSelectChildAndNavigate={() => setCurrentTab('home')}
            />
          );
        case 'schedule':
          return <ParentScheduleScreen />;
        case 'progress':
          return <ParentProgressScreen />;
        case 'payments':
          return <ParentPaymentsScreen />;
        case 'profile':
          return <ParentProfileScreen />;
        case 'home':
        default:
          return (
            <ParentHomeScreen
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenNotifications={() => setShowNotifications(true)}
            />
          );
      }
    }

    // 3. TEACHER SCREENS
    if (role === 'teacher') {
      switch (currentTab) {
        case 'schedule':
          return <TeacherScheduleScreen />;
        case 'groups':
          return <TeacherGroupsScreen />;
        case 'assignments':
          return <TeacherAssignmentsScreen />;
        case 'profile':
          return <TeacherProfileScreen />;
        case 'home':
        default:
          return (
            <TeacherHomeScreen
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenNotifications={() => setShowNotifications(true)}
            />
          );
      }
    }

    return (
      <StudentHomeScreen
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onOpenNotifications={() => setShowNotifications(true)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.appContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <BottomTabBar
        role={role}
        currentTab={currentTab}
        onTabPress={(tabKey) => setCurrentTab(tabKey)}
      />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <MainNavigator />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContainer: {
    flex: 1,
  },
});
