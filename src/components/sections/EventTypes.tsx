'use client';

import type { Vendor } from '@/lib/types';

interface Props {
  vendor: Vendor;
}

export function EventTypesSection({ vendor }: Props) {
  // Event pills now display inside the Gallery section.
  // This section is kept as a no-op so existing section_order arrays don't break.
  return null;
}
