import { SectionTitlePage } from '@/modules/admin/components/SectionTitlePage'
import { PAYMENTS_SECTION_TITLE } from '@/modules/payments/utils/payments.constants'

export function PaymentsTitle() {
  return <SectionTitlePage title={PAYMENTS_SECTION_TITLE} />
}
