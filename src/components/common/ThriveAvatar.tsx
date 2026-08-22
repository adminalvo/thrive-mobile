import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { User } from 'lucide-react-native';
import { Colors } from '../../config/theme';

interface ThriveAvatarProps {
  name?: string;
  size?: number;
  iconColor?: string;
  style?: ViewStyle;
}

export const ThriveAvatar: React.FC<ThriveAvatarProps> = ({
  name,
  size = 40,
  iconColor = Colors.primary,
  style,
}) => {
  const iconSize = Math.round(size * 0.55);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <User size={iconSize} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
