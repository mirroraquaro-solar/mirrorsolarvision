# Mirror Solar Vision — Structured Data (JSON-LD) Audit & Validation Report

**Domain:** `https://mirrorsolarvision.com/`  
**Embedding Method:** `<script type="application/ld+json">` in `index.html`  
**Schema Specification:** Schema.org `@graph` syntax  
**Audit Date:** September 28, 2026  

---

## 1. Structured Data Inventory & Schema Breakdown

| URL / Scope | Schema `@type` | Existing Implementation Summary | Identified Issues & Refinements | Validation Status |
| :--- | :--- | :--- | :--- | :--- |
| `https://mirrorsolarvision.com/` | `LocalBusiness` | Name, address in Eluru AP (534001), phone, email, geo coordinates (16.7107, 81.0952), opening hours, area served (AP districts), currenciesAccepted (`INR`). | Verified exact street address matching head office opposite Vmax Cinema Hall, Eluru. Clean contact endpoints. | **VALID & ACTIVE** |
| `https://mirrorsolarvision.com/#product-drain-clips` | `Product` | Name: "MSV Heavy-Duty Solar Drain Clips", Brand: "Mirror Solar Vision", Offer: ₹300 starting price, InStock, Currency: `INR`. | Clean offer schema referencing actual live product catalog starting variant (3 kW / 12 clips @ ₹300). | **VALID & ACTIVE** |
| `https://mirrorsolarvision.com/#product-bulk-combo` | `Product` | Name: "₹15,000 Bulk Solar Installation Combo", Brand: "Mirror Solar Vision", Offer: ₹15,000 flat price, InStock, Currency: `INR`. | Accurately models the exact 100 MC4 + 100 anchor + 200 bolt + 200 clip + 11 sprinkler kit. | **VALID & ACTIVE** |
| `https://mirrorsolarvision.com/#faq` | `FAQPage` | 4 main questions covering PM Surya Ghar subsidy (₹78,000), MSV capillary drain clip engineering, ₹15,000 bulk combo contents, and DISCOM net metering approvals. | Conforms to Google's FAQPage structured data documentation. All questions and answers match visible page text verbatim. | **VALID & ACTIVE** |
| `https://mirrorsolarvision.com/#breadcrumbs` | `BreadcrumbList` | 3 items: Home (`/`), Solar Store & Hardware (`/#store`), My Orders & Live Tracking (`/#orders`). | Follows standard Schema.org BreadcrumbList specification. | **VALID & ACTIVE** |

---

## 2. Integrity & Quality Compliance Checklist

- [x] **No Fake Reviews or Ratings:** Zero fictitious `aggregateRating` or fake review markups. Only factual product details and verified pricing.
- [x] **Price Currency Uniformity:** All prices declared in `INR` (`₹`) matching live e-commerce checkout values.
- [x] **Verbatim Content Match:** Schema FAQ answers match visible on-page content with 100% fidelity.
- [x] **Valid JSON Syntax:** No trailing commas or unescaped characters. Tested with standard JSON parsers.
- [x] **Google Rich Results Compatible:** Eligible for Local Business knowledge panels, FAQ rich cards, and product snippets.
