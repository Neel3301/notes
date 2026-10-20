import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import { colors, radius } from '../theme/tokens';

export default function NoteCard({
  color = 'blue',
  author,
  title,
  time,
  liked,
  fullWidth = false,
  onLikeToggle,
  onPress,
}) {
  const bgColors = {
    blue: colors.cardBlue,
    light: colors.cardLight,
    yellow: colors.cardYellow,
  };

  const backgroundColor = bgColors[color] || colors.cardBlue;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor },
        fullWidth ? styles.fullWidth : styles.carouselWidth,
      ]}
    >
      {/* Top Row: Author & Heart */}
      <View style={styles.topRow}>
        <Text style={styles.author}>{author}</Text>
        {liked !== undefined && (
          <TouchableOpacity
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={(e) => {
              e.stopPropagation();
              onLikeToggle?.();
            }}
          >
            <Heart
              size={20}
              color={colors.cardText}
              fill={liked ? colors.cardText : 'transparent'}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Center: Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={4}>
          {title}
        </Text>
      </View>

      {/* Bottom: Time */}
      {time ? (
        <View style={styles.bottomRow}>
          <Text style={styles.time}>{time}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 320,
    borderRadius: radius.card,
    padding: 20,
    justifyContent: 'space-between',
  },
  carouselWidth: {
    width: 236,
  },
  fullWidth: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: 12,
    color: colors.cardText,
    opacity: 0.9,
    fontWeight: '400',
  },
  titleContainer: {
    marginVertical: 'auto',
    paddingVertical: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.cardText,
    letterSpacing: -0.8,
    lineHeight: 31,
  },
  bottomRow: {
    paddingTop: 4,
  },
  time: {
    fontSize: 12,
    color: colors.cardText,
    opacity: 0.8,
  },
});
