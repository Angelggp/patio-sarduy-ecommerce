import { SectionTitlePage } from '@/modules/admin/components/SectionTitlePage'
import { INVENTORY_SECTION_TITLE } from '@/modules/inventory/utils/inventory.constants'

export function InventoryTitle() {
  return <SectionTitlePage title={INVENTORY_SECTION_TITLE} />
}
