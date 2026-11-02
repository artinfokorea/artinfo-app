import React, { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { colors } from "@/constants/theme"
import { PROVINCE } from "@/types"
import { JobTimeType, JobType, JobTypeList, JobTypeValues, MajorGroupField } from "@/types/jobs"
import { ArtField, PartTimeMajorGroup, ProfessionalFieldTypes } from "@/types/majors"

/* --------------------------------------------------- 정규직/아마추어/소년소녀 */

const TIME_TYPES = [
  { value: JobTimeType.FULL_TIME, label: "정규직" },
  { value: JobTimeType.AMATEUR, label: "아마추어" },
  { value: JobTimeType.YOUTH, label: "소년 ∙ 소녀" },
]

/** 웹 components/jobs/MobileJobTypeTab (단기직 탭은 웹에서도 주석 처리되어 있어 제외) */
export const JobTimeTypeTab = ({
  value,
  onChange,
}: {
  value: JobTimeType
  onChange: (value: JobTimeType) => void
}) => (
  <View style={[styles.box, { marginBottom: 8 }]}>
    <View style={styles.row}>
      {TIME_TYPES.map(type => {
        const active = value === type.value
        return (
          <Pressable
            key={type.value}
            onPress={() => onChange(type.value)}
            style={[styles.tab, active && { backgroundColor: colors.main }]}
          >
            <Text style={[styles.tabText, active && { color: colors.white }]}>{type.label}</Text>
          </Pressable>
        )
      })}
    </View>
  </View>
)

/* ------------------------------------------------------- 직군 · 지역 · 분야 */

export type JobFilters = {
  recruit: JobType | ""
  provinceId: string
  professional: ProfessionalFieldTypes | ""
  majorGroup: MajorGroupField | ""
}

type Tab = "RECRUIT" | "REGION" | "MAJOR"

type Props = {
  jobTimeType: JobTimeType
  filters: JobFilters
  onChange: (next: Partial<JobFilters>) => void
  provinces?: PROVINCE[]
  artFields?: ArtField[]
  majorGroups?: PartTimeMajorGroup[]
}

/**
 * 웹 components/common/MobileFilterTab(정규직) + MobilePartTimeTab(아마추어/소년소녀).
 * 탭을 누르면 아래로 옵션 목록이 펼쳐지고, 고르면 닫힌다.
 */
export const JobFilterTabs = ({ jobTimeType, filters, onChange, provinces, artFields, majorGroups }: Props) => {
  const [open, setOpen] = useState<Tab>()
  const isFullTime = jobTimeType === JobTimeType.FULL_TIME

  const provinceName = useMemo(
    () => provinces?.find(p => String(p.id) === filters.provinceId)?.name.substring(0, 2),
    [provinces, filters.provinceId],
  )
  const professionalName = artFields?.find(f => f.nameEn === filters.professional)?.nameKo
  const majorGroupName = majorGroups?.find(g => g.nameEn === filters.majorGroup)?.nameKo

  const toggle = (tab: Tab) => setOpen(prev => (prev === tab ? undefined : tab))
  const pick = (next: Partial<JobFilters>) => {
    onChange(next)
    setOpen(undefined)
  }

  const tabs: { key: Tab; label: string }[] = isFullTime
    ? [
        { key: "RECRUIT", label: filters.recruit ? JobTypeValues[filters.recruit] : "직군" },
        { key: "REGION", label: provinceName ?? "지역" },
        { key: "MAJOR", label: professionalName ?? "분야" },
      ]
    : [
        { key: "REGION", label: provinceName ?? "지역" },
        { key: "MAJOR", label: majorGroupName ?? "분야" },
      ]

  return (
    <View style={styles.box}>
      <View style={styles.row}>
        {tabs.map(tab => (
          <Pressable
            key={tab.key}
            onPress={() => toggle(tab.key)}
            style={[styles.tab, open === tab.key && { backgroundColor: colors.whitesmoke }]}
          >
            <Text style={styles.tabText}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {open === "RECRUIT" ? (
        <View style={styles.options}>
          <Option label="전체" onPress={() => pick({ recruit: "" })} />
          {JobTypeList.map(type => (
            <Option key={type.value} label={type.title} onPress={() => pick({ recruit: type.value })} />
          ))}
        </View>
      ) : null}

      {open === "REGION" ? (
        <View style={styles.grid}>
          <GridOption label="전체" onPress={() => pick({ provinceId: "" })} />
          {provinces?.map(province => (
            <GridOption
              key={province.id}
              label={province.name.slice(0, 2)}
              onPress={() => pick({ provinceId: String(province.id) })}
            />
          ))}
        </View>
      ) : null}

      {open === "MAJOR" ? (
        <View style={styles.options}>
          {isFullTime ? (
            <>
              <Option label="전체" onPress={() => pick({ professional: "" })} />
              {artFields?.map(field => (
                <Option key={field.nameEn} label={field.nameKo} onPress={() => pick({ professional: field.nameEn })} />
              ))}
            </>
          ) : (
            <>
              <Option label="전체" onPress={() => pick({ majorGroup: "" })} />
              {majorGroups?.map(group => (
                <Option key={group.nameEn} label={group.nameKo} onPress={() => pick({ majorGroup: group.nameEn })} />
              ))}
            </>
          )}
        </View>
      ) : null}
    </View>
  )
}

const Option = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.option}>
    <Text style={styles.optionText}>{label}</Text>
  </Pressable>
)

const GridOption = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.gridOption}>
    <Text style={styles.optionText}>{label}</Text>
  </Pressable>
)

const styles = StyleSheet.create({
  box: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 4,
    overflow: "hidden",
  },
  row: { flexDirection: "row" },
  tab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 4 },
  tabText: { fontSize: 14, color: colors.main },
  options: { paddingHorizontal: 8, paddingVertical: 12, gap: 2 },
  option: { paddingHorizontal: 16, paddingVertical: 8 },
  optionText: { fontWeight: "600", color: colors.coolgray, fontSize: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8, paddingVertical: 12 },
  gridOption: { width: "20%", paddingVertical: 8, alignItems: "center" },
})
