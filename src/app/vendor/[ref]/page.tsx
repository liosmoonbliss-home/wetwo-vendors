import { notFound } from 'next/navigation';
import { getVendorByRef } from '@/lib/vendors';
import { resolveTheme, themeToCSSVariables } from '@/lib/themes';
import { getDefaultSections } from '@/lib/sections';
import { getVendorLinks } from '@/lib/links';
import { VendorPage } from '@/components/VendorPage';
import type { SectionId } from '@/lib/types';
interface Props { params: { ref: string } }
export default async function VendorRoute({ params }: Props) {
  const vendor = await getVendorByRef(params.ref);
  if (!vendor) notFound();
  const theme = resolveTheme(vendor.theme_preset || 'light-elegant', vendor.brand_color, vendor.brand_color_secondary);
  const cssVars = themeToCSSVariables(theme);
  const activeSections: SectionId[] = vendor.active_sections && vendor.active_sections.length > 0 ? vendor.active_sections : getDefaultSections(vendor.category);
  const sectionOrder: SectionId[] = vendor.section_order && vendor.section_order.length > 0 ? vendor.section_order : activeSections;
  const links = getVendorLinks(vendor);
  return (<><style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} /><VendorPage vendor={vendor} theme={theme} activeSections={activeSections} sectionOrder={sectionOrder} links={links} /></>);
}
export async function generateMetadata({ params }: Props) {
  const vendor = await getVendorByRef(params.ref);
  if (!vendor) return { title: 'Not Found' };
  const loc = [vendor.city, vendor.state].filter(Boolean).join(', ');
  return { title: `${vendor.business_name} | ${vendor.category || 'Wedding Vendor'} | ${loc}`, description: vendor.bio || `${vendor.business_name} in ${loc}` };
}
