import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Globe, ChevronLeft } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../config/theme';
import { ThriveAvatar } from './ThriveAvatar';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  unreadCount?: number;
  onNotificationsPress?: () => void;
  onLanguagePress?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  userName,
  userRole,
  showBack = false,
  onBackPress,
  unreadCount = 0,
  onNotificationsPress,
  onLanguagePress,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity activeOpacity={0.7} onPress={onBackPress} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : userName ? (
          <ThriveAvatar name={userName} size={42} style={{ marginRight: Spacing.sm }} />
        ) : null}

        <View>
          {title ? (
            <Text style={styles.titleText}>{title}</Text>
          ) : (
            <Text style={styles.titleText}>{userName || 'Thrive'}</Text>
          )}
          {subtitle ? (
            <Text style={styles.subtitleText}>{subtitle}</Text>
          ) : userRole ? (
            <Text style={styles.roleText}>{userRole.toUpperCase()}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightSection}>
        {onLanguagePress && (
          <TouchableOpacity activeOpacity={0.7} onPress={onLanguagePress} style={styles.iconBtn}>
            <Globe size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {onNotificationsPress && (
          <TouchableOpacity activeOpacity={0.7} onPress={onNotificationsPress} style={styles.iconBtn}>
            <Bell size={20} color={Colors.textSecondary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backBtn: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitleText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 1,
    letterSpacing: 0.5,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.danger,
    borderRadius: Radius.full,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
