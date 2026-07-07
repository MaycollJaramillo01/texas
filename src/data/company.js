export const SITE_URL = "https://texashighrefinished.com";
// Standalone estimator app (Next.js) — hosts the GHL-connected wizard and booking.
export const ESTIMATOR_URL = import.meta.env.VITE_ESTIMATOR_API_URL || "https://thr-estimator.vercel.app";

export function assetUrl(path) {
  return encodeURI(`${SITE_URL}/${path}`);
}

export const company = {
  brand: {
    legalName: "Texas High Refinished",
    displayName: "Texas High Refinished",
    initials: "T-H-R",
    tagline: "Where every finish reflects excellence",
    representative: "Esdras Paz",
    category: "Painting",
    primaryCategory: "Painting Studio",
    secondaryCategory: "Refinishing Shop",
    openedAt: "February 2, 2019",
    licensedBondedInsured: true,
    priceRange: "$$",
    foundingYear: 2019,
  },
  contact: {
    phone: "(830) 596-3323",
    phoneRaw: "+18305963323",
    sms: "sms:+18305963323",
    whatsapp: "https://wa.me/18305963323?text=Hi%20Texas%20High%20Refinished%2C%20I%27d%20like%20to%20request%20a%20free%20estimate.",
    email: "Pvpropainting@gmail.com",
    facebook: "https://www.facebook.com/PV-painting-105503941430961",
  },
  location: {
    shortAddress: "314 North Ridge Rd, Marble Falls, TX 78654",
    fullAddress: "314 N Ridge Rd, C, Box #8, Marble Falls, TX 78654",
    street: "314 N Ridge Rd, C, Box #8",
    city: "Marble Falls",
    state: "TX",
    stateName: "Texas",
    postalCode: "78654",
    country: "US",
    countryName: "United States",
    region: "Texas Hill Country",
    latitude: 30.5783,
    longitude: -98.2728,
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=314%20N%20Ridge%20Rd%20C%20Box%208%20Marble%20Falls%20TX%2078654",
    mapEmbedUrl:
      "https://www.google.com/maps?q=314+N+Ridge+Rd+Marble+Falls+TX+78654&output=embed",
  },
  description:
    "Texas High Refinished is a professional finishing paint shop serving the Texas Hill Country and Highland Lakes areas. Fully licensed, bonded, and insured, we specialize in high-end painted finishes for furniture, kitchen cabinetry, and interior architectural surfaces — working from a dedicated shop environment designed for precision and quality control.",
  specialty:
    "Our work focuses on fine cabinet refinishing, custom furniture finishes, lacquer and specialty coatings, Venetian plaster, decorative wall finishes, and detailed surface preparation. By combining controlled shop processes with premium materials and skilled craftsmanship, we deliver clean, durable, and elegant results for clients seeking refined, upscale finishes.",
  story: {
    title: "Our Story – Texas High Refinished (THR)",
    paragraphs: [
      "Our story began with a passion for transforming spaces. Under the name PV Pro Painting, we dedicated ourselves to painting homes with care, craftsmanship, and attention to detail. However, it didn’t take long for us to realize that our clients were looking for something more—fine finishes, beautifully refinished cabinetry, and custom details that would truly elevate their homes.",
      "That realization led to the birth of Texas High Refinished (THR).",
      "In the beginning, we worked from a small shop and a spray booth that we built with our own hands. Through hard work, determination, and countless hours of refining our craft, we continuously improved our techniques and raised our standards of quality.",
      "Today, every cabinet we refinish represents more than just a completed project. It reflects a story of dedication, precision, and trust. We take pride in delivering exceptional craftsmanship while creating finishes that enhance the beauty and character of every home we touch.",
      "At Texas High Refinished, we believe that every project deserves attention to detail and a commitment to excellence. Our mission is simple: to transform ordinary spaces into extraordinary places and create homes with soul.",
      "We are Texas High Refinished, and in every project, we strive to create homes with heart, character, and lasting beauty.",
    ],
  },
  shop: {
    name: "The Shop",
    headline: "An in-house workshop built for extreme quality.",
    intro:
      "Our dedicated shop in Marble Falls is the heart of Texas High Refinished. A climate-controlled, dust-managed environment lets us deliver finishes that cannot be replicated on-site — every cabinet door, every furniture piece, every panel passes through a controlled refinishing process.",
    highlights: [
      {
        title: "Climate-controlled environment",
        copy: "Temperature and humidity are monitored to keep coatings curing under ideal conditions — no field variables, no surprises.",
      },
      {
        title: "Dedicated spray bay",
        copy: "A purpose-built spray booth with proper ventilation ensures even, dust-free coats on lacquer, conversion varnish, and specialty finishes.",
      },
      {
        title: "Multi-step quality control",
        copy: "Sanding, sealing, color matching, and final coating are inspected at every stage. Pieces ship only when they meet our standard.",
      },
      {
        title: "Premium materials",
        copy: "We use professional-grade coatings and stains — not what is available at the hardware store. Durability and finish are non-negotiable.",
      },
    ],
    closing:
      "When clients drop off kitchen cabinetry, custom furniture, or architectural millwork, they trust that the work happens in a space built for it. The Shop is what makes a refined, upscale finish possible.",
  },
  priorityServices: [
    {
      slug: "kitchen-remodeling",
      title: "Kitchen Remodeling",
      tag: "Service 01",
      image: "Photos/2026-02-01 (14).jpg",
      summary:
        "Full kitchen transformations — cabinetry updates, surface refinishing, and finish detail work that delivers cleaner, more elegant, more functional kitchens.",
      detail: "Kitchen remodeling",
      featured: true,
      points: [
        "Cabinet door refacing and refinishing",
        "Premium painted and lacquered finishes",
        "Hardware updates and detail work",
        "Coordinated color and finish planning",
      ],
    },
    {
      slug: "high-end-finished-kitchens",
      title: "High-End Finished Kitchens",
      tag: "Service 02",
      image: "Photos/2026-02-01 (16).jpg",
      summary:
        "Premium kitchen finishes with meticulous preparation, fine paint application, and quality control across every surface and edge.",
      detail: "Fine cabinet & kitchen finishes",
      featured: true,
      points: [
        "Conversion varnish and lacquer finishes",
        "In-shop spray application for flawless coats",
        "Color matching to your specification",
        "Durable, washable, furniture-grade results",
      ],
    },
    {
      slug: "interior-exterior-painting",
      title: "Interior & Exterior Painting",
      tag: "Service 03",
      image: "hero/1.jpeg",
      summary:
        "Professional application across interiors, facades, trim, and architectural surfaces — clean lines, even coverage, lasting protection.",
      detail: "Interior and exterior painting",
      featured: true,
      points: [
        "Whole-home interior repaints",
        "Exterior preparation, priming, and finish",
        "Trim, molding, doors and accent work",
        "Pressure washing and surface prep included",
      ],
    },
    {
      slug: "drywall-repair-installation",
      title: "Drywall Repair & Installation",
      tag: "Service 04",
      image: "Photos/stock-drywall-installation-pexels.jpg",
      summary:
        "Installation, repair, preparation, and finishing of drywall — surfaces delivered ready for primer and paint.",
      detail: "Drywall repair and installation",
      featured: true,
      points: [
        "New drywall hang and installation",
        "Patch and water-damage repair",
        "Tape, mud, sand to a smooth finish",
        "Texture matching and skim-coat work",
      ],
    },
  ],
  pillars: [
    {
      num: "I",
      title: "Precision",
      copy: "A controlled shop process means consistent, repeatable results — not field-improvised fixes.",
    },
    {
      num: "II",
      title: "Premium",
      copy: "Professional-grade coatings, stains, and lacquers chosen for durability and finish quality.",
    },
    {
      num: "III",
      title: "Craft",
      copy: "Hand-prepared, hand-finished detail by a small team that signs its name to every project.",
    },
    {
      num: "IV",
      title: "Trust",
      copy: "Licensed, bonded, and insured. Clear estimates, clean job sites, on-time delivery.",
    },
  ],
  capabilities: [
    "Fine cabinet refinishing",
    "Custom furniture finishes",
    "Lacquer and specialty coatings",
    "Venetian plaster",
    "Decorative wall finishes",
    "Detailed surface preparation",
    "On-site services available",
    "Online estimates",
  ],
  serviceAreas: [
    "Jonestown, TX",
    "Oatmeal, TX 78605",
    "Llano, TX 78643",
    "Buchanan Dam, TX",
    "Burnet, TX 78611",
    "Smithwick, TX 78654",
    "Spicewood, TX 78669",
    "Horseshoe Bay, TX",
    "Lampasas, TX 76550",
    "Kingsland, TX 78639",
    "Meadowlakes, TX 78654",
    "Johnson City, TX 78636",
    "Liberty Hill, TX 78642",
    "Marble Falls, TX 78654",
    "Granite Shoals, TX 78654",
    "Highland Haven, TX 78654",
    "Round Mountain, TX 78663",
    "Cottonwood Shores, TX 78657",
    "Sunrise Beach Village, TX 78643",
  ],
  hours: [
    { day: "Monday", hours: "8:00 AM – 5:00 PM" },
    { day: "Tuesday", hours: "8:00 AM – 5:00 PM" },
    { day: "Wednesday", hours: "8:00 AM – 5:00 PM" },
    { day: "Thursday", hours: "8:00 AM – 5:00 PM" },
    { day: "Friday", hours: "8:00 AM – 5:00 PM" },
    { day: "Saturday", hours: "8:00 AM – 12:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
  categories: [
    { label: "Painting", primary: true },
    { label: "Painting Studio" },
    { label: "Refinishing Shop" },
  ],
  amenities: {
    service: [
      "On-site services available",
      "Online estimates",
    ],
    parking: [
      "On-site parking",
      "Free parking available",
    ],
    discounts: [
      "Children's discounts",
      "Family discount",
    ],
    audience: [
      "LGBTQ+ friendly",
      "Transgender safe space",
    ],
    facilities: [
      "Unisex restrooms",
    ],
  },
  process: [
    {
      step: "01",
      title: "Consultation",
      copy: "We listen to the project, review the space, and propose the right finish system for your goals and budget.",
    },
    {
      step: "02",
      title: "Estimate",
      copy: "A clear, written estimate with materials, timeline, and finish specifications — no surprises later.",
    },
    {
      step: "03",
      title: "Shop preparation",
      copy: "Pieces are transported to the shop, cataloged, stripped or sanded, and prepped under controlled conditions.",
    },
    {
      step: "04",
      title: "Finish application",
      copy: "Spray application of primer and finish coats in our dedicated booth — clean, even, durable.",
    },
    {
      step: "05",
      title: "Quality inspection",
      copy: "Every piece is inspected before reinstallation. If it doesn't meet our standard, it doesn't ship.",
    },
    {
      step: "06",
      title: "Install & walkthrough",
      copy: "Reinstall, clean, and walk the project with you to confirm everything is right.",
    },
  ],
  assets: {
    logoDark: "Logo/Logo.png",
    logoLight: "Logo/Logo-white.png",
    heroImage: "Photos/2026-02-01 (15).jpg",
    shopImage: "Photos/2026-02-01.png",
    aboutImage: "Photos/2026-02-01.png",
    pageHeroes: {
      services: "Photos/2026-02-01 (14).jpg",
      gallery: "Photos/2026-02-01 (15).jpg",
      about: "Photos/2026-02-01.png",
      contact: "Photos/2023-05-12.jpg",
    },
    gallery: [
      {
        src: "Photos/2026-02-01 (15).jpg",
        alt: "Finished kitchen with white cabinetry, wood island, stone counters, and clean cabinet details.",
        label: "Finished Kitchen Remodel",
        category: "Kitchen",
      },
      {
        src: "Photos/2026-02-01 (16).jpg",
        alt: "Close view of a completed kitchen with refined cabinet panels, tile backsplash, and wood accents.",
        label: "High-End Kitchen Finish",
        category: "Kitchen",
      },
      {
        src: "Photos/2026-02-01 (14).jpg",
        alt: "Open kitchen remodel with wood island, white walls, exposed beams, and polished finish work.",
        label: "Open Kitchen Remodel",
        category: "Kitchen",
      },
      {
        src: "Photos/2026-02-01 (25).jpg",
        alt: "Finished bathroom vanity cabinetry with white doors, black hardware, and clean trim work.",
        label: "Cabinet Finish Detail",
        category: "Cabinetry",
      },
      {
        src: "Photos/2023-05-12 (4).jpg",
        alt: "Residential exterior after fresh paint with white siding and dark trim.",
        label: "Exterior Paint Finish",
        category: "Exterior",
      },
      {
        src: "hero/1.jpeg",
        alt: "Finished lakeside exterior with white siding, black trim, and stained deck railings.",
        label: "Exterior Paint & Deck Finish",
        category: "Exterior",
      },
      {
        src: "hero/2.jpeg",
        alt: "Close view of exterior black fascia, white siding, and clean trim paint.",
        label: "Exterior Trim Finish",
        category: "Exterior",
      },
      {
        src: "hero/3.jpeg",
        alt: "Finished exterior siding and black trim details around windows and roofline.",
        label: "Exterior Siding Finish",
        category: "Exterior",
      },
      {
        src: "hero/4.jpeg",
        alt: "Lakeside home exterior with painted siding, black trim, and protected deck railings.",
        label: "Exterior Painting Project",
        category: "Exterior",
      },
      {
        src: "Photos/2026-02-01.png",
        alt: "Clean in-house spray booth with bright lighting and controlled finishing area.",
        label: "Controlled Spray Booth",
        category: "Shop",
      },
      {
        src: "Photos/stock-drywall-installation-pexels.jpg",
        alt: "Drywall installer fitting a clean white wall panel inside a finished interior.",
        label: "Drywall Installation",
        category: "Drywall",
      },
      {
        src: "Photos/2026-02-01 (23).jpg",
        alt: "Custom green cabinetry during the refinishing process with protected floors and counters.",
        label: "Cabinet Refinish In Progress",
        category: "Process",
      },
      {
        src: "Photos/20220420_111524.jpg",
        alt: "Kitchen cabinetry protected and prepared for professional painting.",
        label: "Kitchen Prep Work",
        category: "Process",
      },
      {
        src: "Photos/2023-07-30.png",
        alt: "Before and after view of an interior finish transformation.",
        label: "Before And After",
        category: "Interior",
      },
      {
        src: "Photos/2026-02-01 (8).jpg",
        alt: "Finished living area with clean painted walls, ceiling beams, and bright interior trim.",
        label: "Interior Paint Finish",
        category: "Interior",
      },
      {
        src: "Photos/2023-05-12.jpg",
        alt: "Exterior patio ceiling finished with warm wood detail and clean painted trim.",
        label: "Exterior Ceiling Detail",
        category: "Exterior",
      },
      {
        src: "Photos/2023-05-12 (2).jpg",
        alt: "Finished covered patio structure with painted columns and wood ceiling.",
        label: "Exterior Project",
        category: "Exterior",
      },
      {
        src: "Photos/2026-02-01 (11).jpg",
        alt: "Custom wood and trim detail with a refined stained finish.",
        label: "Furniture Finish",
        category: "Furniture",
      },
    ],
    videos: [
      "Videos/videoplayback.mp4",
      "Videos/videoplayback2.mp4",
      "Videos/videoplayback3.mp4",
      "Videos/videoplayback4.mp4",
    ],
  },
};

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Estimate", href: "/estimate" },
];

export const seoDefaults = {
  siteName: "Texas High Refinished",
  defaultTitle: "Texas High Refinished | Cabinet Refinishing Marble Falls TX",
  titleTemplate: "%s | Texas High Refinished",
  defaultDescription:
    "Texas High Refinished provides cabinet refinishing, kitchen remodeling, interior and exterior painting, and drywall services in Marble Falls, TX and the Texas Hill Country.",
  defaultImage: assetUrl(company.assets.heroImage),
  defaultImageAlt: "Finished kitchen with refined cabinetry by Texas High Refinished in Marble Falls, TX.",
  author: "Texas High Refinished — Esdras Paz",
  locale: "en_US",
  twitterHandle: "@texashighrefinished",
  keywords: [
    "kitchen remodeling Marble Falls",
    "kitchen refinishing Texas Hill Country",
    "cabinet refinishing Marble Falls TX",
    "high end finished kitchens",
    "interior painting Marble Falls",
    "exterior painting Highland Lakes",
    "drywall repair Marble Falls",
    "drywall installation Texas Hill Country",
    "painting studio Marble Falls",
    "refinishing shop TX",
    "Venetian plaster Texas",
    "lacquer cabinet finishes",
    "Esdras Paz painter",
    "custom furniture finishes Marble Falls",
    "decorative wall finishes",
    "licensed bonded insured painter Marble Falls",
    "Texas High Refinished",
  ],
};

/**
 * Build a Schema.org JSON-LD object representing the business.
 * Combines LocalBusiness + HomeAndConstructionBusiness + PaintingService.
 */
export function buildBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness", "PaintingService"],
    "@id": `${SITE_URL}/#business`,
    name: company.brand.legalName,
    alternateName: company.brand.initials,
    description: company.description,
    url: `${SITE_URL}/`,
    image: [
      assetUrl(company.assets.heroImage),
      assetUrl(company.assets.pageHeroes.services),
      `${SITE_URL}/Logo/Logo.png`,
    ],
    logo: `${SITE_URL}/Logo/Logo.png`,
    slogan: company.brand.tagline,
    foundingDate: "2019-02-02",
    founder: {
      "@type": "Person",
      name: company.brand.representative,
    },
    telephone: company.contact.phoneRaw,
    email: company.contact.email,
    priceRange: company.brand.priceRange,
    paymentAccepted: "Cash, check, credit card",
    currenciesAccepted: "USD",
    address: {
      "@type": "PostalAddress",
      streetAddress: company.location.street,
      addressLocality: company.location.city,
      addressRegion: company.location.state,
      postalCode: company.location.postalCode,
      addressCountry: company.location.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: company.location.latitude,
      longitude: company.location.longitude,
    },
    hasMap: company.location.mapUrl,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: company.contact.phoneRaw,
      email: company.contact.email,
      contactType: "customer service",
      areaServed: company.location.region,
      availableLanguage: ["English", "Spanish"],
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "12:00",
      },
    ],
    areaServed: company.serviceAreas.map((area) => ({
      "@type": "City",
      name: area,
    })),
    sameAs: [company.contact.facebook],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Priority Services",
      itemListElement: company.priorityServices.map((s, i) => ({
        "@type": "Offer",
        position: i + 1,
        itemOffered: {
          "@type": "Service",
          "@id": `${SITE_URL}/services#${s.slug}`,
          name: s.title,
          description: s.summary,
          serviceType: s.detail,
          url: `${SITE_URL}/services`,
          image: assetUrl(s.image),
          areaServed: company.location.region,
          provider: {
            "@id": `${SITE_URL}/#business`,
          },
        },
      })),
    },
    knowsAbout: [
      "Kitchen remodeling",
      "Cabinet refinishing",
      "High-end painted finishes",
      "Interior painting",
      "Exterior painting",
      "Drywall repair",
      "Drywall installation",
      "Venetian plaster",
      "Lacquer coatings",
      "Specialty coatings",
      "Custom furniture finishes",
    ],
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: company.brand.displayName,
    publisher: { "@id": `${SITE_URL}/#business` },
    inLanguage: "en-US",
  };
}

export function buildServiceListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/services#services`,
    name: "Texas High Refinished priority services",
    itemListElement: company.priorityServices.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        "@id": `${SITE_URL}/services#${service.slug}`,
        name: service.title,
        description: service.summary,
        serviceType: service.detail,
        url: `${SITE_URL}/services`,
        image: assetUrl(service.image),
        provider: { "@id": `${SITE_URL}/#business` },
        areaServed: company.serviceAreas.map((area) => ({
          "@type": "City",
          name: area,
        })),
      },
    })),
  };
}

export function buildGalleryJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${SITE_URL}/gallery#gallery`,
    name: "Texas High Refinished project gallery",
    description:
      "Project photography from Texas High Refinished, including kitchen refinishing, cabinet finishes, exterior painting, drywall, and shop work.",
    url: `${SITE_URL}/gallery`,
    image: company.assets.gallery.map((image) => ({
      "@type": "ImageObject",
      contentUrl: assetUrl(image.src),
      caption: image.label,
      description: image.alt,
    })),
  };
}

export function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "What services does Texas High Refinished provide?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Texas High Refinished provides kitchen remodeling, cabinet refinishing, high-end kitchen finishes, interior and exterior painting, drywall repair, and drywall installation.",
        },
      },
      {
        "@type": "Question",
        name: "Where is Texas High Refinished located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Texas High Refinished is located in ${company.location.city}, ${company.location.stateName}, and serves the Texas Hill Country and Highland Lakes areas.`,
        },
      },
      {
        "@type": "Question",
        name: "Does Texas High Refinished use an in-house shop?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Cabinetry, furniture, and finish work can be processed in a dedicated in-house shop with a controlled spray environment for cleaner, more durable results.",
        },
      },
    ],
  };
}

export function buildBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
