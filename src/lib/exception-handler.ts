import axios from "axios"

export const exceptionHandler = (error: any, message: string) => {
  if (axios.isAxiosError(error)) {
    return `${message}\n${error.message}`
  }
  return `unexpected error: ${error}`
}
