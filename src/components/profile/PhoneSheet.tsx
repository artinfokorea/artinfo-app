import React, { useEffect, useState } from "react"

import { DialogSheet } from "@/components/profile/DialogSheet"
import { Button, TextField } from "@/components/ui/primitives"

type Props = {
  visible: boolean
  onClose: () => void
  sendCode: (phone: string) => Promise<void> | void
  checkCode: (phone: string, code: string) => Promise<void> | void
  isLoading: boolean
}

const PHONE_REGEX = /^01([0|1|6|7|8|9])-?([0-9]{4})-?([0-9]{4})$/

const maskPhone = (value: string) =>
  value.replace(/\D/g, "").replace(/(\d{3})(\d{3,4})(\d{4})/g, "$1-$2-$3")

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  return `${minutes.toString().padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`
}

/** 웹 components/dialog/PhoneDialog — 휴대폰 번호 등록 (3분 타이머) */
export const PhoneSheet = ({ visible, onClose, sendCode, checkCode, isLoading }: Props) => {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [time, setTime] = useState(180)
  const [isTimerStarted, setIsTimerStarted] = useState(false)
  // 3분이 지나면 자동으로 타이머가 멈춘다
  const isCounting = isTimerStarted && time > 0

  const isValidPhone = PHONE_REGEX.test(phone)

  useEffect(() => {
    if (!isCounting) return
    const id = setInterval(() => setTime(prev => prev - 1), 1000)
    return () => clearInterval(id)
  }, [isCounting, time])

  const close = () => {
    setPhone("")
    setCode("")
    setTime(180)
    setIsTimerStarted(false)
    onClose()
  }

  return (
    <DialogSheet
      visible={visible}
      title="휴대폰 번호등록"
      onClose={close}
      footer={<Button title="닫기" variant="muted" onPress={close} />}
    >
      <TextField
        label="휴대폰 번호"
        value={phone}
        onChangeText={text => setPhone(maskPhone(text))}
        placeholder="01012344321"
        keyboardType="number-pad"
        textContentType="telephoneNumber"
        maxLength={13}
        right={
          isCounting ? (
            <Button title={formatTime(time)} size="sm" variant="outline" disabled />
          ) : (
            <Button
              title="번호인증"
              size="sm"
              disabled={!isValidPhone}
              onPress={() => {
                setTime(180)
                setIsTimerStarted(true)
                sendCode(phone)
              }}
            />
          )
        }
      />
      <TextField
        label="휴대폰 인증번호"
        value={code}
        onChangeText={setCode}
        placeholder="013211"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={6}
        right={
          <Button
            title="인증확인"
            size="sm"
            loading={isLoading}
            disabled={code.length !== 6}
            onPress={async () => {
              await checkCode(phone, code)
            }}
          />
        }
      />
    </DialogSheet>
  )
}
