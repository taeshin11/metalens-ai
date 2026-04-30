/**
 * Fixed test queries + expected characteristics for eval scoring.
 * These never change — they're the "unit tests" of prompt quality.
 */

export interface TestCase {
  id: string;
  keywords: string;
  mode: 'meta-analysis' | 'gap-finder';
  expectedTraits: {
    minPoints: number;        // minimum numbered findings expected
    mustContainNumbers: boolean;
    mustCitePMIDs: boolean;
    mustHaveBoldHeaders: boolean;
    expectedTopics: string[]; // at least one should appear in output
  };
}

export const TEST_CASES: TestCase[] = [
  {
    id: 'metformin-insulin',
    keywords: 'metformin, insulin, type 2 diabetes, glycemic control, efficacy',
    mode: 'meta-analysis',
    expectedTraits: {
      minPoints: 3,
      mustContainNumbers: true,
      mustCitePMIDs: true,
      mustHaveBoldHeaders: true,
      expectedTopics: ['HbA1c', 'glycemic', 'metformin', 'insulin'],
    },
  },
  {
    id: 'ibuprofen-acetaminophen',
    keywords: 'ibuprofen, acetaminophen, pain, analgesic, efficacy, safety',
    mode: 'meta-analysis',
    expectedTraits: {
      minPoints: 3,
      mustContainNumbers: true,
      mustCitePMIDs: true,
      mustHaveBoldHeaders: true,
      expectedTopics: ['pain', 'ibuprofen', 'acetaminophen', 'NSAID'],
    },
  },
  {
    id: 'ssri-depression',
    keywords: 'sertraline, fluoxetine, depression, SSRI, efficacy, side effects',
    mode: 'meta-analysis',
    expectedTraits: {
      minPoints: 3,
      mustContainNumbers: true,
      mustCitePMIDs: true,
      mustHaveBoldHeaders: true,
      expectedTopics: ['depression', 'serotonin', 'SSRI', 'sertraline', 'fluoxetine'],
    },
  },
  {
    id: 'statin-cardiovascular',
    keywords: 'statin, cardiovascular, mortality, LDL, cholesterol',
    mode: 'meta-analysis',
    expectedTraits: {
      minPoints: 3,
      mustContainNumbers: true,
      mustCitePMIDs: true,
      mustHaveBoldHeaders: true,
      expectedTopics: ['statin', 'LDL', 'cholesterol', 'cardiovascular'],
    },
  },
  {
    id: 'dental-sinusitis-gap',
    keywords: 'dental implant, sinusitis, complication, prospective',
    mode: 'gap-finder',
    expectedTraits: {
      minPoints: 5,
      mustContainNumbers: true,
      mustCitePMIDs: true,
      mustHaveBoldHeaders: true,
      expectedTopics: ['implant', 'sinusitis', 'gap', 'novel'],
    },
  },
];

export interface ScoreBreakdown {
  structure: number;       // 0-25: numbered points, bold headers, format
  dataDensity: number;     // 0-25: numbers, percentages, p-values, CIs
  citations: number;       // 0-25: PMID references present and valid
  relevance: number;       // 0-25: expected topics found in output
  total: number;           // 0-100
}

export function scoreOutput(output: string, testCase: TestCase): ScoreBreakdown {
  const traits = testCase.expectedTraits;

  // --- Structure (0-25) ---
  const numberedPoints = (output.match(/\*\*\d+\./g) || []).length;
  const boldHeaders = (output.match(/\*\*[^*]+\*\*/g) || []).length;
  const hasProperLength = output.length >= 500 && output.length <= 8000;

  let structure = 0;
  structure += Math.min(10, (numberedPoints / traits.minPoints) * 10);
  structure += boldHeaders >= traits.minPoints ? 10 : (boldHeaders / traits.minPoints) * 10;
  structure += hasProperLength ? 5 : (output.length >= 200 ? 2 : 0);

  // --- Data Density (0-25) ---
  const numbers = (output.match(/\d+\.?\d*%|\d+\.?\d*\s*(?:mg|mmHg|kg|ml|CI|OR|RR|HR|NNT|p\s*[<=])/gi) || []).length;
  const pValues = (output.match(/p\s*[<=]\s*0\.\d+/gi) || []).length;
  const ciMatches = (output.match(/(?:95%\s*CI|confidence interval)/gi) || []).length;
  const percentages = (output.match(/\d+\.?\d*%/g) || []).length;

  let dataDensity = 0;
  dataDensity += Math.min(8, numbers * 1.5);
  dataDensity += Math.min(7, pValues * 3);
  dataDensity += Math.min(5, ciMatches * 2.5);
  dataDensity += Math.min(5, percentages * 1);

  // --- Citations (0-25) ---
  const pmidRefs = (output.match(/PMID[:\s]*\d{7,8}/gi) || []).length;
  const pmidParens = (output.match(/\(\d{7,8}\)/g) || []).length;
  const totalCitations = pmidRefs + pmidParens;

  let citations = 0;
  citations += Math.min(15, totalCitations * 3);
  citations += totalCitations >= 3 ? 5 : 0;
  citations += totalCitations >= 5 ? 5 : 0;

  // --- Relevance (0-25) ---
  const lowerOutput = output.toLowerCase();
  const topicsFound = traits.expectedTopics.filter(t => lowerOutput.includes(t.toLowerCase()));
  const topicRatio = topicsFound.length / traits.expectedTopics.length;

  let relevance = 0;
  relevance += topicRatio * 20;
  relevance += topicRatio >= 0.75 ? 5 : (topicRatio >= 0.5 ? 2 : 0);

  // Clamp each to max
  structure = Math.min(25, Math.round(structure));
  dataDensity = Math.min(25, Math.round(dataDensity));
  citations = Math.min(25, Math.round(citations));
  relevance = Math.min(25, Math.round(relevance));

  return {
    structure,
    dataDensity,
    citations,
    relevance,
    total: structure + dataDensity + citations + relevance,
  };
}
