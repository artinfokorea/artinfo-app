import dayjs from "dayjs"
import "dayjs/locale/ko"
import relativeTime from "dayjs/plugin/relativeTime"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(relativeTime)
dayjs.locale("ko")
dayjs.extend(utc)
dayjs.extend(timezone)
/** 한국 시간 오프셋(분). Hermes 엔진은 Intl 타임존 변환이 불완전해서 dayjs.tz() 대신 utcOffset 으로 고정한다 */
const KST_OFFSET_MINUTES = 9 * 60
dayjs.tz.setDefault("Asia/Seoul")

export default function filters() {
  return {
    /** 날짜를 한국 시간(Asia/Seoul) 기준으로 포맷한다 — 기기 시간대와 상관없이 웹과 같은 문자열 */
    YYYYMMDD(date?: Date | string | null, format = "YYYY.MM.DD") {
      if (!date) {
        return null
      }

      return dayjs(date).utcOffset(KST_OFFSET_MINUTES).format(format)
    },
    DIFF_FROM_NOW_ADD_TIME(date?: Date | string | null, format = "YYYY.MM.DD") {
      if (!date) {
        return null
      }

      const originalDate = dayjs(date)

      const dateWith9HoursAdded = originalDate.add(9, "hour")

      const result = dateWith9HoursAdded.format(format)

      return result
    },
    IS_DATE_FUTURE(value?: string | null | Date) {
      if (!value) {
        return false
      }
      return new Date(value) > new Date()
    },
    DIFF_FROM_NOW(value?: string | Date | null) {
      if (!value) {
        return undefined
      }
      const d = dayjs(value) as any
      return d.diff(dayjs().startOf("day"), "day")
    },
    DIFF(
      value?: string | Date | null,
      unit?:
        | "hour"
        | "millisecond"
        | "second"
        | "minute"
        | "day"
        | "month"
        | "year"
        | "date"
        | "milliseconds",
    ) {
      if (!value) {
        return undefined
      }
      const now = dayjs()
      const d = dayjs(value) as any
      return now.diff(d, unit ?? "hour")
    },
    FROM_NOW(value?: string | Date | null) {
      if (!value) {
        return undefined
      }

      const originalDate = dayjs(value)

      const dateWith9HoursAdded = originalDate.add(9, "hour")

      return dayjs(dateWith9HoursAdded).fromNow()
    },
    FROM_NOW_COMMENT(value?: string | Date | null) {
      if (!value) {
        return undefined
      }

      const originalDate = dayjs(value)

      return dayjs(originalDate).fromNow()
    },

    EXTRACT_URL(text?: string) {
      if (!text) {
        return null
      }

      // 정규식 패턴
      const urlPattern = /(https?:\/\/[^\s]+)/

      // 텍스트에서 URL 추출
      const match = text.match(urlPattern)

      // console.error('URL을 찾을 수 없습니다.')
      return match ? match[0] : null
    },
    CASHCOMMA(value: number | string) {
      let num = value
      if (!value) {
        return 0
      }
      if (typeof value === "string") {
        num = parseInt(value, 10)
      }
      num = Math.round((value as number) / 1000)
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    FEECOMMA(value: number | string) {
      let num = value
      if (!value) {
        return 0
      }
      if (typeof value === "string") {
        num = parseInt(value, 10)
      }

      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    URLFY(text?: string) {
      if (!text) {
        return
      }
      const urlRegex = /(https?:\/\/[^\s]+)/g
      return text.replace(urlRegex, url => {
        return `<a href="${url}">${url}</a>`
      })
    },
  }
}
