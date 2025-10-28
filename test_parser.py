from parser import parse_snapshot


SAMPLE = """## COMPANY SNAPSHOT — IMAGE SKINCARE
- Website: https://imageskincare.com
- Revenue (est.): Unknown
- Employees (est.): 200–500
- Label Holder?: Unknown — evidence: Sunscreen labels list Swiss-American CDMO; YANA supplement label lists “Image International”; cosmetics labels not shown.
- Sales Channels: D2C / Amazon / Other
- Retailers: Sephora N; Ulta N; Target N; Walmart N; Other: Amazon official store; Dermstore; SalonCentric; pro spas
- Regulatory/Quality Function: Yes — evidence: Sr. Director of Quality, Regulatory & Claims
- Current Hiring (Reg/Quality): None visible
- Product Categories: skincare, suncare (SPF), body care; ingestible collagen (YANA)
- Estimated Sku Count: Unknown
- High-Risk Signals: SPF? Y • Drug-like claims? Unknown • Actives (retinol/acids)? Y
- Recent News (≤6mo):
  • 2025-10-14 — Partnered with UK spa group Champneys (https://instagram.com/…)
  • 2025-07-28 — NY Post feature for SPF moisturizer (https://nypost.com/…)
- Digital Footprint: IG ~300k; TikTok Unknown
- Primary Contact: Kristin Peacock — Sr. Director of Quality, Regulatory & Claims (7.6 yrs) — https://www.linkedin.com/in/kristin-peacock-mba-475703b
- Fit Summary:
  ✅ Reg/Claims lead; portfolio includes SPF + actives; Amazon + pro distribution → steady AE inflow + MoCRA obligations
  ⚠️ Label-holder status unclear; no active Reg/Quality hiring
- Fit Score: High

Sources:
• https://imageskincare.com
• https://www.linkedin.com/in/kristin-peacock-mba-475703b
• https://dailymed.nlm.nih.gov/…
• https://amazon.com/…
• https://dermstore.com/…

## CONTACT SNAPSHOT — Kristin Peacock, Sr. Director of Quality, Regulatory & Claims, IMAGE Skincare
- Location / Timezone: Boca Raton, FL • ET
- Function / Seniority: Regulatory/Quality • Director+
- Tenure: ~7 yrs @ company; ~15 yrs industry (est)
- Role Scope / Decision Power: Leads Quality/Reg/Claims; labeling/claims workflows; Budget Owner/Influencer
- Hiring Signals: None/Unknown
- Regulatory Relevance: Label compliance across US/EU/CA; MoCRA-adjacent
- Recent Activity (≤90d):
  • None confirmed
- Likely Cross-Functions: Ops, Supply Chain, Creative/Brand, Legal
- Messaging Levers: Compliance risk • Speed & effort
- Likely Objections: “We already have workflows/tools”
- Preferred Channel (inferred): LinkedIn DM
- Suggested Hook: We automate MoCRA AE intake & reporting while preserving claims/artwork workflows; worth a 15-min compare?

Sources:
• https://theorg.com/org/image-skincare/org-chart/kristin-peacock
• https://www.artworkflowhq.com/webinars/…
"""


def test_parse_expected_fields():
    data = parse_snapshot(SAMPLE)
    assert data["company"] == "IMAGE SKINCARE"
    assert data["website"] == "https://imageskincare.com"
    assert data["sales_channels"] == ["D2C", "Amazon", "Other"]
    assert data["product_categories"] == [
        "skincare",
        "suncare (SPF)",
        "body care",
        "ingestible collagen (YANA)",
    ]
    assert data["hr_spf"] == "Y"
    assert data["hr_druglike"] == "Unknown"
    assert data["hr_actives"] == "Y"
    assert data["person_full_name"] == "Kristin Peacock"
    assert data["title"].startswith("Sr. Director of Quality")
    assert data["linkedin_url"].startswith("https://www.linkedin.com")
    assert data["tenure_company"] == "7"
    assert data["years_in_industry"] == "15"
    assert data["news1"].startswith("2025-10-14")
    assert data["news2"].startswith("2025-07-28")
    assert "imageskincare.com" in data["sources"]
    assert data["decision_hiring"] == "Unknown"


def test_missing_snapshot_returns_empty():
    assert parse_snapshot("") == {}
