// Mirror Solar Vision — Confirmed Bulk Combo Specification
// Strict Commercial Rule: Fixed ₹15,000 Bulk Combo. No discounts or savings claims.

export const CONFIRMED_BULK_COMBO = {
  id: 'bulk-combo-15000',
  name: 'Bulk Solar Installation Combo',
  shortTitle: 'Bulk Solar Installation Combo',
  badge: 'BULK OFFER',
  tag: 'Open to Everyone',
  headline: 'Bulk Solar Installation Combo',
  subheadline: 'Essential solar installation materials bundled together in one ready-to-order bulk package.',
  price: 15000,
  priceFormatted: '₹15,000',
  unit: 'per complete combo',
  availability: 'Ready for Immediate Dispatch',
  stockStatus: 'In Stock • Ready to Ship',
  materialsIncluded: [
    {
      id: 'mc4',
      name: 'MC4 Connectors',
      quantity: 100,
      unit: 'Pairs',
      countLabel: '100 Pairs',
      displayQty: '100 MC4 Pairs',
      description: 'High-durability IP68 waterproof 1000V/1500V DC rated MC4 solar connectors with copper terminals for secure module interconnections.',
      icon: 'zap',
      image: '/assets/images/products/mc4.jpg'
    },
    {
      id: 'anchor-bolts',
      name: 'Anchor Bolts',
      quantity: 100,
      unit: 'Pieces',
      countLabel: '100 Pcs',
      displayQty: '100 Anchor Bolts',
      description: 'Heavy-duty stainless steel concrete foundation expansion anchor fasteners with washers and hex nuts for solar frame structures.',
      icon: 'shield',
      image: '/assets/images/products/anchor_bolts.jpg'
    },
    {
      id: 'structure-bolts',
      name: 'Structure Nuts & Bolts',
      quantity: 200,
      unit: 'Pieces',
      countLabel: '200 Pcs',
      displayQty: '200 Structure Nuts & Bolts',
      description: 'Corrosion-resistant SS304 structural hex bolts with flange nuts and spring washers for module mounting rails.',
      icon: 'settings',
      image: '/assets/images/products/structure_bolts.jpg'
    },
    {
      id: 'panel-bolts',
      name: 'Panel Nuts & Bolts',
      quantity: 200,
      unit: 'Pieces',
      countLabel: '200 Pcs',
      displayQty: '200 Panel Nuts & Bolts',
      description: 'Precision engineered solar panel clamp socket allen bolts with spring washers and slide channel nuts for end/mid clamps.',
      icon: 'check-circle',
      image: '/assets/images/products/panel_bolts.jpg'
    },
    {
      id: 'drain-clips',
      name: 'Drain Clips',
      quantity: 200,
      unit: 'Pieces',
      countLabel: '200 Pcs',
      displayQty: '200 Drain Clips',
      description: 'UV-stabilized anti-soiling sludge and water drain clips for panel bottom frames to prevent sludge accumulation.',
      icon: 'droplets',
      image: '/assets/images/001.png'
    },
    {
      id: 'sprinkler-sets',
      name: 'Sprinkler Sets',
      quantity: 11,
      unit: 'Sets',
      countLabel: '11 Sets',
      displayQty: '11 Sprinkler Sets',
      description: 'High-precision 360° solar panel automated cleaning micro-sprinkler nozzles with mounting brackets and tubing connectors.',
      icon: 'sparkles',
      image: '/assets/images/products/sprinklers.jpg'
    }
  ],
  highlights: [
    'Complete hardware & accessory kit for solar rooftop installers',
    'Standardized quantities calibrated for commercial & residential installations',
    'High-grade UV & weather resistant materials tested for AP climate',
    'Fast delivery across all 26 districts of Andhra Pradesh'
  ]
};

export const INDIVIDUAL_PRODUCTS = [
  {
    id: 'msv-drain-clips',
    name: 'MSV Heavy-Duty Drain Clips',
    category: 'Maintenance Accessories',
    tag: 'Bestseller',
    shortDesc: 'UV-stabilized anti-soiling sludge & water drain clips for solar panel frame edges. 4 clips per kW (₹25/clip).',
    fullDesc: 'Engineered specifically for Indian climatic conditions, MSV Heavy-Duty Drain Clips eliminate water pooling and mud band formation along the bottom edge of PV panels, preventing hot-spot damage and restoring up to 10–15% lost generation. Sized per kW (4 clips per kW @ ₹25/clip).',
    rating: 5.0,
    reviewsCount: 2840,
    purchasesCount: '10,000+',
    stockStatus: 'In Stock • Ready to Ship',
    pricePerClip: 25,
    clipsPerKw: 4,
    sizes: ['30mm', '33mm', '35mm', '40mm'],
    images: [
      '/assets/images/001.png',
      '/assets/images/products/drain-clip-35mm-1.webp',
      '/assets/images/products/clip-green-1.jpg'
    ],
    variants: [
      { id: '3kw', kw: 3, label: '3 kW (12 Clips)', price: 300, clipsCount: 12, unit: '12 Clips (3 kW)' },
      { id: '4kw', kw: 4, label: '4 kW (16 Clips)', price: 400, clipsCount: 16, unit: '16 Clips (4 kW)' },
      { id: '5kw', kw: 5, label: '5 kW (20 Clips)', price: 500, clipsCount: 20, unit: '20 Clips (5 kW)' },
      { id: '10kw', kw: 10, label: '10 kW (40 Clips)', price: 1000, clipsCount: 40, unit: '40 Clips (10 kW)' }
    ],
    defaultVariantIdx: 0,
    specs: [
      { label: 'Frame Sizes', val: '30mm, 33mm, 35mm, 40mm' },
      { label: 'Calculation', val: '4 Clips per 1 kW (₹25 / clip)' },
      { label: 'Standard Options', val: '3 kW, 4 kW, 5 kW, 10 kW & Custom Manual Entry' },
      { label: 'Material', val: 'UV-Stabilized High-Density Polymer' },
      { label: 'Durability', val: '10+ Years Outdoor Weather Resistance' }
    ]
  },
  {
    id: 'sample-test-clip-10',
    name: 'Sample Solar Drain Clip (Live Test Product)',
    category: 'Sample Testing',
    tag: 'Live Test ₹10',
    shortDesc: '1 Sample Solar Drain Clip for testing live payment, Shiprocket order booking, and live tracking.',
    fullDesc: 'Use this sample product to test complete live end-to-end checkout: Razorpay live payment verification, automatic order creation on your Shiprocket dashboard, and real-time live package tracking updates.',
    rating: 5.0,
    reviewsCount: 120,
    purchasesCount: '10,000+',
    stockStatus: 'In Stock • Ready to Test',
    price: 10,
    pricePerClip: 10,
    clipsPerKw: 1,
    sizes: ['35mm'],
    images: [
      '/assets/images/001.png',
      '/assets/images/products/drain-clip-35mm-1.webp'
    ],
    variants: [
      { id: 'sample-1', kw: 1, label: '1 Sample Piece', price: 10, clipsCount: 1, unit: '1 Sample Clip' }
    ],
    defaultVariantIdx: 0,
    specs: [
      { label: 'Test Item', val: '1 Unit MSV Solar Drain Clip' },
      { label: 'Test Price', val: '₹10 (Instant live payment & tracking test)' },
      { label: 'Shiprocket Integration', val: 'Generates live order & tracking on Shiprocket' }
    ]
  }
];

export const CUSTOMER_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Suresh Varma',
    location: 'Eluru, Andhra Pradesh',
    rating: 5,
    date: '3 days ago',
    verified: true,
    title: 'Huge improvement in solar generation!',
    comment: 'Installed on our 5kW rooftop solar in Eluru. Water and dust sludge was always accumulating at the bottom edge. After clipping these, every rain washes the panel crystal clear. Generation increased noticeably!',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'rev-2',
    name: 'N. Venkateswara Rao',
    location: 'Vijayawada, AP',
    rating: 5,
    date: '1 week ago',
    verified: true,
    title: 'Top quality material & fast Shiprocket delivery',
    comment: 'Ordered 40 clips for our commercial solar setup. Genuine UV-resistant polymer and snaps firmly on 35mm frame. Order arrived in 2 days with real-time Shiprocket WhatsApp tracking.',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'rev-3',
    name: 'Ravi Teja Patnaik',
    location: 'Visakhapatnam, AP',
    rating: 5,
    date: '2 weeks ago',
    verified: true,
    title: 'Best solar accessory for coastal AP climate',
    comment: 'In Vizag moisture and salt dust cause heavy sludge pooling. These drain clips fixed the issue permanently. Excellent support from Durgarao garu and team.',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'rev-4',
    name: 'K. Srinivas',
    location: 'Guntur, AP',
    rating: 5,
    date: '3 weeks ago',
    verified: true,
    title: '100% recommended for every solar plant',
    comment: 'Very easy to snap on. Paid online via UPI, got WhatsApp bill immediately and tracking link on phone. 5/5 stars for product and service!',
    avatarColor: 'bg-purple-600'
  },
  {
    id: 'rev-5',
    name: 'M. Prasad Raju',
    location: 'Rajahmundry, AP',
    rating: 5,
    date: '1 month ago',
    verified: true,
    title: 'Premium build & solid clips',
    comment: 'Clips are tough and withstand strong winds and heat. Prevents hot-spot degradation on solar cells. Over 10,000+ sold for a reason!',
    avatarColor: 'bg-indigo-600'
  }
];

export const BUSINESS_CONTACT = {
  phone: '+91 86391 03947',
  phoneRaw: '918639103947',
  email: 'mirrorsolarvision@gmail.com',
  name: 'DURGARAO PERURI',
  company: 'Mirror Solar Vision (Mirror Group / Mirror Aqua)',
  address: 'MIRROR SOLAR VISION, OPPOSITE VMAX CINEMA HALL, NEAR BUDDHA PARK, ELURU, 534001',
  state: 'Andhra Pradesh, India'
};
