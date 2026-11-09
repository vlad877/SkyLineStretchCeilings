// Single source of truth for every piece of copy on the landing page.
// Facts here are cross-checked against the client brief — see README
// "Brief cross-check" before changing any claim about warranty,
// certification, experience or timelines.

export const site = {
  name: 'SkyLine Stretch Ceilings',
  phone: '604‑345‑2324',
  phoneHref: 'tel:+16043452324',
  whatsapp: 'https://wa.me/16043452324',
  email: 'vladtkachenko2110@gmail.com',
  legal: 'GREAT HOME RENOVATIONS LTD · British Columbia',
  // Brief states "8AM - 6PM" with no day breakdown — confirm before adding days.
  hours: ['8am – 6pm'],
  social: [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/skyline_stretchceilings/',
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=61591128723418',
    },
    { label: 'Google', href: 'https://share.google/iTtPjStWd6E5QaTwt' },
  ],
}

// Root-relative so the same links work from /privacy as well as the home page.
// On the home page the browser treats these as same-document hash navigation,
// so they still smooth-scroll instead of reloading.
export const nav = [
  { label: 'Ceilings', href: '/#ceilings' },
  { label: 'Portfolio', href: '/#portfolio' },
  { label: 'Process', href: '/#process' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'FAQ', href: '/#faq' },
]

export const heroStats = [
  { value: 'Since 2017', label: 'Installing ceilings' },
  { value: '1–3 days', label: 'Typical project' },
  { value: '10 yr', label: 'Warranty' },
]

export const aboutChips = [
  'Perfectly flat',
  'Integrated LED',
  'Minimal dust',
  'Fire‑rated membrane',
]

// Rendered as a 4-column grid — 8 cards fill two even rows.
// `bestseller: true` shows a badge on the card; currently the whole first row.
export const ceilingTypes = [
  // Row 1
  {
    name: 'Glossy',
    img: '/assets/new/1.webp',
    bestseller: true,
    desc: 'A mirror‑like reflective finish that makes the room feel larger and brighter. A modern option for creating a more open, spacious interior.',
  },
  {
    name: 'Translucent',
    img: '/assets/g20.jpg',
    bestseller: true,
    desc: 'A light‑diffusing membrane lit from behind, spreading soft, even light across the surface with no visible fixtures. Installed in roughly two days.',
  },
  {
    name: 'LED Light Lines',
    img: '/assets/new/2.jpg',
    bestseller: true,
    desc: 'Integrated LED lines create clean, precise lines of light across the ceiling and can be arranged to complement the geometry and design of the room.',
  },
  {
    name: 'Starry Sky',
    img: '/assets/g24.jpg',
    bestseller: true,
    desc: 'A fibre‑optic stretch ceiling that creates a realistic night‑sky effect with tiny points of light. Ideal for bedrooms, children’s rooms and home theatres. Typically installed in 1–2 days.',
  },
  // Row 2
  {
    name: 'Track Lighting',
    img: '/assets/g07.jpg',
    desc: 'Integrated track lighting combines a clean ceiling design with flexible lighting that can be adjusted after installation.',
  },
  {
    name: 'Stretch walls',
    img: '/assets/new/4.png',
    desc: 'The same tensioned system applied to a wall — a perfectly flat surface that hides imperfections and can carry printed graphics or an integrated LED line. Fitted from one day.',
  },
  {
    name: 'Floating / Cove Lighting',
    img: '/assets/g16.jpg',
    desc: 'A perimeter of concealed light that washes the ceiling with a warm, floating glow — elegant in hallways, bedrooms and lounges.',
  },
  {
    name: 'Printed / Custom',
    img: '/assets/new/3.jpg',
    desc: 'Create a custom ceiling with virtually any image or graphic — from a sky effect to modern artwork. A distinctive option for residential and commercial interiors.',
  },
]

// Offered per the brief but with no photography available yet — listed as
// text rather than illustrated with unrelated images.
export const alsoAvailable = [
  'Matte',
  'Satin finish',
  'Fabric / polyester systems',
  'Multi‑level ceilings',
  'Acoustic / perforated',
  'Repair & membrane replacement',
]

export const works = [
  {
    title: 'Office reception light lines',
    tag: 'Commercial',
    ratio: '4/3',
    img: '/assets/g12.jpg',
  },
  {
    title: 'Kitchen light‑frame ceiling',
    tag: 'Residential',
    ratio: '4/3',
    img: '/assets/g10.png',
  },
  {
    title: 'Hallway cove lighting',
    tag: 'Residential',
    ratio: '4/5',
    img: '/assets/g17.jpg',
  },
  {
    title: 'Commercial lounge ceiling',
    tag: 'Commercial',
    ratio: '4/5',
    img: '/assets/g04.jpg',
  },
  {
    title: 'Translucent light',
    tag: 'Residential',
    ratio: '4/3',
    img: '/assets/new/5.jpg',
  },
  {
    title: 'Light‑line hallway',
    tag: 'Residential',
    ratio: '4/3',
    img: '/assets/g11.jpg',
  },
]

export const benefits = [
  {
    no: '01',
    title: 'Flawless flat surface',
    text: 'Cracks, stains and an uneven old ceiling disappear behind one perfectly level, modern plane.',
  },
  {
    no: '02',
    title: 'Built‑in lighting',
    text: 'Integrate LED lines, track systems and translucent for a designer look — wired in cleanly.',
  },
  {
    no: '03',
    title: 'Fast, low‑dust install',
    text: 'No mudding, sanding, painting or long drying. Most rooms are finished in a single day.',
  },
  {
    no: '04',
    title: 'Hides everything',
    text: 'Wiring, ducting, pipes and an old ceiling all disappear above the PVC membrane.',
  },
  {
    no: '05',
    title: 'Fire‑rated materials',
    text: 'Selected membranes meet recognized fire-rating standards, including CAN-S102 and ASTM E84, depending on the material used.',
  },
  {
    no: '06',
    title: 'Easy to maintain',
    text: 'The surface is easy to clean and can be washed or disinfected without aggressive cleaning products.',
  },
]

export const reasons = [
  {
    title: 'Stretch ceiling experience since 2017',
    text: 'Our team has been working with stretch ceiling systems since 2017, bringing years of hands‑on installation experience to projects.',
  },
  {
    title: 'Operated by Great Home Renovations Ltd',
    text: 'Skyline Stretch Ceilings is a brand operated by Great Home Renovations Ltd., providing one point of contact from estimate through installation.',
  },
  {
    title: 'Lighting specialists',
    text: 'From single LED lines to track systems and translucent panels, integrated light is what we do best.',
  },
  {
    // The six problems clients actually arrive with, per the client's own list.
    title: 'Popcorn, cracks and dim rooms — solved',
    text: 'Popcorn texture, hairline cracks and uneven surfaces disappear behind one flat membrane, integrated LED replaces dim lighting, and you get a modern finish without living through a full renovation.',
  },
  {
    // Deliberately per-material: ratings differ between the PVC and the
    // textile systems, so no blanket Class 1 claim here. Supplier names are
    // kept off the public page at the client's request.
    title: 'Fire‑rated materials',
    text: 'We use Canadian and European materials with documented fire ratings specific to each material.',
  },
  {
    title: '10‑year warranty',
    text: 'Quality materials and professional installation backed by up to a 10‑year warranty.',
  },
]

export const steps = [
  {
    no: '01',
    title: 'Free consultation',
    text: 'We visit your space, discuss ideas and take precise measurements — at no cost.',
  },
  {
    no: '02',
    title: 'Design & quote',
    text: 'You receive a clear quote with finish, lighting and layout options to choose from.',
  },
  {
    no: '03',
    title: 'Manufacturing',
    text: 'Your PVC or textile membrane is cut and prepared for your room, typically 1–2 weeks from measurement.',
  },
  {
    no: '04',
    title: 'Installation',
    text: 'Our crew installs the ceiling cleanly and integrates the selected lighting and fixtures with minimal dust and disruption.',
  },
  {
    no: '05',
    title: 'Walkthrough',
    text: 'We review the finished result together and hand over your warranty.',
  },
]

// ⚠️ PLACEHOLDER — INVENTED. The brief confirms no completed Canadian
// projects and no reviews yet, so none of these people exist. They are here
// only so the layout can be reviewed. Replace with real, attributable reviews
// or delete the Reviews section (and its nav entry) before launch — shipping
// these as genuine testimonials is misrepresentation under Canada's
// Competition Act. See README "Brief cross-check".
// Each one is written to close a different problem from the client's list:
// popcorn ceilings, cracks and unevenness, weak lighting, dated look, and the
// dread of a messy renovation.
export const reviews = [
  {
    text: 'We had popcorn ceilings through the whole main floor and were dreading the scraping and the dust. They covered it in a day — barely any mess, and the kitchen feels twice as bright.',
    name: 'Sarah M.',
    location: 'Coquitlam, BC',
  },
  {
    text: 'Our living room ceiling had cracks that came back after every repaint, and it was never really level. Now it is perfectly flat and the LED lines make the whole room look modern.',
    name: 'Daniel K.',
    location: 'Port Coquitlam, BC',
  },
  {
    text: 'The basement was always dim and dated. The translucent panel and light lines completely changed how the space feels, and we never had to move out for a renovation.',
    name: 'Priya S.',
    location: 'Burnaby, BC',
  },
]

export const faqs = [
  {
    q: 'Does a stretch ceiling look like plastic?',
    a: 'No. A matte finish looks like perfectly painted drywall, while gloss looks like polished lacquer. Up close it reads as a clean, high‑end surface — not cheap plastic.',
  },
  // {
  //   q: 'Will the ceiling sag over time?',
  //   a: 'A properly installed stretch ceiling is designed to remain tensioned and flat. Depending on the selected system, manufacturer warranty coverage may also include sagging or loss of membrane tension.',
  // },
  {
    q: 'Is the material easy to tear?',
    a: 'In everyday use, no. The film is tough and holds its tension; only a deliberate cut from a sharp object will damage it, and a single panel can usually be repaired or replaced without dismantling the whole ceiling.',
  },
  {
    q: 'Is it safe around lighting and heat?',
    a: 'Yes, when the system is installed correctly. Fixtures and other equipment are mounted to the original structure above the membrane, with reinforced openings where required. Fire ratings vary by membrane system and material.',
  },
  {
    // ⚠️ Standards come from the supplier documentation cited in the brief.
    // Supplier names are kept off the public page at the client's request —
    // confirm the certificates are on hand before launch.
    // `a` also accepts an array — each entry renders as its own paragraph.
    q: 'What fire ratings and standards do your materials meet?',
    a: [
      'Our membrane systems are available with documented fire ratings and certifications depending on the material selected.',
      'PVC membranes: CAN-S102, ASTM E84, Class 1 fire rating for Canada and the USA, and EN 13501-1 B-s1,d0.',
      'Textile (polyester) systems: DIN 4102-B1, NFPA 701, M1, IMO, and EN 13501-1 B-s2,d0.',
      'Systems may also use CSA- and UL-approved accessories. Specific documentation depends on the materials and components selected for your project.',
    ],
  },
  {
    q: 'How much room height do I lose?',
    a: 'Usually 1 to 2 inches — just enough to clear the hidden perimeter track. A backlit translucent ceiling is the exception, since it needs more depth between the LED and the membrane so the light spreads evenly.',
  },
  {
    q: 'What’s the difference between a stretch ceiling and a drop ceiling?',
    a: 'A traditional drop ceiling uses a visible grid and individual panels. A stretch ceiling uses a tensioned PVC or textile membrane to create a seamless, modern surface that can also integrate lighting.',
  },
  {
    q: 'How long does installation take?',
    a: 'A standard ceiling is usually finished in four to six hours. Projects with light lines, multiple levels or commercial scope take two to three days.',
  },
  {
    q: 'What warranty and areas do you cover?',
    a: 'Every job carries up to a 10‑year warranty — 10 years on materials and 3 years on installation. We serve Vancouver and the Lower Mainland, from West Vancouver to Langley and White Rock.',
  },
]

// The map outlines the polygons in src/geo/service-area.json and frames
// itself to it, so there is no zoom level to keep in sync here.
// `center` only positions the marker.
export const serviceArea = {
  label: 'Vancouver, BC',
  center: { lat: 49.2488, lng: -123.1027 },
}

export const cities = [
  'Vancouver',
  'West Vancouver',
  'North Vancouver',
  'Burnaby',
  'New Westminster',
  'Coquitlam',
  'Port Coquitlam',
  'Port Moody',
  'Anmore',
  'Belcarra',
  'Richmond',
  'Delta',
  'Surrey',
  'Langley',
  'Pitt Meadows',
  'Maple Ridge',
  'White Rock',
]
