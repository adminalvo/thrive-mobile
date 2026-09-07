import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Home,
  Calendar,
  BookOpen,
  CreditCard,
  User,
  Users,
  TrendingUp,
  FileCheck,
} from 'lucide-react-native';
import { Colors, Spacing } from '../../config/theme';
import { UserRole } from '../../types/database.types';
import { useLanguage } from '../../context/LanguageContext';

export interface TabItem {
  key: string;
  label: string;
  iconName: string;
}

interface BottomTabBarProps {
  role: UserRole;
  currentTab: string;
  onTabPress: (tabKey: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  role,
  currentTab,
  onTabPress,
}) => {
  const { t } = useLanguage();

  const getTabsForRole = (): TabItem[] => {
    if (role === 'student') {
      return [
        { key: 'home', label: t('nav.home'), iconName: 'home' },
        { key: 'schedule', label: t('nav.schedule'), iconName: 'schedule' },
        { key: 'learning', label: t('nav.learning'), iconName: 'learning' },
        { key: 'payments', label: t('nav.payments'), iconName: 'payments' },
        { key: 'profile', label: t('nav.profile'), iconName: 'profile' },
      ];
    }
    if (role === 'parent') {
      return [
        { key: 'home', label: t('nav.home'), iconName: 'home' },
        { key: 'children', label: t('nav.children'), iconName: 'children' },
        { key: 'schedule', label: t('nav.schedule'), iconName: 'schedule' },
        { key: 'progress', label: t('nav.progress'), iconName: 'progress' },
        { key: 'payments', label: t('nav.payments'), iconName: 'payments' },
        { key: 'profile', label: t('nav.profile'), iconName: 'profile' },
      ];
    }
    if (role === 'teacher') {
      return [
        { key: 'home', label: t('nav.home'), iconName: 'home' },
        { key: 'schedule', label: t('nav.schedule'), iconName: 'schedule' },
        { key: 'groups', label: t('nav.groups'), iconName: 'groups' },
        { key: 'assignments', label: t('nav.assignments'), iconName: 'assignments' },
        { key: 'profile', label: t('nav.profile'), iconName: 'profile' },
      ];
    }
    return [{ key: 'home', label: t('nav.home'), iconName: 'home' }];
  };

  const renderIcon = (iconName: string, isFocused: boolean) => {
    const color = isFocused ? Colors.primary : Colors.textMuted;
    const size = 22;

    switch (iconName) {
      case 'home':
        return <Home size={size} color={color} />;
      case 'schedule':
        return <Calendar size={size} color={color} />;
      case 'learning':
        return <BookOpen size={size} color={color} />;
      case 'children':
        return <Users size={size} color={color} />;
      case 'progress':
        return <TrendingUp size={size} color={color} />;
      case 'groups':
        return <Users size={size} color={color} />;
      case 'assignments':
        return <FileCheck size={size} color={color} />;
      case 'payments':
        return <CreditCard size={size} color={color} />;
      case 'profile':
      default:
        return <User size={size} color={color} />;
    }
  };

  const tabs = getTabsForRole();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isFocused = currentTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => onTabPress(tab.key)}
            style={styles.tabItem}
          >
            {renderIcon(tab.iconName, isFocused)}
            <Text
              style={[
                styles.tabLabel,
                { color: isFocused ? Colors.primary : Colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
});
