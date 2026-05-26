export type GrowthForm = 'Arbustiva' | 'Colgante' | 'Roseta' | 'Trepadora' | 'Vertical'

export type Plant = {
  id: string
  nameCommon: string
  scientificName: string
  imageUrl: string
  priceCUP: number
  uses: string[]
  growthForm: GrowthForm
}
