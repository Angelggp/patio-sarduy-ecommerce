import type { Plant } from '@/modules/catalog/types/plant'

export const plantsCatalog: Plant[] = [
  {
    id: 'monstera-deliciosa',
    nameCommon: 'Costilla de Adan',
    scientificName: 'Monstera deliciosa',
    imageUrl:
      'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=900&q=80',
    priceCUP: 2200,
    uses: ['Interior', 'Decorativa', 'Purificadora'],
    growthForm: 'Trepadora',
  },
  {
    id: 'lavanda-angustifolia',
    nameCommon: 'Lavanda',
    scientificName: 'Lavandula angustifolia',
    imageUrl:
      'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=900&q=80',
    priceCUP: 950,
    uses: ['Aromatica', 'Medicinal', 'Exterior'],
    growthForm: 'Arbustiva',
  },
  {
    id: 'pothos-aureum',
    nameCommon: 'Poto Dorado',
    scientificName: 'Epipremnum aureum',
    imageUrl:
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80',
    priceCUP: 1100,
    uses: ['Interior', 'Colgante', 'Purificadora'],
    growthForm: 'Colgante',
  },
  {
    id: 'aloe-vera',
    nameCommon: 'Sabila',
    scientificName: 'Aloe vera',
    imageUrl:
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=80',
    priceCUP: 780,
    uses: ['Medicinal', 'Exterior', 'Bajo Mantenimiento'],
    growthForm: 'Roseta',
  },
  {
    id: 'ficus-lyrata',
    nameCommon: 'Ficus Lira',
    scientificName: 'Ficus lyrata',
    imageUrl:
      'https://images.unsplash.com/photo-1593691509543-c55fb32e5a76?auto=format&fit=crop&w=900&q=80',
    priceCUP: 2800,
    uses: ['Interior', 'Decorativa'],
    growthForm: 'Vertical',
  },
  {
    id: 'romero-officinalis',
    nameCommon: 'Romero',
    scientificName: 'Salvia rosmarinus',
    imageUrl:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80',
    priceCUP: 640,
    uses: ['Aromatica', 'Culinaria', 'Exterior'],
    growthForm: 'Arbustiva',
  },
  {
    id: 'sansevieria-trifasciata',
    nameCommon: 'Lengua de Suegra',
    scientificName: 'Dracaena trifasciata',
    imageUrl:
      'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80',
    priceCUP: 1300,
    uses: ['Interior', 'Bajo Mantenimiento', 'Purificadora'],
    growthForm: 'Vertical',
  },
  {
    id: 'calathea-orbifolia',
    nameCommon: 'Calatea Orbifolia',
    scientificName: 'Goeppertia orbifolia',
    imageUrl:
      'https://images.unsplash.com/photo-1460533893735-45cea2212645?auto=format&fit=crop&w=900&q=80',
    priceCUP: 1900,
    uses: ['Interior', 'Decorativa'],
    growthForm: 'Roseta',
  },
]
