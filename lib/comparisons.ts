export interface ComparisonData {
  drug1: string;
  drug2: string;
  conditionKey: string;
  keywords: string;
}

export const COMPARISONS: Record<string, ComparisonData> = {
  // ── Original 6 ──
  'pranlukast-vs-montelukast': { drug1: 'Pranlukast', drug2: 'Montelukast', conditionKey: 'asthma', keywords: 'pranlukast, montelukast, asthma, efficacy, safety' },
  'metformin-vs-insulin': { drug1: 'Metformin', drug2: 'Insulin', conditionKey: 'diabetes', keywords: 'metformin, insulin, type 2 diabetes, glycemic control, efficacy' },
  'ibuprofen-vs-acetaminophen': { drug1: 'Ibuprofen', drug2: 'Acetaminophen', conditionKey: 'pain', keywords: 'ibuprofen, acetaminophen, pain, analgesic, efficacy, safety' },
  'lisinopril-vs-losartan': { drug1: 'Lisinopril', drug2: 'Losartan', conditionKey: 'hypertension', keywords: 'lisinopril, losartan, hypertension, blood pressure, efficacy' },
  'omeprazole-vs-pantoprazole': { drug1: 'Omeprazole', drug2: 'Pantoprazole', conditionKey: 'gerd', keywords: 'omeprazole, pantoprazole, GERD, acid reflux, proton pump inhibitor' },
  'sertraline-vs-fluoxetine': { drug1: 'Sertraline', drug2: 'Fluoxetine', conditionKey: 'depression', keywords: 'sertraline, fluoxetine, depression, SSRI, efficacy, side effects' },

  // ── Cardiovascular ──
  'atorvastatin-vs-rosuvastatin': { drug1: 'Atorvastatin', drug2: 'Rosuvastatin', conditionKey: 'cholesterol', keywords: 'atorvastatin, rosuvastatin, statin, LDL, cholesterol, cardiovascular' },
  'amlodipine-vs-nifedipine': { drug1: 'Amlodipine', drug2: 'Nifedipine', conditionKey: 'hypertension', keywords: 'amlodipine, nifedipine, calcium channel blocker, hypertension, blood pressure' },
  'warfarin-vs-rivaroxaban': { drug1: 'Warfarin', drug2: 'Rivaroxaban', conditionKey: 'anticoagulation', keywords: 'warfarin, rivaroxaban, anticoagulant, atrial fibrillation, DVT, bleeding risk' },
  'clopidogrel-vs-ticagrelor': { drug1: 'Clopidogrel', drug2: 'Ticagrelor', conditionKey: 'antiplatelet', keywords: 'clopidogrel, ticagrelor, antiplatelet, acute coronary syndrome, stent thrombosis' },
  'metoprolol-vs-atenolol': { drug1: 'Metoprolol', drug2: 'Atenolol', conditionKey: 'hypertension', keywords: 'metoprolol, atenolol, beta blocker, hypertension, heart failure' },
  'valsartan-vs-telmisartan': { drug1: 'Valsartan', drug2: 'Telmisartan', conditionKey: 'hypertension', keywords: 'valsartan, telmisartan, ARB, hypertension, renal protection' },

  // ── Diabetes ──
  'sitagliptin-vs-empagliflozin': { drug1: 'Sitagliptin', drug2: 'Empagliflozin', conditionKey: 'diabetes', keywords: 'sitagliptin, empagliflozin, DPP-4, SGLT2, type 2 diabetes, HbA1c' },
  'glimepiride-vs-gliclazide': { drug1: 'Glimepiride', drug2: 'Gliclazide', conditionKey: 'diabetes', keywords: 'glimepiride, gliclazide, sulfonylurea, type 2 diabetes, hypoglycemia' },
  'liraglutide-vs-semaglutide': { drug1: 'Liraglutide', drug2: 'Semaglutide', conditionKey: 'diabetes', keywords: 'liraglutide, semaglutide, GLP-1, weight loss, type 2 diabetes, cardiovascular' },
  'dapagliflozin-vs-empagliflozin': { drug1: 'Dapagliflozin', drug2: 'Empagliflozin', conditionKey: 'diabetes', keywords: 'dapagliflozin, empagliflozin, SGLT2, heart failure, kidney, type 2 diabetes' },
  'pioglitazone-vs-rosiglitazone': { drug1: 'Pioglitazone', drug2: 'Rosiglitazone', conditionKey: 'diabetes', keywords: 'pioglitazone, rosiglitazone, thiazolidinedione, insulin resistance, cardiovascular risk' },

  // ── Pain / Anti-inflammatory ──
  'naproxen-vs-diclofenac': { drug1: 'Naproxen', drug2: 'Diclofenac', conditionKey: 'pain', keywords: 'naproxen, diclofenac, NSAID, pain, inflammation, arthritis, safety' },
  'celecoxib-vs-ibuprofen': { drug1: 'Celecoxib', drug2: 'Ibuprofen', conditionKey: 'pain', keywords: 'celecoxib, ibuprofen, COX-2, NSAID, arthritis, GI safety' },
  'tramadol-vs-codeine': { drug1: 'Tramadol', drug2: 'Codeine', conditionKey: 'pain', keywords: 'tramadol, codeine, opioid, moderate pain, side effects, dependence' },
  'pregabalin-vs-gabapentin': { drug1: 'Pregabalin', drug2: 'Gabapentin', conditionKey: 'neuropathy', keywords: 'pregabalin, gabapentin, neuropathic pain, fibromyalgia, seizure' },
  'morphine-vs-oxycodone': { drug1: 'Morphine', drug2: 'Oxycodone', conditionKey: 'pain', keywords: 'morphine, oxycodone, opioid, severe pain, postoperative, cancer pain' },

  // ── Psychiatry ──
  'escitalopram-vs-sertraline': { drug1: 'Escitalopram', drug2: 'Sertraline', conditionKey: 'depression', keywords: 'escitalopram, sertraline, SSRI, depression, anxiety, tolerability' },
  'venlafaxine-vs-duloxetine': { drug1: 'Venlafaxine', drug2: 'Duloxetine', conditionKey: 'depression', keywords: 'venlafaxine, duloxetine, SNRI, depression, neuropathic pain, anxiety' },
  'quetiapine-vs-olanzapine': { drug1: 'Quetiapine', drug2: 'Olanzapine', conditionKey: 'psychosis', keywords: 'quetiapine, olanzapine, antipsychotic, schizophrenia, bipolar, weight gain' },
  'aripiprazole-vs-risperidone': { drug1: 'Aripiprazole', drug2: 'Risperidone', conditionKey: 'psychosis', keywords: 'aripiprazole, risperidone, antipsychotic, schizophrenia, prolactin, metabolic' },
  'methylphenidate-vs-amphetamine': { drug1: 'Methylphenidate', drug2: 'Amphetamine', conditionKey: 'adhd', keywords: 'methylphenidate, amphetamine, ADHD, stimulant, attention, children, adults' },
  'lorazepam-vs-diazepam': { drug1: 'Lorazepam', drug2: 'Diazepam', conditionKey: 'anxiety', keywords: 'lorazepam, diazepam, benzodiazepine, anxiety, seizure, sedation' },
  'bupropion-vs-fluoxetine': { drug1: 'Bupropion', drug2: 'Fluoxetine', conditionKey: 'depression', keywords: 'bupropion, fluoxetine, depression, smoking cessation, weight, sexual dysfunction' },

  // ── Respiratory ──
  'fluticasone-vs-budesonide': { drug1: 'Fluticasone', drug2: 'Budesonide', conditionKey: 'asthma', keywords: 'fluticasone, budesonide, inhaled corticosteroid, asthma, COPD' },
  'tiotropium-vs-ipratropium': { drug1: 'Tiotropium', drug2: 'Ipratropium', conditionKey: 'copd', keywords: 'tiotropium, ipratropium, anticholinergic, COPD, bronchodilator' },
  'salbutamol-vs-formoterol': { drug1: 'Salbutamol', drug2: 'Formoterol', conditionKey: 'asthma', keywords: 'salbutamol, formoterol, beta-agonist, asthma, bronchodilator, rescue' },

  // ── Gastrointestinal ──
  'esomeprazole-vs-lansoprazole': { drug1: 'Esomeprazole', drug2: 'Lansoprazole', conditionKey: 'gerd', keywords: 'esomeprazole, lansoprazole, PPI, GERD, peptic ulcer, acid suppression' },
  'ranitidine-vs-famotidine': { drug1: 'Ranitidine', drug2: 'Famotidine', conditionKey: 'gerd', keywords: 'ranitidine, famotidine, H2 blocker, GERD, acid reflux, NDMA' },
  'mesalamine-vs-sulfasalazine': { drug1: 'Mesalamine', drug2: 'Sulfasalazine', conditionKey: 'ibd', keywords: 'mesalamine, sulfasalazine, 5-ASA, ulcerative colitis, Crohn disease, IBD' },

  // ── Antibiotics ──
  'amoxicillin-vs-azithromycin': { drug1: 'Amoxicillin', drug2: 'Azithromycin', conditionKey: 'infection', keywords: 'amoxicillin, azithromycin, antibiotic, respiratory infection, pneumonia, sinusitis' },
  'ciprofloxacin-vs-levofloxacin': { drug1: 'Ciprofloxacin', drug2: 'Levofloxacin', conditionKey: 'infection', keywords: 'ciprofloxacin, levofloxacin, fluoroquinolone, UTI, respiratory infection' },
  'doxycycline-vs-minocycline': { drug1: 'Doxycycline', drug2: 'Minocycline', conditionKey: 'infection', keywords: 'doxycycline, minocycline, tetracycline, acne, Lyme disease, MRSA' },
  'vancomycin-vs-linezolid': { drug1: 'Vancomycin', drug2: 'Linezolid', conditionKey: 'infection', keywords: 'vancomycin, linezolid, MRSA, pneumonia, skin infection, gram-positive' },
  'ceftriaxone-vs-cefotaxime': { drug1: 'Ceftriaxone', drug2: 'Cefotaxime', conditionKey: 'infection', keywords: 'ceftriaxone, cefotaxime, cephalosporin, meningitis, sepsis, neonatal' },

  // ── Oncology ──
  'tamoxifen-vs-letrozole': { drug1: 'Tamoxifen', drug2: 'Letrozole', conditionKey: 'cancer', keywords: 'tamoxifen, letrozole, breast cancer, hormone receptor, aromatase inhibitor, SERM' },
  'pembrolizumab-vs-nivolumab': { drug1: 'Pembrolizumab', drug2: 'Nivolumab', conditionKey: 'cancer', keywords: 'pembrolizumab, nivolumab, PD-1, immunotherapy, lung cancer, melanoma' },

  // ── Dermatology ──
  'tretinoin-vs-adapalene': { drug1: 'Tretinoin', drug2: 'Adapalene', conditionKey: 'acne', keywords: 'tretinoin, adapalene, retinoid, acne, anti-aging, skin irritation' },
  'terbinafine-vs-fluconazole': { drug1: 'Terbinafine', drug2: 'Fluconazole', conditionKey: 'fungal', keywords: 'terbinafine, fluconazole, antifungal, onychomycosis, tinea, candidiasis' },

  // ── Thyroid ──
  'levothyroxine-vs-liothyronine': { drug1: 'Levothyroxine', drug2: 'Liothyronine', conditionKey: 'thyroid', keywords: 'levothyroxine, liothyronine, T4, T3, hypothyroidism, thyroid replacement' },

  // ── Osteoporosis ──
  'alendronate-vs-risedronate': { drug1: 'Alendronate', drug2: 'Risedronate', conditionKey: 'osteoporosis', keywords: 'alendronate, risedronate, bisphosphonate, osteoporosis, fracture prevention' },
  'denosumab-vs-zoledronic-acid': { drug1: 'Denosumab', drug2: 'Zoledronic Acid', conditionKey: 'osteoporosis', keywords: 'denosumab, zoledronic acid, osteoporosis, bone density, fracture, RANK-L' },
};

export const ALL_COMPARE_SLUGS = Object.keys(COMPARISONS);
