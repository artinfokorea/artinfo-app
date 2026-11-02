import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { colors } from "@/constants/theme"

export type ActivitiesTab = "posted" | "applied"

const TABS: { tab: ActivitiesTab; title: string }[] = [
  { tab: "posted", title: "내 연주" },
  { tab: "applied", title: "참여 연주" },
]

/** 웹 components/activities/ActivitiesTypeTab */
export const ActivitiesTypeTab = ({
  tab,
  onChange,
}: {
  tab: ActivitiesTab
  onChange: (tab: ActivitiesTab) => void
}) => (
  <View style={styles.container}>
    {TABS.map(item => {
      const active = item.tab === tab
      return (
        <Pressable
          key={item.tab}
          onPress={() => onChange(item.tab)}
          style={[styles.tab, active && { backgroundColor: colors.main }]}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
        >
          <Text style={[styles.text, active && { color: colors.white }]}>{item.title}</Text>
        </Pressable>
      )
    })}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 4 },
  text: { color: colors.main, fontSize: 14 },
})
