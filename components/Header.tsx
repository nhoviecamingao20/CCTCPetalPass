<<<<<<< HEAD
import { MaterialIcons } from "@expo/vector-icons";
=======
>>>>>>> origin/main
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";

type Props = { title: string };

export default function Header({ title }: Props) {
  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <View style={styles.logoCircle}>
        <MaterialIcons name="school" size={36} color={COLORS.primary} />
      </View>
=======
>>>>>>> origin/main
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
<<<<<<< HEAD
    paddingVertical: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
=======
    paddingVertical: 12,
>>>>>>> origin/main
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
});