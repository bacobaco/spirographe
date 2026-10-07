// Définition de tous les plateaux fixes et roues mobiles du Spirographe Deluxe

export const FIXED_GEARS = [
  {
    id: 'ring-144-96',
    name: 'Anneau Deluxe 144 / 96',
    subtitle: 'Le grand anneau classique Deluxe',
    category: 'circle',
    outerTeeth: 144,
    innerTeeth: 96,
    defaultTeeth: 96,
    icon: 'circle-ring',
    color: '#38bdf8',
    description: 'Anneau standard du coffret Deluxe. Idéal pour les rosettes à 8, 12, 16 ou 24 pétales.'
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
    description: 'Anneau avec 105 dents internes (multiple de 7 et 5) pour de somptueuses étoiles à 5 et 7 branches.'
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
    description: 'Grand plateau permettant une précision maximale et des rosaces grandioses.'
  },
  {
    id: 'rack-150',
    name: 'Crémaillère Linéaire 150',
    subtitle: 'Barre droite pour frises et vagues',
    category: 'linear',
    outerTeeth: 150,
    innerTeeth: 150,
    defaultTeeth: 150,
    icon: 'rack-line',
    color: '#fbbf24',
    description: 'Rail droit pour dessiner des cycloïdes, sinusoïdes et rubans géométriques le long d\'une ligne.'
  },
  {
    id: 'ring-oval-144',
    name: 'Plateau Stade / Ovale 144',
    subtitle: 'Piste allongée pour couronnes ovales',
    category: 'shape',
    outerTeeth: 144,
    innerTeeth: 112,
    defaultTeeth: 112,
    icon: 'oval-ring',
    color: '#f472b6',
    description: 'Anneau étiré produisant des motifs elliptiques asymétriques très élégants.'
  },
  {
    id: 'ring-clover-120',
    name: 'Plateau Quadrilobe / Trèfle 120',
    subtitle: 'Profil festonné à 4 courbures',
    category: 'shape',
    outerTeeth: 144,
    innerTeeth: 120,
    defaultTeeth: 120,
    icon: 'clover-ring',
    color: '#fb923c',
    description: 'Plateau ondulé à 4 lobes pour des spirales florales complexes et effets kaléidoscopiques.'
  }
];

// Génération des trous pour une roue ronde
function generateRoundHoles(teeth, count = 12) {
  const holes = [];
  // Le rayon de la roue est proportionnel à teeth
  // Le premier trou est à ~82% du rayon extérieur, le dernier à ~15%
  for (let i = 1; i <= count; i++) {
    // Fraction du rayon de 0.85 (trou 1) à 0.15 (dernier trou)
    const factor = 0.86 - (i - 1) * (0.72 / (count - 1));
    holes.push({
      number: i,
      rRatio: Math.max(0.12, factor),
      angleOffset: ((i - 1) * 22) * (Math.PI / 180), // petite spirale ergonomique comme sur les vraies roues
      label: i === 1 ? 'Trou 1 (Périphérie)' : (i === count ? `Trou ${i} (Centre)` : `Trou ${i}`)
    });
  }
  return holes;
}

export const MOBILE_WHEELS = [
  // Roues rondes classiques du coffret Deluxe
  {
    id: 'wheel-24',
    name: 'Roue 24 dents',
    teeth: 24,
    shape: 'round',
    color: '#f43f5e',
    holes: generateRoundHoles(24, 6),
    description: 'Très petite roue agile produisant des boucles serrées et des étoiles très pointues.'
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
    description: 'Roue tierce parfaite avec l\'anneau 96 : crée une forme triangulaire à 3 branches cuspidées.'
  },
  {
    id: 'wheel-40',
    name: 'Roue 40 dents',
    teeth: 40,
    shape: 'round',
    color: '#8b5cf6',
    holes: generateRoundHoles(40, 10),
    description: 'Roue polyvalente du coffret, produit des motifs à 12 ou 21 sommets selon l\'anneau.'
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
    description: 'La roue signature du coffret Deluxe pour réaliser la légendaire Fleur de Lotus à 7 pétales.'
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

  // Roues de formes spéciales Deluxe
  {
    id: 'wheel-triangle-63',
    name: 'Roue Triangle Deltoïde',
    teeth: 63,
    shape: 'triangle',
    color: '#06b6d4',
    holes: [
      { number: 1, rRatio: 0.88, angleOffset: 0, label: 'Pointe A (Sommet 1)' },
      { number: 2, rRatio: 0.70, angleOffset: 0, label: 'Bras A (Milieu)' },
      { number: 3, rRatio: 0.50, angleOffset: 0, label: 'Bras A (Intérieur)' },
      { number: 4, rRatio: 0.88, angleOffset: (2 * Math.PI) / 3, label: 'Pointe B (Sommet 2)' },
      { number: 5, rRatio: 0.65, angleOffset: (2 * Math.PI) / 3, label: 'Bras B (Milieu)' },
      { number: 6, rRatio: 0.88, angleOffset: (4 * Math.PI) / 3, label: 'Pointe C (Sommet 3)' },
      { number: 7, rRatio: 0.65, angleOffset: (4 * Math.PI) / 3, label: 'Bras C (Milieu)' },
      { number: 8, rRatio: 0.15, angleOffset: 0, label: 'Centre' }
    ],
    description: 'Pièce spéciale trilobée du coffret. Engendre des figures triangulées et des nœuds celtiques.'
  },
  {
    id: 'wheel-oval-56',
    name: 'Roue Ovale Elliptique',
    teeth: 56,
    shape: 'oval',
    color: '#8b5cf6',
    holes: [
      { number: 1, rRatio: 0.85, angleOffset: 0, label: 'Grand Axe Extrémité Nord' },
      { number: 2, rRatio: 0.65, angleOffset: 0, label: 'Grand Axe Nord' },
      { number: 3, rRatio: 0.45, angleOffset: 0, label: 'Grand Axe Centre-Nord' },
      { number: 4, rRatio: 0.85, angleOffset: Math.PI, label: 'Grand Axe Extrémité Sud' },
      { number: 5, rRatio: 0.65, angleOffset: Math.PI, label: 'Grand Axe Sud' },
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
      { number: 1, rRatio: 0.88, angleOffset: 0, label: 'Bout A' },
      { number: 2, rRatio: 0.70, angleOffset: 0, label: 'Bout A Médian' },
      { number: 3, rRatio: 0.50, angleOffset: 0, label: 'Section A' },
      { number: 4, rRatio: 0.30, angleOffset: 0, label: 'Près du centre' },
      { number: 5, rRatio: 0.10, angleOffset: 0, label: 'Centre de gravité' },
      { number: 6, rRatio: 0.30, angleOffset: Math.PI, label: 'Section B' },
      { number: 7, rRatio: 0.50, angleOffset: Math.PI, label: 'Bout B Médian' },
      { number: 8, rRatio: 0.88, angleOffset: Math.PI, label: 'Bout B' }
    ],
    description: 'Bâtonnet denté avec bande linéaire de trous. Crée des hélices et faisceaux géométriques.'
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
      { number: 6, rRatio: 0.55, angleOffset: Math.PI, label: 'Branche Ouest Interne' },
      { number: 7, rRatio: 0.85, angleOffset: (3 * Math.PI) / 2, label: 'Branche Sud' },
      { number: 8, rRatio: 0.55, angleOffset: (3 * Math.PI) / 2, label: 'Branche Sud Interne' },
      { number: 9, rRatio: 0.15, angleOffset: 0, label: 'Centre Croix' }
    ],
    description: 'Roue cruciforme à 4 lobes pour des rosaces carrées, étoiles à 8 branches et motifs de cathédrale.'
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
  // Classiques du coffret Deluxe
  { name: 'Bleu Bic Original', hex: '#1d4ed8', category: 'classic' },
  { name: 'Rouge Carmin', hex: '#dc2626', category: 'classic' },
  { name: 'Vert Émeraude', hex: '#059669', category: 'classic' },
  { name: 'Noir Encre de Chine', hex: '#111827', category: 'classic' },
  // Stylos modernes & néon
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
    paperTexture: true,
    dark: false
  },
  {
    id: 'black-paper',
    name: 'Papier Noir Intense',
    subtitle: 'Studio Dark Art & Néon',
    bgColor: '#090b10',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    paperTexture: true,
    dark: true
  },
  {
    id: 'kraft-paper',
    name: 'Papier Kraft Vintage',
    subtitle: 'Papier d\'atelier naturel',
    bgColor: '#e3d5be',
    gridColor: 'rgba(92, 64, 41, 0.06)',
    paperTexture: true,
    dark: false
  },
  {
    id: 'blueprint',
    name: 'Calque Bleu d\'Ingénieur',
    subtitle: 'Grille technique cyano',
    bgColor: '#0f2744',
    gridColor: 'rgba(56, 189, 248, 0.12)',
    paperTexture: false,
    dark: true
  }
];
