export type Meta = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
};

export type Answers = Record<string, string | string[]>;

export type BrandDNA = {
  essence: string;
  positioning: string;
  primaryAudiences: string[];
  secondaryAudiences: string[];
  customerNeeds: string[];
  valueProposition: string;
  values: { name: string; explanation: string }[];
  personality: string[];
  brandIs: string[];
  brandIsNot: string[];
  archetype: { primary: string; secondary: string; rationale: string };
  toneOfVoice: { principles: string[]; avoid: string[]; examples: string[] };
  elevatorPitch: string;
  headlines: string[];
  visualDirection: string[];
  differentiation: string[];
  proofPoints: string[];
  websiteStructure: { title: string; purpose: string }[];
  primaryCTA: string;
  secondaryCTA: string;
  contentPriorities: string[];
  seoThemes: string[];
  marketingOpportunities: string[];
  gapsAndRisks: string[];
  longTermCare: string[];
};
