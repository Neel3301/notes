import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu, ArrowLeft, X } from 'lucide-react-native';
import { colors } from '../theme/tokens';

export default function AppHeader({
  left = 'menu', // 'menu' | 'back' | 'close'
  logo = '.edsy',
  onLeftPress,
  right,
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onLeftPress}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.leftButton}
      >
        {left === 'menu' && (
          <Menu size={22} color={colors.textPrimary} strokeWidth={1.5} />
        )}
        {left === 'back' && (
          <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={1.5} />
        )}
        {left === 'close' && (
          <X size={22} color={colors.textPrimary} strokeWidth={1.5} />
        )}
      </TouchableOpacity>

      <Text style={styles.logo}>{logo}</Text>

      <View style={styles.rightPlaceholder}>{right || null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  leftButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logo: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  rightPlaceholder: {
    width: 36,
    alignItems: 'flex-end',
  },
});
