import { SectionTitlePage } from '@/modules/admin/components/SectionTitlePage'
import { ORDERS_SECTION_TITLE } from '@/modules/orders/utils/orders.constants'

export function OrdersTitle() {
  return <SectionTitlePage title={ORDERS_SECTION_TITLE} />
}
