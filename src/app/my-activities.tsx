import { useQueryClient } from "@tanstack/react-query"
import { Stack } from "expo-router"
import React, { useState } from "react"
import { RefreshControl, ScrollView } from "react-native"

import { ActivitiesTab, ActivitiesTypeTab } from "@/components/activities/ActivitiesTypeTab"
import { JoinedList } from "@/components/activities/JoinedList"
import { PostedList } from "@/components/activities/PostedList"
import { useSignInRedirect } from "@/components/profile/useSignInRedirect"
import { Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"

/** 웹 app/(private)/my-activities */
export default function MyActivitiesScreen() {
  const canView = useSignInRedirect()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<ActivitiesTab>("posted")
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await queryClient.invalidateQueries({ queryKey: queries.jobs._def })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: "내 활동" }} />
      {!canView ? (
        <Loading />
      ) : (
        <ScrollView
          style={{ backgroundColor: colors.white }}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <ActivitiesTypeTab tab={tab} onChange={setTab} />
          {tab === "posted" ? <PostedList /> : <JoinedList />}
        </ScrollView>
      )}
    </>
  )
}
