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
  },
  {
    id: 'ma-prod-002',
    sku: 'MA-PP-5PK-WR',
    slug: '5-spun-filter-pack-with-free-wrench',
    name: 'Mirror Aqua 5 Micron 120g Spun Filter – Pack of 5 + Free Filter Spanner',
    shortDescription: 'Get 5 Mirror Aqua 10-Inch 5-Micron 120g PP Spun Filters + 1 FREE Filter Spanner.',
    description: 'Get 5 Mirror Aqua 10-Inch 5-Micron 120g PP Spun Filters + 1 FREE Filter Spanner. High-density 120g pure polypropylene depth filtration helps reduce dirt, sand, rust, and suspended particles before water reaches internal purification stages. Compatible with standard 10-inch filter housings for all domestic RO water purifiers and pre-filtration systems. Made in India.',
    
    // Categorization
    category: 'Mirror Aqua',
    productType: 'Pack of 5 (120g) + 1 Free Spanner',
    brand: 'Mirror Aqua',
    countryOfOrigin: 'Made in India',
    weight: '120g per filter (600g Total Media + Spanner)',
    
    // Commercial Data
    price: 995,
    mrp: 2899,
    taxClass: 'gst_18',
    stock: 180,
    stockStatus: 'instock',
    whatsappEnabled: true,
    bulkEnabled: true,
    offer: 'Buy 5 Spun Filters + Get 1 Filter Spanner FREE',
    freeItem: '1 FREE Filter Spanner / Wrench',
    
    // Configured Commercial Pack Tiers
    packTiers: [
      {
        id: 'combo-1',
        quantity: 1,
        label: 'Pack of 5 + 1 Free Filter Spanner',
        unitPrice: 995,
        totalPrice: 995,
        mrpTotal: 2899,
        savingsPercent: 66,
        badge: 'Special Offer • 1 Spanner Free',
        isPopular: true
      },
      {
        id: 'combo-2',
        quantity: 2,
        label: 'Pack of 10 + 2 Free Filter Spanners',
        unitPrice: 945,
        totalPrice: 1890,
        mrpTotal: 5798,
        savingsPercent: 67,
        badge: 'Double Saver • Save ₹3,908'
      }
    ],

    // Technical Specifications
    specifications: {
      brand: 'Mirror Aqua',
      filterSize: '10 Inch',
      micronRating: '5 Micron',
      weight: '120g per filter',
      material: '100% PP Material (Virgin Polypropylene)',
      offer: 'Buy 5 Spun Filters + Get 1 Filter Spanner FREE',
      freeGift: '1 FREE Filter Spanner / Wrench',
      filtrationReduction: 'Helps reduce dirt, sand, rust and suspended particles',
      suitability: 'RO water purifiers and pre-filtration systems',
      compatibility: 'Compatible with standard 10-inch filter housings',
      nominalLength: '10 Inch (approx. 254 mm)',
      outerDiameter: 'Approx. 60 – 63 mm',
      innerCoreDiameter: 'Approx. 28 – 30 mm',
      operatingTemp: '4°C to 45°C',
      maxPressure: '125 PSI (Bowl Dependent)',
      countryOfOrigin: 'Made in India'
    },

    // Verified Highlights / Key Features
    highlights: [
      'Pack of 5 Spun Filters',
      '1 FREE Filter Spanner / Wrench',
      '120g PP Spun Filter (Heavy-Duty Media)',
      '10-inch standard size',
      '5-micron filtration',
      '100% PP material (Pure Virgin Polypropylene)',
      'Helps reduce dirt, sand, rust and suspended particles',
      'Suitable for RO water purifiers and pre-filtration systems',
      'Compatible with standard 10-inch filter housings',
      'Made in India'
    ],

    // Gallery Images
    images: [
      {
        id: 'img-combo-1',
        url: '/images/product/5-spun-with-wrench-combo.jpg',
        altText: 'Mirror Aqua 5 Micron 120g Spun Filter – Pack of 5 + Free Filter Spanner Combo Offer (5 ఫిల్టర్లు + 1 స్పానర్)',
        isPrimary: true
      },
      {
        id: 'img-combo-2',
        url: '/images/product/008.jpeg',
        altText: 'Mirror Aqua 120g PP Spun 5-Micron Cartridges'
      },
      {
        id: 'img-combo-3',
        url: '/images/product/007.jpeg',
        altText: 'Mirror Aqua Embossed Brand Logo on 120g Polypropylene'
      },
      {
        id: 'img-combo-4',
        url: '/images/product/0010.jpeg',
        altText: '100% Pure Virgin Polypropylene Sealed Pack'
      },
      {
        id: 'img-combo-5',
        url: '/images/product/004.jpeg',
        altText: 'Virgin Polypropylene Microfiber Depth Matrix'
      }
    ],

    // Compatibility List
    compatibleSystems: [
      'Standard 10-Inch Domestic Filter Housings across India',
      'Kent Grand, Prime, Pearl, Elegant (External Pre-Filter Bowls)',
      'Aquaguard / Eureka Forbes (Universal 10-Inch Outer Housings)',
      'Livpure, Pureit, Blue Star, Havells, AO Smith (10-Inch Outer Housings)',
      'RO Water Purifiers & Multi-Stage Pre-Filtration Systems'
    ],

    // FAQs
    faqs: [
      {
        question: 'What is included in this offer?',
        answer: 'You get 5 pieces of Mirror Aqua 10-Inch 5-Micron 120g PP Spun Filters PLUS 1 FREE Filter Spanner / Wrench for easy housing bowl removal and tightening.'
      },
      {
        question: 'What is the weight and micron rating of each filter?',
        answer: 'Each filter in this pack weighs a genuine 120g and provides true 5-micron pre-filtration using 100% pure PP material.'
      },
      {
        question: 'What impurities does this filter help reduce?',
        answer: 'It helps reduce physical suspended impurities including dirt, sand, rust, silt, and algae, safeguarding downstream RO membranes and booster pumps.'
      },
      {
        question: 'Will these filters and the spanner fit my water purifier?',
        answer: 'Yes. The 10-inch standard size fits standard 10-inch filter housings across all major brands (Kent, Aquaguard, Pureit, Livpure, etc.), and the included spanner is universally designed for 10-inch bowls.'
      },
      {
        question: 'Where is this product manufactured?',
        answer: 'Mirror Aqua 120g Spun Filters and accessories are 100% Made in India under strict quality inspection.'
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
  { id: 'combos', name: 'Value Combos & Offers' },
  { id: 'wholesale', name: 'Wholesale / B2B' }
];

