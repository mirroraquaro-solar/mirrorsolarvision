/**
 * MIRROR AQUA PRODUCT CATALOGUE & SCHEMA (MASTER SYSTEM)
 */

export const PRODUCTS = [
  {
    id: 'ma-prod-001',
    sku: 'MA-PP-10-05M',
    slug: '10-inch-5-micron-pp-spun-filter',
    name: 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter (120 Grams)',
    shortDescription: 'Heavy 120-gram precision-engineered 5-micron depth pre-filter for standard 10-inch filter bowls. 100% pure virgin polypropylene.',
    description: 'The Mirror Aqua 10-Inch 5-Micron PP Spun Filter is precision-engineered using 120 grams of 100% pure thermal-bonded virgin polypropylene microfibers. Designed as the vital first stage of pre-filtration in standard 10-inch filter bowls, it effectively traps suspended physical particles including sand, silt, pipe rust, and visible debris before water reaches downstream purification stages.',
    
    // Categorization
    category: 'Mirror Aqua',
    productType: '10-Inch PP Spun Filter (120g)',
    brand: 'Mirror Aqua',
    countryOfOrigin: 'India',
    weight: '120g',
    
    // Commercial Data
    price: 199,
    mrp: 549,
    taxClass: 'gst_18',
    stock: 250,
    stockStatus: 'instock',
    whatsappEnabled: true,
    bulkEnabled: true,
    
    // Configured Commercial Pack Tiers
    packTiers: [
      {
        id: 'single',
        quantity: 1,
        label: '1 Piece (120g Standard)',
        unitPrice: 199,
        totalPrice: 199,
        mrpTotal: 549,
        savingsPercent: 64,
        badge: 'Standard'
      },
      {
        id: 'pack-10',
        quantity: 10,
        label: '10 Pieces (Value Pack - 1.2kg)',
        unitPrice: 180,
        totalPrice: 1800,
        mrpTotal: 5490,
        savingsPercent: 67,
        badge: 'Best Value • Save ₹3,690',
        isPopular: true
      }
    ],

    // Technical Specifications
    specifications: {
      filterType: '10-Inch PP Spun Filter (120 Grams)',
      micronRating: '5 Micron (µm)',
      weight: '120 Grams (Heavy Duty)',
      nominalLength: '10 Inch (approx. 254 mm)',
      outerDiameter: 'Approx. 60 - 63 mm',
      innerCoreDiameter: 'Approx. 28 - 30 mm',
      material: '100% Pure Melt-Blown Polypropylene (Virgin)',
      application: 'Pre-filtration for all compatible 10-inch filter bowls',
      recommendedOperatingTemp: '4°C to 45°C',
      maximumPressure: '125 PSI (Bowl Dependent)',
      brand: 'Mirror Aqua',
      countryOfOrigin: 'India'
    },

    // Verified Highlights
    highlights: [
      'Heavy 120-Gram High Density Polypropylene Construction',
      'True 5-Micron Multi-Layer Gradient Pre-Filtration Matrix',
      'Universal Fit for all Standard 10-Inch Filter Bowls',
      '100% Pure Virgin Polypropylene — Zero Chemical Binders',
      'Protects Downstream Purifier Stages & Pumps from Physical Debris'
    ],

    // Gallery Images
    images: [
      {
        id: 'img-1',
        url: '/images/product/008.jpeg',
        altText: 'Mirror Aqua 10-Inch 120g PP Spun Filter Cartridges',
        isPrimary: true
      },
      {
        id: 'img-2',
        url: '/images/product/004.jpeg',
        altText: '100% Virgin Polypropylene 120g Filter Media Core'
      },
      {
        id: 'img-3',
        url: '/images/product/005.jpeg',
        altText: 'Standard 10-Inch Drop-In Cartridge Dimensions'
      },
      {
        id: 'img-4',
        url: '/images/product/007.jpeg',
        altText: 'Mirror Aqua Embossed Brand Logo on 120g Polypropylene'
      },
      {
        id: 'img-5',
        url: '/images/product/002.jpeg',
        altText: 'Pre-Filter Housing Bowl Installation Example'
      }
    ],

    // Compatibility List
    compatibleSystems: [
      'Kent Grand, Prime, Pearl, Elegant (External Pre-Filter Bowl)',
      'Aquaguard / Eureka Forbes (Universal 10-Inch Outer Bowl)',
      'Livpure, Pureit, Blue Star, Havells (10-Inch Outer Housing)',
      'All Standard 10" Clear & Opaque Domestic Filter Bowls',
      'Commercial RO Systems with 10-inch Pre-Filtration Stages'
    ],

    // FAQs
    faqs: [
      {
        question: 'What is the weight of this Mirror Aqua filter?',
        answer: 'Each Mirror Aqua 10-inch filter weighs a solid 120 grams (120g), engineered with dense virgin polypropylene microfibers for maximum dirt retention and structural stability.'
      },
      {
        question: 'What is the MRP and pricing for 1 unit and 10 units?',
        answer: 'The official MRP is ₹549/-. A single 120g unit is available at ₹199/- (64% off). The 10-piece value pack (1.2 kg total weight) is ₹1,800/- (₹180 per piece, saving ₹3,690 off total MRP of ₹5,490).'
      },
      {
        question: 'How often should I replace this 120g PP spun filter?',
        answer: 'Depending on your municipal or borewell water quality, replacement is recommended every 3 to 6 months, or whenever significant physical discoloration and flow reduction are observed.'
      },
      {
        question: 'Will this filter fit my water purifier pre-filter bowl?',
        answer: 'Yes. It features standard 10-inch dimensions (approx. 254 mm length, 60-63 mm outer diameter, 28-30 mm inner core), making it a universal drop-in fit for virtually all external 10-inch domestic bowls across India.'
      },
      {
        question: 'Does it contain any chemical binders or adhesives?',
        answer: 'No. Mirror Aqua filters are manufactured with 100% pure melt-blown food-grade polypropylene microfibers bonded thermally without glues, solvents, or wetting agents.'
      }
    ]
  }
];

export function getProductBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug) || PRODUCTS[0];
}

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
}

export const CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'spun-filters', name: 'PP Spun Filters (120g)' },
  { id: 'packs', name: 'Multi-Packs' },
  { id: 'wholesale', name: 'Wholesale / B2B' }
];
