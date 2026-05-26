export const INVENTORY_SECTION_TITLE = 'Inventario'

export const DEFAULT_INVENTORY_PAGE_SIZE = 12

export const growthFormLabelMap: Record<string, string> = {
	TREE: 'Arbol',
	SHRUB: 'Arbusto',
	HERB: 'Hierba',
	CLIMBER: 'Trepadora',
	SUCCULENT: 'Suculenta',
	PALM: 'Palma',
}

export const threatCategoryLabelMap: Record<string, string> = {
	LC: 'Preocupacion menor (LC)',
	NT: 'Casi amenazada (NT)',
	VU: 'Vulnerable (VU)',
	EN: 'En peligro (EN)',
	CR: 'Critico (CR)',
	EW: 'Extinta en estado silvestre (EW)',
	EX: 'Extinta (EX)',
	DD: 'Datos insuficientes (DD)',
}

export const booleanFilterOptions = [
	{ label: 'Todos', value: 'all' },
	{ label: 'Si', value: 'true' },
	{ label: 'No', value: 'false' },
] as const

export const fallbackPlantImage =
	'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=1200&q=80'
