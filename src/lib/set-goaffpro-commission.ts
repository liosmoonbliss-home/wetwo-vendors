/**
 * Set GoAffPro affiliate commission rate
 * Used for both vendors and couples
 */
export async function setGoaffproCommission(
  affiliateId: string,
  percentage: number
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.goaffpro.com/v1/admin/affiliates/${affiliateId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-goaffpro-access-token': process.env.GOAFFPRO_ACCESS_TOKEN!,
        },
        body: JSON.stringify({
          commission: {
            type: 'percentage',
            amount: String(percentage),
          },
        }),
      }
    )
    console.log(`🎯 GoAffPro commission set: ${percentage}% for ${affiliateId} — Status: ${res.status}`)
    return res.status === 200
  } catch (err) {
    console.error(`⚠️ GoAffPro commission failed for ${affiliateId}:`, err)
    return false
  }
}

/** Map boost_tier to commission percentage */
export function tierToCommission(tier: string): number {
  switch (tier) {
    case 'pro': return 30
    case 'elite': return 40
    default: return 20
  }
}
