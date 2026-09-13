import type { StudentYear } from "./common";

export type SeniorReview = {
  id: string;
  opportunityId: string;
  authorId: string;
  studentYear: StudentYear;
  branch: string;
  experienceDuration?: string;
  body: string;
  rating?: number;
  createdAt: string;
  usefulCount: number;
  notUsefulCount: number;
};
