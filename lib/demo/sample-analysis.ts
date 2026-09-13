import type { OpportunityAnalysis } from "@/types/analysis";
import type { SeniorReview } from "@/types/review";
import type { TrustSnapshot } from "@/types/trust";

/** Static demo data for the landing preview. Not an API response. */
export const DEMO_ANALYSIS: OpportunityAnalysis = {
  opportunityId: "demo-xyz-web-intern",
  overallScore: {
    value: 6.4,
    evidence: "ai_interpretation",
    note: "Scored only from the pasted text. Not a ranking of the company.",
  },
  category: {
    value: "internship",
    evidence: "user_provided",
  },
  verdict: {
    value:
      "Could be beginner practice if the work is real. Unpaid time plus a certificate is a common weak signal — verify what you will actually ship.",
    evidence: "ai_interpretation",
  },
  strengths: [
    {
      value: "The listed stack (HTML, CSS, JavaScript) is clear for a first-year learner.",
      evidence: "ai_interpretation",
    },
  ],
  concerns: [
    {
      value: "Stipend is ₹0. Learning quality and supervision are unknown from this text.",
      evidence: "ai_interpretation",
    },
  ],
  skillsGained: [
    { value: "HTML, CSS, JavaScript (listed)", evidence: "user_provided" },
    { value: "Possible real-world workflow exposure", evidence: "unverified" },
  ],
  experienceValue: {
    value: "Limited resume signal unless you can point to shipped work.",
    evidence: "ai_interpretation",
  },
  learningValue: {
    value: "Useful if you have no projects yet; less useful if you already build on your own.",
    evidence: "ai_interpretation",
  },
  relevance: {
    value: "Fits a first-year CSE student exploring web development — if the tasks are genuine.",
    evidence: "ai_interpretation",
  },
  riskLevel: {
    value: "moderate",
    evidence: "ai_interpretation",
  },
  bestSuitedFor: {
    value: "Absolute beginners who can afford unpaid time and will ask for a written task list.",
    evidence: "ai_interpretation",
  },
  missingToVerify: [
    "Who supervises you and what you will ship in 3 months",
    "Whether the certificate is from a known body or only the company",
    "Offer letter, weekly hours, and whether unpaid work is expected full-time",
  ],
  extractedFromUser: {
    company: "XYZ",
    role: "Web Development Intern",
    duration: "3 months",
    stipend: "₹0",
    certificate: "Yes",
    requirements: "HTML, CSS, JavaScript",
  },
  limitations: [
    "Cannot confirm the company exists or that the offer is genuine from this paste alone.",
  ],
};

export const DEMO_REVIEWS: SeniorReview[] = [
  {
    id: "demo-review-1",
    opportunityId: "demo-xyz-web-intern",
    authorId: "demo-user-1",
    studentYear: 3,
    branch: "CSE",
    experienceDuration: "3 months",
    body: "I participated in this program last year. The certificate was genuine, but the actual technical work was limited.",
    rating: 5.8,
    createdAt: "2025-11-02T00:00:00.000Z",
    usefulCount: 14,
    notUsefulCount: 2,
  },
];

export const DEMO_TRUST: TrustSnapshot = {
  aiScore: 6.4,
  seniorConsensus: 5.8,
  reviewCount: 1,
  verificationStatus: "unverified",
  freshness: "aging",
  disclaimer: "These are personal experiences, not universal facts.",
};
