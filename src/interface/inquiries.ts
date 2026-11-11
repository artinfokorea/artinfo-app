export interface InquiryPayload {
  title: string;
  email: string;
  contents: string;
  /** 스팸 방지 — 폼을 연 시각 (epoch ms) */
  startedAt?: number;
}
