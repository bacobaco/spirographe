// Moteur cinématique et mathématique pour le Spirographe Deluxe (Engrenages physiques invariants)

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
      return baseR * (1 + 0.22 * Math.cos(3 * psi));
    case 'oval':
      return baseR * (1 + 0.28 * Math.cos(2 * psi));
    case 'bar':
      return baseR * (1 + 0.38 * Math.abs(Math.cos(psi)) - 0.22 * Math.abs(Math.sin(psi)));
    case 'cross':
      return baseR * (1 + 0.22 * Math.cos(4 * psi));
    case 'square':
      return baseR * (1 - 0.16 * Math.cos(4 * psi));
    case 'heart':
      return baseR * (1 - 0.24 * Math.sin(psi) + 0.12 * Math.cos(2 * psi));
    case 'star':
      return baseR * (1 + 0.26 * Math.cos(5 * psi));
    case 'pentagon':
      return baseR * (1 + 0.16 * Math.cos(5 * psi));
    case 'shuttle':
      return baseR * (1 + 0.35 * Math.cos(2 * psi));
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
      return baseR * (1 + 0.20 * Math.cos(2 * theta));
    case 'ring-triangle-120':
      return baseR * (1 + 0.18 * Math.cos(3 * theta));
    case 'ring-square-128':
      return baseR * (1 - 0.14 * Math.cos(4 * theta));
    case 'ring-heart-120':
      return baseR * (1 - 0.22 * Math.sin(theta) + 0.10 * Math.cos(2 * theta));
    case 'ring-clover-120':
      return baseR * (1 + 0.14 * Math.cos(4 * theta));
    default:
      return baseR;
  }
}

// Calcul cinématique rigoureux où le plateau physique et la roue ont une taille INVARIANTE
export function calculateGearState({
  fixedGear,
  mobileGear,
  holeIndex = 0,
  hole = null,
  mode = 'hypo',
  theta = 0,
  phaseOffset = 0,
  unitScale = 8.5 // Pas physique d'une dent (constant et invariant)
}) {
  const isRack = fixedGear.category === 'linear' || mode === 'rack';
  const isEpi = mode === 'epi';
  const pitch = unitScale;

  // DIMENSIONS PHYSIQUES INVARIANTES DE L'ANNEAU :
  // Le rayon intérieur correspond TOUJOURS à innerTeeth, et l'extérieur à outerTeeth !
  const innerTeeth = fixedGear.innerTeeth || 96;
  const outerTeeth = fixedGear.outerTeeth || 144;
  const ringInnerRadius = (innerTeeth * pitch) / (2 * Math.PI);
  const ringOuterRadius = (outerTeeth * pitch) / (2 * Math.PI);

  // LA ROUE MOBILE NE CHANGE JAMAIS DE TAILLE :
  const n = mobileGear.teeth || 48;
  const r0 = (n * pitch) / (2 * Math.PI);

  const holes = mobileGear.holes || [];
  const selectedHole = hole || holes[Math.min(holeIndex, holes.length - 1)] || {
    number: 1,
    rRatio: 0.8,
    angleOffset: 0
  };

  // CAS DU RAIL OU DE LA CRÉMAILLÈRE
  if (isRack) {
    const rackLength = outerTeeth * pitch;
    const s = (theta * ringInnerRadius) % (rackLength * 2);
    let xOffset;
    if (s <= rackLength) {
      xOffset = s - rackLength / 2;
    } else {
      xOffset = (2 * rackLength - s) - rackLength / 2;
    }

    // Crémaillère ondulée ou droite
    const isWave = fixedGear.shapeType === 'wave';
    const waveY = isWave ? 18 * Math.sin(xOffset / 35) : 0;

    const wheelCenter = {
      x: xOffset,
      y: waveY - (isEpi ? -r0 : r0)
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
      contactPoint: { x: wheelCenter.x, y: waveY },
      wheelRadius: r0,
      ringInnerRadius,
      ringOuterRadius,
      ringRadius: isEpi ? ringOuterRadius : ringInnerRadius,
      selectedHole,
      pitch,
      mode
    };
  }

  // CAS DES ANNEAUX ET PLATEAUX FERMÉS
  // En mode Intérieur (hypo) : la piste de contact est la paroi intérieure ringInnerRadius
  // En mode Extérieur (epi) : la piste de contact est la paroi extérieure ringOuterRadius
  const activeTeeth = isEpi ? outerTeeth : innerTeeth;
  const baseContactR = isEpi ? ringOuterRadius : ringInnerRadius;
  const contactR = getRingLocalRadius(fixedGear, theta, baseContactR);

  let wheelCenter;
  let wheelAngle;
  let contactPoint;

  if (isEpi) {
    // ÉPITROCHOÏDE : la roue roule sur l'EXTÉRIEUR de l'anneau (sur ringOuterRadius)
    const distCenter = contactR + r0;
    const effectiveTheta = theta + phaseOffset;

    wheelCenter = {
      x: distCenter * Math.cos(effectiveTheta),
      y: distCenter * Math.sin(effectiveTheta)
    };

    contactPoint = {
      x: contactR * Math.cos(effectiveTheta),
      y: contactR * Math.sin(effectiveTheta)
    };

    // Rotation propre sans glissement sur les dents extérieures
    const rollingAngle = (activeTeeth / n) * theta;
    wheelAngle = effectiveTheta + rollingAngle;
  } else {
    // HYPOTROCHOÏDE : la roue roule à l'INTÉRIEUR de l'anneau (sur ringInnerRadius)
    const distCenter = Math.max(5, contactR - r0);
    const effectiveTheta = theta + phaseOffset;

    wheelCenter = {
      x: distCenter * Math.cos(effectiveTheta),
      y: distCenter * Math.sin(effectiveTheta)
    };

    contactPoint = {
      x: contactR * Math.cos(effectiveTheta),
      y: contactR * Math.sin(effectiveTheta)
    };

    // Rotation propre sans glissement sur les dents intérieures
    const rollingAngle = (activeTeeth / n) * theta;
    wheelAngle = effectiveTheta - rollingAngle;
  }

  const localR = getWheelLocalRadius(mobileGear, wheelAngle, r0);
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
    wheelRadius: r0,
    ringInnerRadius,
    ringOuterRadius,
    ringRadius: contactR,
    selectedHole,
    pitch,
    mode
  };
}

// Génération de la trajectoire complète échantillonnée
export function generateFullTrajectory({
  fixedGear,
  mobileGear,
  holeIndex = 0,
  hole = null,
  mode = 'hypo',
  phaseOffset = 0,
  unitScale = 8.5,
  samplesPerPetal = 90
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
