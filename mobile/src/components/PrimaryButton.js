import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/tokens';

export default function PrimaryButton({ title, onPress, loading, disabled, variant = 'cream', style }) {
  const outline = variant === 'outline';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, outline && styles.outline, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.textPrimary : colors.textDark} />
      ) : (
        <Text style={[styles.text, outline && styles.outlineText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.bgCream,
    paddingVertical: 14,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.borderSubtle },
  disabled: { opacity: 0.5 },
  text: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  outlineText: { color: colors.textPrimary },
});
