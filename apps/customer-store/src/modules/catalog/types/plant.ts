export type GrowthFormKey = 'TREE' | 'SHRUB' | 'HERB' | 'CLIMBER' | 'SUCCULENT' | 'PALM'

export type ThreatCategoryKey = 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX' | 'DD'

export type Plant = {
  id: string
  plantNumber: number | null
  nameCommon: string
  scientificName: string
  family: string
  genus: string
  origin: string | null
  provenance: string | null
  collector: string | null
  registrationDate: string | null
  imageUrl: string
  priceCUP: number | null
  stock: number | null
  uses: string[]
  growthFormKey: GrowthFormKey | null
  growthFormLabel: string
  threatCategory: ThreatCategoryKey | null
  isEndemic: boolean | null
}
