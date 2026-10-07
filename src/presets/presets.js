// Bibliothèque de motifs préréglés du Spirographe Deluxe

export const PRESETS = [
  {
    id: 'rosette-royale',
    name: 'Rosette Royale Deluxe',
    tag: 'Classique Vidéo',
    description: 'La création emblématique de la vidéo avec la Roue 52 : une spectaculaire rosette à 24 branches superposant bleu bic et rouge carmin.',
    paperId: 'white-paper',
    layers: [
      {
        fixedGearId: 'ring-144-96',
        mobileGearId: 'wheel-52',
        mode: 'hypo',
        holeNumber: 1,
        penStyleId: 'ballpoint',
        color: '#1d4ed8',
        phaseOffsetDeg: 0,
        lineWidth: 1.5
      },
      {
        fixedGearId: 'ring-144-96',
        mobileGearId: 'wheel-52',
        mode: 'hypo',
        holeNumber: 3,
        penStyleId: 'ballpoint',
        color: '#dc2626',
        phaseOffsetDeg: 7.5,
        lineWidth: 1.5
      }
    ]
  },
  {
    id: 'etoile-polaire-7',
    name: 'Étoile Céleste à 7 Sommets',
    tag: 'Anneau 105',
    description: 'Roue 45 dans l\'anneau 105 : produit une géométrie céleste pure à 7 branches cuspidées, sublimée par du cyan électrique et de l\'or.',
    paperId: 'white-paper',
    layers: [
      {
        fixedGearId: 'ring-150-105',
        mobileGearId: 'wheel-45',
        mode: 'hypo',
        holeNumber: 1,
        penStyleId: 'fineliner',
        color: '#06b6d4',
        phaseOffsetDeg: 0,
        lineWidth: 1.2
      },
      {
        fixedGearId: 'ring-150-105',
        mobileGearId: 'wheel-45',
        mode: 'hypo',
        holeNumber: 4,
        penStyleId: 'metallic-gold',
        color: '#d97706',
        phaseOffsetDeg: 25.7,
        lineWidth: 1.4
      }
    ]
  },
  {
    id: 'lotus-neon-noir',
    name: 'Fleur de Lotus Luminescente',
    tag: 'Néon & Papier Noir',
    description: 'Sur papier noir profond, un mandala quadruple aux couleurs néon (rose, vert, violet) avec halo de lumière féerique.',
    paperId: 'black-paper',
    layers: [
      {
        fixedGearId: 'ring-144-96',
        mobileGearId: 'wheel-40',
        mode: 'hypo',
        holeNumber: 2,
        penStyleId: 'neon-glow',
        color: '#f43f5e',
        phaseOffsetDeg: 0,
        lineWidth: 2.0
      },
      {
        fixedGearId: 'ring-144-96',
        mobileGearId: 'wheel-40',
        mode: 'hypo',
        holeNumber: 5,
        penStyleId: 'neon-glow',
        color: '#10b981',
        phaseOffsetDeg: 15,
        lineWidth: 2.0
      },
      {
        fixedGearId: 'ring-144-96',
        mobileGearId: 'wheel-40',
        mode: 'hypo',
        holeNumber: 8,
        penStyleId: 'neon-glow',
        color: '#8b5cf6',
        phaseOffsetDeg: 30,
        lineWidth: 2.0
      }
    ]
  },
  {
    id: 'marguerite-epitrochoide',
    name: 'Marguerite Solaire Épitrochoïde',
    tag: 'Roue Extérieure',
    description: 'La roue tourne sur la périphérie externe de l\'anneau (Épitrochoïde). Les pétales s\'ouvrent vers l\'extérieur comme une fleur en pleine floraison.',
    paperId: 'white-paper',
    layers: [
      {
        fixedGearId: 'ring-144-96',
        mobileGearId: 'wheel-32',
        mode: 'epi',
        holeNumber: 1,
        penStyleId: 'felt-tip',
        color: '#f97316',
        phaseOffsetDeg: 0,
        lineWidth: 2.2
      },
      {
        fixedGearId: 'ring-144-96',
        mobileGearId: 'wheel-32',
        mode: 'epi',
        holeNumber: 4,
        penStyleId: 'felt-tip',
        color: '#eab308',
        phaseOffsetDeg: 15,
        lineWidth: 1.8
      }
    ]
  },
  {
    id: 'dentelle-triangulaire',
    name: 'Dentelle Celtique Triangulaire',
    tag: 'Forme Spéciale',
    description: 'Exploitation de la Roue Triangle Deltoïde avec tracé continu arc-en-ciel créant un triple vortex entrecroisé.',
    paperId: 'black-paper',
    layers: [
      {
        fixedGearId: 'ring-150-105',
        mobileGearId: 'wheel-triangle-63',
        mode: 'hypo',
        holeNumber: 1,
        penStyleId: 'rainbow',
        color: '#38bdf8',
        phaseOffsetDeg: 0,
        lineWidth: 1.8
      },
      {
        fixedGearId: 'ring-150-105',
        mobileGearId: 'wheel-triangle-63',
        mode: 'hypo',
        holeNumber: 8,
        penStyleId: 'neon-glow',
        color: '#ffffff',
        phaseOffsetDeg: 60,
        lineWidth: 1.6
      }
    ]
  },
  {
    id: 'vague-cycloide',
    name: 'Frise Linéaire en Cycloïde',
    tag: 'Crémaillère Droite',
    description: 'Utilisation de la crémaillère linéaire 150 pour créer des ondes et rubans sinusoïdaux en double pointe.',
    paperId: 'kraft-paper',
    layers: [
      {
        fixedGearId: 'rack-150',
        mobileGearId: 'wheel-40',
        mode: 'rack',
        holeNumber: 1,
        penStyleId: 'twin-pen',
        color: '#059669',
        phaseOffsetDeg: 0,
        lineWidth: 1.3
      },
      {
        fixedGearId: 'rack-150',
        mobileGearId: 'wheel-40',
        mode: 'rack',
        holeNumber: 5,
        penStyleId: 'ballpoint',
        color: '#dc2626',
        phaseOffsetDeg: 0,
        lineWidth: 1.4
      }
    ]
  },
  {
    id: 'couronne-ovale',
    name: 'Couronne Royale Ovale',
    tag: 'Plateau Ovale',
    description: 'Plateau stade étiré combiné à la roue ovale : arabesques étirées et médaillon baroque digne de l\'orfèvrerie.',
    paperId: 'white-paper',
    layers: [
      {
        fixedGearId: 'ring-oval-144',
        mobileGearId: 'wheel-oval-56',
        mode: 'hypo',
        holeNumber: 1,
        penStyleId: 'metallic-gold',
        color: '#d97706',
        phaseOffsetDeg: 0,
        lineWidth: 1.6
      },
      {
        fixedGearId: 'ring-oval-144',
        mobileGearId: 'wheel-oval-56',
        mode: 'hypo',
        holeNumber: 6,
        penStyleId: 'fineliner',
        color: '#1d4ed8',
        phaseOffsetDeg: 12,
        lineWidth: 1.2
      }
    ]
  }
];
