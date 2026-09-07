import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors } from '../../config/theme';

interface ThriveToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}

export const ThriveToggle: React.FC<ThriveToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[
        styles.track,
        value ? styles.trackActive : styles.trackInactive,
        disabled && styles.trackDisabled,
      ]}
    >
      <View
        style={[
          styles.thumb,
          value ? styles.thumbActive : styles.thumbInactive,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  trackActive: {
    backgroundColor: Colors.primary,
  },
  trackInactive: {
    backgroundColor: '#1E3A5F',
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  thumbInactive: {
    alignSelf: 'flex-start',
  },
});
