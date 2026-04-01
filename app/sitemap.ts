import { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES, SITE_URL } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/about', '/how-it-works', '/faq', '/privacy', '/terms', '/blog', '/use-cases', '/pricing'];
  const blogSlugs = ['what-is-meta-analysis', 'ai-in-medical-research', 'how-to-compare-drug-efficacy'];
  // Massively expanded drug comparisons for programmatic SEO
  const compareSlugs = [
    // Original 6
    'pranlukast-vs-montelukast', 'metformin-vs-insulin', 'ibuprofen-vs-acetaminophen',
    'lisinopril-vs-losartan', 'omeprazole-vs-pantoprazole', 'sertraline-vs-fluoxetine',
    // Cardiovascular
    'atorvastatin-vs-rosuvastatin', 'amlodipine-vs-nifedipine', 'warfarin-vs-rivaroxaban',
    'clopidogrel-vs-ticagrelor', 'metoprolol-vs-atenolol', 'valsartan-vs-telmisartan',
    // Diabetes
    'sitagliptin-vs-empagliflozin', 'glimepiride-vs-gliclazide', 'liraglutide-vs-semaglutide',
    'dapagliflozin-vs-empagliflozin', 'pioglitazone-vs-rosiglitazone',
    // Pain / Anti-inflammatory
    'naproxen-vs-diclofenac', 'celecoxib-vs-ibuprofen', 'tramadol-vs-codeine',
    'pregabalin-vs-gabapentin', 'morphine-vs-oxycodone',
    // Psychiatry
    'escitalopram-vs-sertraline', 'venlafaxine-vs-duloxetine', 'quetiapine-vs-olanzapine',
    'aripiprazole-vs-risperidone', 'methylphenidate-vs-amphetamine',
    'lorazepam-vs-diazepam', 'bupropion-vs-fluoxetine',
    // Respiratory
    'fluticasone-vs-budesonide', 'tiotropium-vs-ipratropium', 'salbutamol-vs-formoterol',
    // GI
    'esomeprazole-vs-lansoprazole', 'ranitidine-vs-famotidine', 'mesalamine-vs-sulfasalazine',
    // Antibiotics
    'amoxicillin-vs-azithromycin', 'ciprofloxacin-vs-levofloxacin', 'doxycycline-vs-minocycline',
    'vancomycin-vs-linezolid', 'ceftriaxone-vs-cefotaxime',
    // Oncology
    'tamoxifen-vs-letrozole', 'pembrolizumab-vs-nivolumab',
    // Dermatology
    'tretinoin-vs-adapalene', 'terbinafine-vs-fluconazole',
    // Thyroid
    'levothyroxine-vs-liothyronine',
    // Osteoporosis
    'alendronate-vs-risedronate', 'denosumab-vs-zoledronic-acid',
  ];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const page of pages) {
      entries.push({
        url: `${SITE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'monthly',
        priority: page === '' ? 1 : 0.7,
      });
    }
  }

  for (const locale of SUPPORTED_LOCALES) {
    for (const slug of blogSlugs) {
      entries.push({
        url: `${SITE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
    for (const slug of compareSlugs) {
      entries.push({
        url: `${SITE_URL}/${locale}/compare/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  }

  return entries;
}
