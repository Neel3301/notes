import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors, radius } from '../theme/tokens';

export default function SearchPill({
  value,
  onChangeText,
  placeholder = 'Search notes...',
  onClear,
}) {
  return (
    <View style={styles.container}>
      <Search size={16} color={colors.textSecondary} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    backgroundColor: '#0F0F0F',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
});
