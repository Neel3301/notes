import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../theme/tokens';

export default function DatePager({
  current = 'Mon. 12',
  next = 'Tue. 13',
  onPrev,
  onNext,
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPrev}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.arrowButton}
      >
        <ChevronLeft size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.currentDate}>{current}</Text>

      <TouchableOpacity
        onPress={onNext}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.arrowButton}
      >
        <ChevronRight size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.nextDate}>{next}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowButton: {
    padding: 4,
  },
  currentDate: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '400',
  },
  nextDate: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '300',
    opacity: 0.6,
    marginLeft: 4,
  },
});
