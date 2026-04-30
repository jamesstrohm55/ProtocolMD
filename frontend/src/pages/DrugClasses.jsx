import { Link } from 'react-router-dom'

const DRUG_CLASSES = [
  {
    category: 'Chemotherapy',
    classes: [
      { name: 'Alkylating Agents', examples: ['Cyclophosphamide', 'Ifosfamide', 'Carboplatin', 'Cisplatin', 'Oxaliplatin'] },
      { name: 'Antimetabolites', examples: ['Fluorouracil', 'Capecitabine', 'Gemcitabine', 'Methotrexate', 'Pemetrexed'] },
      { name: 'Anthracyclines', examples: ['Doxorubicin', 'Epirubicin', 'Liposomal Doxorubicin'] },
      { name: 'Taxanes', examples: ['Paclitaxel', 'Docetaxel', 'Nab-paclitaxel'] },
      { name: 'Vinca Alkaloids', examples: ['Vincristine', 'Vinorelbine', 'Vinblastine'] },
      { name: 'Topoisomerase Inhibitors', examples: ['Irinotecan', 'Etoposide', 'Topotecan'] }
    ]
  },
  {
    category: 'Immunotherapy',
    classes: [
      { name: 'PD-1 Inhibitors', examples: ['Pembrolizumab', 'Nivolumab', 'Cemiplimab'] },
      { name: 'PD-L1 Inhibitors', examples: ['Atezolizumab', 'Durvalumab', 'Avelumab'] },
      { name: 'CTLA-4 Inhibitors', examples: ['Ipilimumab', 'Tremelimumab'] }
    ]
  },
  {
    category: 'Targeted Therapy',
    classes: [
      { name: 'EGFR TKIs', examples: ['Erlotinib', 'Gefitinib', 'Osimertinib', 'Afatinib'] },
      { name: 'ALK TKIs', examples: ['Crizotinib', 'Alectinib', 'Lorlatinib'] },
      { name: 'HER2-targeted', examples: ['Trastuzumab', 'Pertuzumab', 'Lapatinib'] },
      { name: 'VEGF/VEGFR Inhibitors', examples: ['Bevacizumab', 'Sunitinib', 'Sorafenib', 'Axitinib'] },
      { name: 'CDK4/6 Inhibitors', examples: ['Palbociclib', 'Ribociclib', 'Abemaciclib'] },
      { name: 'PARP Inhibitors', examples: ['Olaparib', 'Niraparib', 'Rucaparib'] },
      { name: 'Anti-CD20', examples: ['Rituximab', 'Obinutuzumab', 'Ofatumumab'] }
    ]
  }
]

export default function DrugClasses() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Drug Classes</h1>
      <div className="space-y-8">
        {DRUG_CLASSES.map(cat => (
          <section key={cat.category}>
            <h2 className="text-xl font-semibold mb-3 text-clinical-900">{cat.category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.classes.map(cls => (
                <div key={cls.name} className="border rounded-lg p-4 bg-white">
                  <h3 className="font-medium text-gray-900 mb-2">{cls.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {cls.examples.map(drug => (
                      <Link
                        key={drug}
                        to={`/drugs/${drug.toLowerCase()}`}
                        className="text-xs bg-gray-100 hover:bg-clinical-50 text-gray-700 px-2 py-0.5 rounded transition-colors"
                      >
                        {drug}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
