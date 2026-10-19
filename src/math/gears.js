// Catalogue complet des plateaux fixes et roues mobiles du Spirographe Deluxe

export const FIXED_GEARS = [
  // ANNEAUX RONDS CLASSIQUES
  {
    id: 'ring-144-96',
    name: 'Anneau Deluxe 144 / 96',
    subtitle: 'Grand anneau classique officiel',
    category: 'circle',
    outerTeeth: 144,
    innerTeeth: 96,
    defaultTeeth: 96,
    icon: 'circle-ring',
    color: '#38bdf8',
    description: 'Anneau standard du coffret Deluxe. Dents intérieures: 96, extérieures: 144.'
  },
  {
    id: 'ring-150-105',
    name: 'Anneau Deluxe 150 / 105',
    subtitle: 'Second anneau officiel Deluxe',
    category: 'circle',
    outerTeeth: 150,
    innerTeeth: 105,
    defaultTeeth: 105,
    icon: 'circle-ring',
    color: '#a78bfa',
    description: 'Multiple de 7 et 5 (105 dents internes) pour des étoiles à 5 et 7 branches.'
  },
  {
    id: 'ring-180-120',
    name: 'Anneau Géant XXL 180 / 120',
    subtitle: 'Grand format pour mandalas denses',
    category: 'circle',
    outerTeeth: 180,
    innerTeeth: 120,
    defaultTeeth: 120,
    icon: 'circle-ring',
    color: '#34d399',
    description: 'Plateau étendu permettant une précision maximale et des rosaces grandioses.'
  },

  // FORMES NON RONDES : PLATEAUX & CADRES SPÉCIAUX
  {
    id: 'ring-oval-144',
    name: 'Plateau Ovale / Stade 176/128',
    subtitle: 'Piste allongée pour médaillons ovales',
    category: 'shape',
    shapeType: 'oval',
    outerTeeth: 176,
    innerTeeth: 128,
    defaultTeeth: 128,
    icon: 'oval-ring',
    color: '#f472b6',
    description: 'Anneau étiré produisant des motifs elliptiques asymétriques et des couronnes baroques.'
  },
  {
    id: 'ring-triangle-120',
    name: 'Plateau Triangle Deltoïde 168/120',
    subtitle: 'Cadre triangulaire à 3 courbures',
    category: 'shape',
    shapeType: 'triangle',
    outerTeeth: 168,
    innerTeeth: 120,
    defaultTeeth: 120,
    icon: 'triangle-ring',
    color: '#06b6d4',
    description: 'Cadre fixe triangulaire inspiré des formes Reuleaux pour arabesques trilobées.'
  },
  {
    id: 'ring-square-128',
    name: 'Plateau Carré / Losange 168/120',
    subtitle: 'Cadre quadrangulaire à 4 sommets',
    category: 'shape',
    shapeType: 'square',
    outerTeeth: 168,
    innerTeeth: 120,
    defaultTeeth: 120,
    icon: 'square-ring',
    color: '#eab308',
    description: 'Anneau fixe carré produisant des rosaces cruciformes et des mandalas à 4 ou 8 axes.'
  },
  {
    id: 'ring-heart-120',
    name: 'Plateau Cœur Romantique 192/144',
    subtitle: 'Piste asymétrique en cœur',
    category: 'shape',
    shapeType: 'heart',
    outerTeeth: 192,
    innerTeeth: 144,
    defaultTeeth: 144,
    icon: 'heart-ring',
    color: '#f43f5e',
    description: 'Forme de cœur produisant des trajectoires asymétriques douces et des spirales d\'amour.'
  },
  {
    id: 'ring-clover-120',
    name: 'Plateau Quadrilobe / Trèfle 168/120',
    subtitle: 'Profil festonné à 4 courbures',
    category: 'shape',
    shapeType: 'clover',
    outerTeeth: 168,
    innerTeeth: 120,
    defaultTeeth: 120,
    icon: 'clover-ring',
    color: '#fb923c',
    description: 'Plateau festonné à 4 lobes pour des spirales florales complexes et effets kaléidoscopiques.'
  },

  // CRÉMAILLÈRES ET RAILS LINÉAIRES
  {
    id: 'rack-150',
    name: 'Crémaillère Droite 80',
    subtitle: 'Rail droit pour cycloïdes et frises',
    category: 'linear',
    shapeType: 'line',
    outerTeeth: 80,
    innerTeeth: 80,
    defaultTeeth: 80,
    icon: 'rack-line',
    color: '#fbbf24',
    description: 'Rail linéaire pour dessiner des cycloïdes, rubans et ondes le long d\'une droite.'
  },
  {
    id: 'rack-wave-150',
    name: 'Crémaillère Ondulée / Vague 80',
    subtitle: 'Rail sinusoïdal pour vagues géométriques',
    category: 'linear',
    shapeType: 'wave',
    outerTeeth: 80,
    innerTeeth: 80,
    defaultTeeth: 80,
    icon: 'rack-wave',
    color: '#2dd4bf',
    description: 'Rail ondulé créant des cycloïdes combinées et des frises sinueuses d\'une grande originalité.'
  }
];

// Génération ergonomique des trous pour une roue ronde
function generateRoundHoles(teeth, count = 12) {
  const holes = [];
  for (let i = 1; i <= count; i++) {
    const factor = 0.86 - (i - 1) * (0.72 / Math.max(1, count - 1));
    holes.push({
      number: i,
      rRatio: Math.max(0.12, factor),
      angleOffset: ((i - 1) * 22) * (Math.PI / 180),
      label: i === 1 ? 'Trou 1 (Périphérie)' : (i === count ? `Trou ${i} (Centre)` : `Trou ${i}`)
    });
  }
  return holes;
}

export const MOBILE_WHEELS = [
  // 14 ROUES RONDES CLASSIQUES
  {
    id: 'wheel-24',
    name: 'Roue 24 dents',
    teeth: 24,
    shape: 'round',
    color: '#f43f5e',
    holes: generateRoundHoles(24, 6),
    description: 'Très petite roue produisant des boucles serrées et des étoiles très pointues.'
  },
  {
    id: 'wheel-30',
    name: 'Roue 30 dents',
    teeth: 30,
    shape: 'round',
    color: '#ec4899',
    holes: generateRoundHoles(30, 8),
    description: 'Excellente avec l\'anneau 105 pour des étoiles à 7 pointes équilibrées.'
  },
  {
    id: 'wheel-32',
    name: 'Roue 32 dents',
    teeth: 32,
    shape: 'round',
    color: '#d946ef',
    holes: generateRoundHoles(32, 9),
    description: 'Rapport 1:3 avec l\'anneau 96 : crée une forme triangulaire à 3 branches cuspidées.'
  },
  {
    id: 'wheel-40',
    name: 'Roue 40 dents',
    teeth: 40,
    shape: 'round',
    color: '#8b5cf6',
    holes: generateRoundHoles(40, 10),
    description: 'Roue polyvalente, produit des motifs à 12 ou 21 sommets selon l\'anneau.'
  },
  {
    id: 'wheel-42',
    name: 'Roue 42 dents',
    teeth: 42,
    shape: 'round',
    color: '#6366f1',
    holes: generateRoundHoles(42, 10),
    description: 'Multiple de 7 et 6, crée avec l\'anneau 105 des motifs à 5 lobes spectaculaires.'
  },
  {
    id: 'wheel-45',
    name: 'Roue 45 dents',
    teeth: 45,
    shape: 'round',
    color: '#3b82f6',
    holes: generateRoundHoles(45, 11),
    description: 'La roue signature du coffret Deluxe pour réaliser la Fleur de Lotus à 7 pétales.'
  },
  {
    id: 'wheel-48',
    name: 'Roue 48 dents',
    teeth: 48,
    shape: 'round',
    color: '#06b6d4',
    holes: generateRoundHoles(48, 12),
    description: 'Exactement la moitié de 96 : trace une ellipse pure à 2 branches dans l\'anneau 96 !'
  },
  {
    id: 'wheel-52',
    name: 'Roue 52 dents',
    teeth: 52,
    shape: 'round',
    color: '#14b8a6',
    holes: generateRoundHoles(52, 12),
    description: 'Roue star de la vidéo : produit la grande Rosette Royale Deluxe à 24 branches étincelantes.'
  },
  {
    id: 'wheel-56',
    name: 'Roue 56 dents',
    teeth: 56,
    shape: 'round',
    color: '#10b981',
    holes: generateRoundHoles(56, 13),
    description: 'Harmonise avec 105 et 96 pour des arabesques baroques denses et soignées.'
  },
  {
    id: 'wheel-60',
    name: 'Roue 60 dents',
    teeth: 60,
    shape: 'round',
    color: '#84cc16',
    holes: generateRoundHoles(60, 14),
    description: 'Grande roue offrant une géométrie à 8 et 7 lobes très équilibrée.'
  },
  {
    id: 'wheel-63',
    name: 'Roue 63 dents',
    teeth: 63,
    shape: 'round',
    color: '#eab308',
    holes: generateRoundHoles(63, 14),
    description: 'Rapport 3:5 avec l\'anneau 105 : produit une somptueuse étoile à 5 sommets.'
  },
  {
    id: 'wheel-72',
    name: 'Roue 72 dents',
    teeth: 72,
    shape: 'round',
    color: '#f97316',
    holes: generateRoundHoles(72, 15),
    description: 'Rapport 3:4 avec 96 : produit un diamant cruciforme aux arrondis hypnotiques.'
  },
  {
    id: 'wheel-80',
    name: 'Roue 80 dents',
    teeth: 80,
    shape: 'round',
    color: '#f43f5e',
    holes: generateRoundHoles(80, 16),
    description: 'Très grande roue remplissant presque l\'anneau pour des tracés en fine dentelle.'
  },
  {
    id: 'wheel-84',
    name: 'Roue 84 dents',
    teeth: 84,
    shape: 'round',
    color: '#ec4899',
    holes: generateRoundHoles(84, 16),
    description: 'Rapport 4:5 avec 105 : trace de splendides pentagrammes ultra-détaillés.'
  },

  // 9 FORMES SPÉCIALES NON RONDES DELUXE
  {
    id: 'wheel-triangle-63',
    name: 'Roue Triangle Deltoïde',
    teeth: 63,
    shape: 'triangle',
    color: '#06b6d4',
    holes: [
      { number: 1, rRatio: 0.88, angleOffset: 0, label: 'Sommet 1' },
      { number: 2, rRatio: 0.68, angleOffset: 0, label: 'Bras 1 Médian' },
      { number: 3, rRatio: 0.48, angleOffset: 0, label: 'Bras 1 Interne' },
      { number: 4, rRatio: 0.88, angleOffset: (2 * Math.PI) / 3, label: 'Sommet 2' },
      { number: 5, rRatio: 0.68, angleOffset: (2 * Math.PI) / 3, label: 'Bras 2 Médian' },
      { number: 6, rRatio: 0.88, angleOffset: (4 * Math.PI) / 3, label: 'Sommet 3' },
      { number: 7, rRatio: 0.68, angleOffset: (4 * Math.PI) / 3, label: 'Bras 3 Médian' },
      { number: 8, rRatio: 0.15, angleOffset: 0, label: 'Centre' }
    ],
    description: 'Pièce trilobée du coffret Deluxe. Engendre des nœuds celtiques et figures triangulaires.'
  },
  {
    id: 'wheel-oval-56',
    name: 'Roue Ovale Elliptique',
    teeth: 56,
    shape: 'oval',
    color: '#8b5cf6',
    holes: [
      { number: 1, rRatio: 0.85, angleOffset: 0, label: 'Grand Axe Nord' },
      { number: 2, rRatio: 0.65, angleOffset: 0, label: 'Grand Axe Nord-Médian' },
      { number: 3, rRatio: 0.45, angleOffset: 0, label: 'Grand Axe Nord-Interne' },
      { number: 4, rRatio: 0.85, angleOffset: Math.PI, label: 'Grand Axe Sud' },
      { number: 5, rRatio: 0.65, angleOffset: Math.PI, label: 'Grand Axe Sud-Médian' },
      { number: 6, rRatio: 0.70, angleOffset: Math.PI / 2, label: 'Petit Axe Est' },
      { number: 7, rRatio: 0.70, angleOffset: (3 * Math.PI) / 2, label: 'Petit Axe Ouest' },
      { number: 8, rRatio: 0.12, angleOffset: 0, label: 'Centre Ovale' }
    ],
    description: 'Roue ovale officielle produisant des boucles étirées et des rosaces asymétriques envoûtantes.'
  },
  {
    id: 'wheel-bar-48',
    name: 'Roue Barre / Bâtonnet',
    teeth: 48,
    shape: 'bar',
    color: '#10b981',
    holes: [
      { number: 1, rRatio: 0.88, angleOffset: 0, label: 'Bout A Extérieur' },
      { number: 2, rRatio: 0.70, angleOffset: 0, label: 'Bout A Médian' },
      { number: 3, rRatio: 0.50, angleOffset: 0, label: 'Section A Interne' },
      { number: 4, rRatio: 0.30, angleOffset: 0, label: 'Près du centre A' },
      { number: 5, rRatio: 0.10, angleOffset: 0, label: 'Centre de gravité' },
      { number: 6, rRatio: 0.30, angleOffset: Math.PI, label: 'Près du centre B' },
      { number: 7, rRatio: 0.50, angleOffset: Math.PI, label: 'Section B Interne' },
      { number: 8, rRatio: 0.88, angleOffset: Math.PI, label: 'Bout B Extérieur' }
    ],
    description: 'Bâtonnet oblong denté avec bande linéaire de trous. Crée des hélices et faisceaux géométriques.'
  },
  {
    id: 'wheel-cross-64',
    name: 'Roue Croix Quadrilobe',
    teeth: 64,
    shape: 'cross',
    color: '#f59e0b',
    holes: [
      { number: 1, rRatio: 0.85, angleOffset: 0, label: 'Branche Est' },
      { number: 2, rRatio: 0.55, angleOffset: 0, label: 'Branche Est Interne' },
      { number: 3, rRatio: 0.85, angleOffset: Math.PI / 2, label: 'Branche Nord' },
      { number: 4, rRatio: 0.55, angleOffset: Math.PI / 2, label: 'Branche Nord Interne' },
      { number: 5, rRatio: 0.85, angleOffset: Math.PI, label: 'Branche Ouest' },
      { number: 6, rRatio: 0.85, angleOffset: (3 * Math.PI) / 2, label: 'Branche Sud' },
      { number: 7, rRatio: 0.15, angleOffset: 0, label: 'Centre Croix' }
    ],
    description: 'Roue cruciforme à 4 lobes pour des rosaces carrées, étoiles à 8 branches et motifs de cathédrale.'
  },
  {
    id: 'wheel-square-52',
    name: 'Roue Carrée / Quad',
    teeth: 52,
    shape: 'square',
    color: '#eab308',
    holes: [
      { number: 1, rRatio: 0.88, angleOffset: Math.PI / 4, label: 'Coin 1' },
      { number: 2, rRatio: 0.60, angleOffset: Math.PI / 4, label: 'Diagonale 1' },
      { number: 3, rRatio: 0.88, angleOffset: (3 * Math.PI) / 4, label: 'Coin 2' },
      { number: 4, rRatio: 0.88, angleOffset: (5 * Math.PI) / 4, label: 'Coin 3' },
      { number: 5, rRatio: 0.88, angleOffset: (7 * Math.PI) / 4, label: 'Coin 4' },
      { number: 6, rRatio: 0.65, angleOffset: 0, label: 'Côté Face' },
      { number: 7, rRatio: 0.15, angleOffset: 0, label: 'Centre Carré' }
    ],
    description: 'Roue quadrangulaire à coins arrondis produisant des étoiles orthogonales géométriques.'
  },
  {
    id: 'wheel-heart-44',
    name: 'Roue Cœur / Goutte',
    teeth: 44,
    shape: 'heart',
    color: '#f43f5e',
    holes: [
      { number: 1, rRatio: 0.85, angleOffset: -Math.PI / 2, label: 'Pointe Basse Cœur' },
      { number: 2, rRatio: 0.55, angleOffset: -Math.PI / 2, label: 'Axe Central' },
      { number: 3, rRatio: 0.82, angleOffset: Math.PI / 4, label: 'Lobe Supérieur Droit' },
      { number: 4, rRatio: 0.82, angleOffset: (3 * Math.PI) / 4, label: 'Lobe Supérieur Gauche' },
      { number: 5, rRatio: 0.18, angleOffset: 0, label: 'Centre de Gravité' }
    ],
    description: 'Roue en forme de cœur produisant des boucles asymétriques poétiques et romantiques.'
  },
  {
    id: 'wheel-star-50',
    name: 'Roue Étoile 5 Branches',
    teeth: 50,
    shape: 'star',
    color: '#38bdf8',
    holes: [
      { number: 1, rRatio: 0.88, angleOffset: 0, label: 'Pointe 1' },
      { number: 2, rRatio: 0.88, angleOffset: (2 * Math.PI) / 5, label: 'Pointe 2' },
      { number: 3, rRatio: 0.88, angleOffset: (4 * Math.PI) / 5, label: 'Pointe 3' },
      { number: 4, rRatio: 0.88, angleOffset: (6 * Math.PI) / 5, label: 'Pointe 4' },
      { number: 5, rRatio: 0.88, angleOffset: (8 * Math.PI) / 5, label: 'Pointe 5' },
      { number: 6, rRatio: 0.45, angleOffset: Math.PI / 5, label: 'Creux Interne' },
      { number: 7, rRatio: 0.15, angleOffset: 0, label: 'Centre Étoile' }
    ],
    description: 'Roue stellaire à 5 sommets produisant des rosaces pentagonales denses et étincelantes.'
  },
  {
    id: 'wheel-pentagon-45',
    name: 'Roue Pentagone Arrondi',
    teeth: 45,
    shape: 'pentagon',
    color: '#a855f7',
    holes: [
      { number: 1, rRatio: 0.85, angleOffset: 0, label: 'Sommet A' },
      { number: 2, rRatio: 0.60, angleOffset: 0, label: 'Rayon A' },
      { number: 3, rRatio: 0.85, angleOffset: (2 * Math.PI) / 5, label: 'Sommet B' },
      { number: 4, rRatio: 0.85, angleOffset: (4 * Math.PI) / 5, label: 'Sommet C' },
      { number: 5, rRatio: 0.15, angleOffset: 0, label: 'Centre Pentagone' }
    ],
    description: 'Roue à 5 côtés doux produisant des harmoniques subtiles et des kaléidoscopes à 5 branches.'
  },
  {
    id: 'wheel-shuttle-36',
    name: 'Roue Fuseau / Navette',
    teeth: 36,
    shape: 'shuttle',
    color: '#0ea5e9',
    holes: [
      { number: 1, rRatio: 0.88, angleOffset: 0, label: 'Extrémité Pointe Est' },
      { number: 2, rRatio: 0.55, angleOffset: 0, label: 'Corps Est' },
      { number: 3, rRatio: 0.88, angleOffset: Math.PI, label: 'Extrémité Pointe Ouest' },
      { number: 4, rRatio: 0.55, angleOffset: Math.PI, label: 'Corps Ouest' },
      { number: 5, rRatio: 0.15, angleOffset: 0, label: 'Centre Fuseau' }
    ],
    description: 'Roue fuselée à deux pointes effilées créant des courbes ondulantes en amande.'
  }
];

export const PEN_STYLES = [
  {
    id: 'ballpoint',
    name: 'Stylo Bille Deluxe',
    subtitle: 'Rendu classique 0.8mm',
    width: 1.5,
    glow: false,
    alpha: 0.95,
    icon: 'pen-ballpoint',
    desc: 'Le rendu authentique du stylo à bille Spirograph d\'origine.'
  },
  {
    id: 'fineliner',
    name: 'Pointe Fine Précision',
    subtitle: 'Ligne ultra-fine 0.3mm',
    width: 0.8,
    glow: false,
    alpha: 1.0,
    icon: 'pen-fine',
    desc: 'Tracé technique d\'une netteté chirurgicale pour motifs ultra-denses.'
  },
  {
    id: 'felt-tip',
    name: 'Feutre d\'Art Graphique',
    subtitle: 'Trait franc et saturé 1.8mm',
    width: 2.8,
    glow: false,
    alpha: 0.85,
    icon: 'pen-felt',
    desc: 'Encre fluide et intense pour un style pop art et vitrail.'
  },
  {
    id: 'neon-glow',
    name: 'Néon Luminescent',
    subtitle: 'Effet lueur électrisante',
    width: 2.0,
    glow: true,
    alpha: 1.0,
    icon: 'pen-neon',
    desc: 'Halo lumineux vibrant, spectaculaire sur fond de papier noir !'
  },
  {
    id: 'rainbow',
    name: 'Encre Arc-en-Ciel',
    subtitle: 'Dégradé chromatique continu',
    width: 1.8,
    rainbow: true,
    glow: false,
    alpha: 0.95,
    icon: 'pen-rainbow',
    desc: 'Chaque courbe passe magiquement par toutes les nuances du prisme.'
  },
  {
    id: 'twin-pen',
    name: 'Double Pointe Parallèle',
    subtitle: 'Deux pointes synchronisées',
    width: 1.2,
    double: true,
    glow: false,
    alpha: 0.9,
    icon: 'pen-double',
    desc: 'Trace simultanément deux lignes parallèles à écartement fixe.'
  },
  {
    id: 'metallic-gold',
    name: 'Or Impérial Métallisé',
    subtitle: 'Reflet doré précieux',
    width: 1.6,
    metallic: true,
    glow: false,
    alpha: 0.95,
    icon: 'pen-gold',
    desc: 'Éclat doré riche avec texture satinée raffinée.'
  }
];

export const DELUXE_COLORS = [
  { name: 'Bleu Bic Original', hex: '#1d4ed8', category: 'classic' },
  { name: 'Rouge Carmin', hex: '#dc2626', category: 'classic' },
  { name: 'Vert Émeraude', hex: '#059669', category: 'classic' },
  { name: 'Noir Encre de Chine', hex: '#111827', category: 'classic' },
  { name: 'Rose Fluo / Magenta', hex: '#f43f5e', category: 'neon' },
  { name: 'Cyan Électrique', hex: '#06b6d4', category: 'neon' },
  { name: 'Violet Cosmique', hex: '#8b5cf6', category: 'vibrant' },
  { name: 'Orange Solaire', hex: '#f97316', category: 'vibrant' },
  { name: 'Jaune Fluo', hex: '#eab308', category: 'neon' },
  { name: 'Or Impérial', hex: '#d97706', category: 'metallic' },
  { name: 'Argent Lunaire', hex: '#94a3b8', category: 'metallic' },
  { name: 'Blanc Craie Pure', hex: '#ffffff', category: 'light' }
];

export const PAPER_THEMES = [
  {
    id: 'white-paper',
    name: 'Papier Dessin Blanc',
    subtitle: 'Grain fin 180g/m²',
    bgColor: '#fdfbf7',
    gridColor: 'rgba(0, 0, 0, 0.04)',
    dark: false
  },
  {
    id: 'black-paper',
    name: 'Papier Noir Intense',
    subtitle: 'Studio Dark Art & Néon',
    bgColor: '#090b10',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    dark: true
  },
  {
    id: 'kraft-paper',
    name: 'Papier Kraft Vintage',
    subtitle: 'Papier d\'atelier naturel',
    bgColor: '#e3d5be',
    gridColor: 'rgba(92, 64, 41, 0.06)',
    dark: false
  },
  {
    id: 'blueprint',
    name: 'Calque Bleu d\'Ingénieur',
    subtitle: 'Grille technique cyano',
    bgColor: '#0f2744',
    gridColor: 'rgba(56, 189, 248, 0.12)',
    dark: true
  }
];
