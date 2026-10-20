import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme?: "primary";
  onPress: () => void;
  disabled?: boolean;
};

<<<<<<< HEAD
export default function AppButton({ title, icon, theme, onPress }: Props) {
  if (theme === "primary") {
    return (
      <View
        style={[
          styles.buttonOuter,
          {
            borderWidth: 1,
            borderColor: COLORS.primary,
            borderRadius: 10,
          },
        ]}
      >
        <Pressable
          style={[styles.buttonInner, { backgroundColor: COLORS.primary }]}
          onPress={onPress}
        >
          <Ionicons
            name={icon}
            size={22}
            color={COLORS.textOnPrimary}
            style={styles.icon}
          />
          <Text
            style={[
              styles.label,
              {
                color: COLORS.textOnPrimary,
                fontWeight: "700",
              },
            ]}
          >
            {title}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.buttonOuter}>
      <Pressable style={styles.buttonInner} onPress={onPress}>
        <Ionicons
          name={icon}
          size={22}
          color={COLORS.textSecondary}
          style={styles.icon}
        />
        <Text style={styles.label}>{title}</Text>
=======
export default function AppButton({
  title,
  icon,
  theme,
  onPress,
  disabled = false,
}: Props) {
  const isPrimary = theme === "primary";

  return (
    <View style={styles.buttonOuter}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.buttonInner,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
          disabled && styles.disabledButton,
          pressed && !disabled && styles.pressedButton,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            disabled
              ? COLORS.textMuted
              : isPrimary
                ? COLORS.textOnPrimary
                : COLORS.primary
          }
          style={styles.icon}
        />

        <Text
          style={[
            styles.label,
            isPrimary && styles.primaryLabel,
            disabled && styles.disabledLabel,
          ]}
        >
          {title}
        </Text>
>>>>>>> origin/main
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonOuter: {
    width: "100%",
    marginBottom: 14,
  },

  buttonInner: {
<<<<<<< HEAD
    borderRadius: 10,
    paddingVertical: 16,
=======
    minHeight: 54,
    borderRadius: 16,
    paddingVertical: 15,
>>>>>>> origin/main
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
<<<<<<< HEAD
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  icon: {
    paddingRight: 10,
  },

  label: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
=======
    borderWidth: 1,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },

  secondaryButton: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },

  pressedButton: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  disabledButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },

  icon: {
    marginRight: 10,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  primaryLabel: {
    color: COLORS.textOnPrimary,
  },

  disabledLabel: {
    color: COLORS.textMuted,
  },
>>>>>>> origin/main
});