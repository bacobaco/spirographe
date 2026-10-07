// Moteur mathématique et cinématique pour le Spirographe Deluxe (Coordonnées centrées en (0,0))

export function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

// Calcul des statistiques géométriques précises d'un motif
export function getPatternStats(fixedGear, mobileGear, mode = 'hypo') {
  const N = mode === 'epi' ? (fixedGear.outerTeeth || 144) : (fixedGear.innerTeeth || 96);
  const n = mobileGear.teeth || 48;
  const g = gcd(N, n);

  const petals = Math.round(N / g);
  const rotationsAroundRing = Math.round(n / g);
  const totalRevolutions = Math.round(N / g);
  const totalTeethTraveled = lcm(N, n);
  const maxTheta = 2 * Math.PI * rotationsAroundRing;

  return {
    fixedTeeth: N,
    wheelTeeth: n,
    gcd: g,
    petals,
    rotationsAroundRing,
    totalRevolutions,
    totalTeethTraveled,
    maxTheta,
    ratio: (N / n).toFixed(2),
    symmetryType: petals <= 24 ? `${petals} branches` : `${petals} lobes denses`
  };
}

// Rayon effectif d'une roue selon sa forme et son angle propre psi
export function getWheelLocalRadius(wheel, psi = 0, baseR) {
  if (!wheel || wheel.shape === 'round') {
    return baseR;
  }
  switch (wheel.shape) {
    case 'triangle':
      // 3 lobes arrondis
      return baseR * (1 + 0.18 * Math.cos(3 * psi));
    case 'oval':
      // Ellipse à 2 axes
      return baseR * (1 + 0.22 * Math.cos(2 * psi));
    case 'bar':
      // Bâtonnet allongé
      return baseR * (1 + 0.35 * Math.abs(Math.cos(psi)) - 0.2 * Math.abs(Math.sin(psi)));
    case 'cross':
      // Croix à 4 branches
      return baseR * (1 + 0.16 * Math.cos(4 * psi));
    default:
      return baseR;
  }
}

// Rayon effectif d'un anneau selon sa forme et l'angle theta
export function getRingLocalRadius(fixedGear, theta = 0, baseR) {
  if (!fixedGear || fixedGear.category === 'circle') {
    return baseR;
  }
  switch (fixedGear.id) {
    case 'ring-oval-144':
      // Stade ovale
      return baseR * (1 + 0.18 * Math.cos(2 * theta));
    case 'ring-clover-120':
      // Profil trèfle à 4 courbures
      return baseR * (1 + 0.10 * Math.cos(4 * theta));
    default:
      return baseR;
  }
}

// Calcul cinématique de l'état complet centré à l'origine (0, 0)
export function calculateGearState({
  fixedGear,
  mobileGear,
  holeIndex = 0,
  hole = null,
  mode = 'hypo',
  theta = 0,
  phaseOffset = 0, // Décalage angulaire en radians
  unitScale = 14.0 // Échelle en pixels par pas de dent pour remplir élégamment la feuille
}) {
  const isRack = fixedGear.category === 'linear' || mode === 'rack';
  const isEpi = mode === 'epi';

  // Le pas d'une dent en pixels
  const pitch = unitScale;
  const N = isEpi ? (fixedGear.outerTeeth || 144) : (fixedGear.innerTeeth || 96);
  const n = mobileGear.teeth || 48;

  const R0 = (N * pitch) / (2 * Math.PI);
  const r0 = (n * pitch) / (2 * Math.PI);

  const holes = mobileGear.holes || [];
  const selectedHole = hole || holes[Math.min(holeIndex, holes.length - 1)] || {
    number: 1,
    rRatio: 0.8,
    angleOffset: 0
  };

  if (isRack) {
    // Crémaillère droite centrée à (0, 0)
    const rackLength = N * pitch;
    const s = (theta * R0) % (rackLength * 2);
    let xOffset;
    if (s <= rackLength) {
      xOffset = s - rackLength / 2;
    } else {
      xOffset = (2 * rackLength - s) - rackLength / 2;
    }
    const wheelCenter = {
      x: xOffset,
      y: -(isEpi ? -r0 : r0)
    };
    const wheelAngle = -(xOffset / r0) + phaseOffset;

    const d = r0 * selectedHole.rRatio;
    const penLocalAngle = wheelAngle + (selectedHole.angleOffset || 0);

    const penPos = {
      x: wheelCenter.x + d * Math.cos(penLocalAngle),
      y: wheelCenter.y + d * Math.sin(penLocalAngle)
    };

    return {
      wheelCenter,
      wheelAngle,
      penPos,
      contactPoint: { x: wheelCenter.x, y: 0 },
      wheelRadius: r0,
      ringRadius: R0,
      selectedHole,
      pitch
    };
  }

  // Anneaux circulaires ou ondulés
  const R = getRingLocalRadius(fixedGear, theta, R0);
  const r = r0;

  let wheelCenter;
  let wheelAngle;
  let contactPoint;

  if (isEpi) {
    // Épitrochoïde : la roue roule sur l'extérieur de l'anneau
    const distCenter = R + r;
    const effectiveTheta = theta + phaseOffset;

    wheelCenter = {
      x: distCenter * Math.cos(effectiveTheta),
      y: distCenter * Math.sin(effectiveTheta)
    };

    contactPoint = {
      x: R * Math.cos(effectiveTheta),
      y: R * Math.sin(effectiveTheta)
    };

    const rollingAngle = (N / n) * theta;
    wheelAngle = effectiveTheta + rollingAngle;
  } else {
    // Hypotrochoïde : la roue roule à l'intérieur de l'anneau
    const distCenter = Math.max(5, R - r);
    const effectiveTheta = theta + phaseOffset;

    wheelCenter = {
      x: distCenter * Math.cos(effectiveTheta),
      y: distCenter * Math.sin(effectiveTheta)
    };

    contactPoint = {
      x: R * Math.cos(effectiveTheta),
      y: R * Math.sin(effectiveTheta)
    };

    const rollingAngle = (N / n) * theta;
    wheelAngle = effectiveTheta - rollingAngle;
  }

  const localR = getWheelLocalRadius(mobileGear, wheelAngle, r);
  const d = localR * selectedHole.rRatio;
  const penAngle = wheelAngle + (selectedHole.angleOffset || 0);

  const penPos = {
    x: wheelCenter.x + d * Math.cos(penAngle),
    y: wheelCenter.y + d * Math.sin(penAngle)
  };

  return {
    wheelCenter,
    wheelAngle,
    penPos,
    contactPoint,
    wheelRadius: r,
    ringRadius: R,
    selectedHole,
    pitch
  };
}

// Génération de la trajectoire complète en coordonnées locales centrées en (0, 0)
export function generateFullTrajectory({
  fixedGear,
  mobileGear,
  holeIndex = 0,
  hole = null,
  mode = 'hypo',
  phaseOffset = 0,
  unitScale = 14.0,
  samplesPerPetal = 80
}) {
  const stats = getPatternStats(fixedGear, mobileGear, mode);
  const totalSamples = Math.min(25000, Math.max(1200, stats.petals * samplesPerPetal));
  const points = new Array(totalSamples);
  const maxTheta = stats.maxTheta;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / (totalSamples - 1);
    const theta = t * maxTheta;
    const state = calculateGearState({
      fixedGear,
      mobileGear,
      holeIndex,
      hole,
      mode,
      theta,
      phaseOffset,
      unitScale
    });
    points[i] = {
      x: state.penPos.x,
      y: state.penPos.y,
      t,
      theta
    };
  }

  return {
    points,
    stats,
    maxTheta
  };
}
