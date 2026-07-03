import type { SessionKind } from '../sessions';

/** 各セットの授業タイムライン1ステップ */
export interface Round {
  sessionNo: number;
  date: string;
  kind: SessionKind;
  /** タイムライン上の段階名（例：デスクリサーチ） */
  phase: string;
  title: string;
  /** 高校生・保護者向けの概要（1〜2文） */
  summary: string;
  /** 授業で具体的に行うこと */
  points: string[];
  /** 授業後の取り組み（任意） */
  task?: string;
}
