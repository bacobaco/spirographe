// Moteur cinématique et mathématique rigoureux pour le Spirographe Deluxe
// Garantit qu'un stylo ne peut JAMAIS traverser le plateau fixe ni sortir de la roue mobile.

// Pas physique universel d'une dent en pixels, strictement partagé par tous les modules
export const TOOTH_PITCH = 8.5;

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

// Calcul des statistiques géométriques
export function getPatternStats(fixedGear, mobileGear, mode = 'hypo') {
  const isRack = fixedGear.category === 'linear' || mode === 'rack';
  const N = isRack ? (fixedGear.outerTeeth || 80) : (mode === 'epi' ? (fixedGear.outerTeeth || 144) : (fixedGear.innerTeeth || 96));
  const n = mobileGear.teeth || 48;
  const g = gcd(N, n);

  if (isRack) {
    // Pour une frise / crémaillère : tracé complet fluide aller-retour
    const passes = Math.max(2, Math.round(n / g));
    const maxTheta = 2 * Math.PI * passes;
    return {
      fixedTeeth: N,
      wheelTeeth: n,
      gcd: g,
      petals: Math.round(N / n) || 2,
      rotationsAroundRing: passes,
      totalRevolutions: passes,
      totalTeethTraveled: N * passes,
      maxTheta,
      ratio: (N / n).toFixed(2),
      symmetryType: `Frise linéaire (${N} dents)`
    };
  }

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

// Rayon effectif d'une roue selon sa forme et l'angle polaire psi
export function getWheelLocalRadius(wheel, psi = 0, baseR) {
  if (!wheel || wheel.shape === 'round') {
    return baseR;
  }
  switch (wheel.shape) {
    case 'triangle':
      return baseR * (1 + 0.22 * Math.cos(3 * psi));
    case 'oval':
      return baseR * (1 + 0.26 * Math.cos(2 * psi));
    case 'bar':
      return baseR * (1 + 0.36 * Math.abs(Math.cos(psi)) - 0.20 * Math.abs(Math.sin(psi)));
    case 'cross':
      return baseR * (1 + 0.20 * Math.cos(4 * psi));
    case 'square':
      return baseR * (1 - 0.15 * Math.cos(4 * psi));
    case 'heart':
      return baseR * (1 - 0.22 * Math.sin(psi) + 0.10 * Math.cos(2 * psi));
    case 'star':
      return baseR * (1 + 0.25 * Math.cos(5 * psi));
    case 'pentagon':
      return baseR * (1 + 0.15 * Math.cos(5 * psi));
    case 'shuttle':
      return baseR * (1 + 0.32 * Math.cos(2 * psi));
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

// Calcul cinématique rigoureux avec contact physique tangentiel exact
export function calculateGearState({
  fixedGear,
  mobileGear,
  holeIndex = 0,
  hole = null,
  mode = 'hypo',
  theta = 0,
  phaseOffset = 0,
  unitScale = TOOTH_PITCH
}) {
  const isRack = fixedGear.category === 'linear' || mode === 'rack';
  const isEpi = mode === 'epi';
  const pitch = unitScale;

  // DIMENSIONS PHYSIQUES INVARIANTES DU PLATEAU FIXE
  const innerTeeth = fixedGear.innerTeeth || 96;
  const outerTeeth = fixedGear.outerTeeth || 144;
  const ringInnerRadius = (innerTeeth * pitch) / (2 * Math.PI);
  const ringOuterRadius = (outerTeeth * pitch) / (2 * Math.PI);

  // DIMENSION PHYSIQUE INVARIANTE DE LA ROUE MOBILE
  const n = mobileGear.teeth || 48;
  const r0 = (n * pitch) / (2 * Math.PI);

  // SÉLECTION DU TROU
  const holes = mobileGear.holes || [];
  const selectedHole = hole || holes[Math.min(holeIndex, holes.length - 1)] || {
    number: 1,
    rRatio: 0.8,
    angleOffset: 0
  };

  // Coordonnées du trou dans le repère local de la roue (INVARIANTES DANS LA PIÈCE EN PLASTIQUE)
  const holeAngleOffset = selectedHole.angleOffset || 0;
  const holeLocalRadius = getWheelLocalRadius(mobileGear, holeAngleOffset, r0);
  // Le trou est physiquement et strictement à l'intérieur de la pièce (rRatio <= 0.88)
  const d_hole = Math.min(holeLocalRadius * 0.88, holeLocalRadius * (selectedHole.rRatio || 0.8));

  // CAS 1 : CRÉMAILLÈRE ET RAILS LINÉAIRES (FRISES)
  if (isRack) {
    const rackLength = outerTeeth * pitch;
    const safeMargin = r0 * 0.8;
    const usableLength = Math.max(100, rackLength - 2 * safeMargin);

    const cycleLength = usableLength * 2;
    // Progression aller-retour continue le long de la crémaillère
    const s = ((theta * ringInnerRadius) % cycleLength + cycleLength) % cycleLength;
    let xOffset;
    if (s <= usableLength) {
      xOffset = s - usableLength / 2;
    } else {
      xOffset = (2 * usableLength - s) - usableLength / 2;
    }

    const isWave = fixedGear.shapeType === 'wave';
    const rackBaseY = 30; // Position verticale de référence du rail
    const rackH = 34;

    let contactY = rackBaseY;
    let slope = 0;
    if (isWave) {
      contactY = rackBaseY + 18 * Math.sin(xOffset / 35);
      slope = (18 / 35) * Math.cos(xOffset / 35);
    }
    const normLen = Math.hypot(1, slope);

    // Rotation de la roue sans glissement
    const wheelAngle = -(xOffset / r0) + phaseOffset;

    // Contact cinématique exact selon le côté
    let wheelCenter;
    let contactPoint;
    if (!mobileGear || mobileGear.shape === 'round') {
      const contactPsi = isEpi ? (-Math.PI / 2 - wheelAngle) : (Math.PI / 2 - wheelAngle);
      const rContact = r0;
      if (!isEpi) {
        wheelCenter = {
          x: xOffset + rContact * (slope / normLen),
          y: contactY - rContact * (1 / normLen)
        };
        contactPoint = { x: xOffset, y: contactY };
      } else {
        wheelCenter = {
          x: xOffset - rContact * (slope / normLen),
          y: (contactY + rackH) + rContact * (1 / normLen)
        };
        contactPoint = { x: xOffset, y: contactY + rackH };
      }
    } else {
      // Pour les roues à forme spéciale sur crémaillère : enveloppe globale sans pénétration
      const SAMPLES = 72;
      let extremeYRel = !isEpi ? -Infinity : Infinity;
      let contactBestPsi = 0;

      for (let i = 0; i < SAMPLES; i++) {
        const psi = (i * 2 * Math.PI) / SAMPLES;
        const rPsi = getWheelLocalRadius(mobileGear, psi, r0);
        const worldPsi = wheelAngle + psi;
        const yRel = rPsi * Math.sin(worldPsi);

        if (!isEpi) {
          if (yRel > extremeYRel) {
            extremeYRel = yRel;
            contactBestPsi = psi;
          }
        } else {
          if (yRel < extremeYRel) {
            extremeYRel = yRel;
            contactBestPsi = psi;
          }
        }
      }

      if (!isEpi) {
        wheelCenter = {
          x: xOffset,
          y: contactY - extremeYRel
        };
        contactPoint = { x: xOffset, y: contactY };
      } else {
        wheelCenter = {
          x: xOffset,
          y: (contactY + rackH) - extremeYRel
        };
        contactPoint = { x: xOffset, y: contactY + rackH };
      }
    }

    // Position du stylet
    const penGlobalAngle = wheelAngle + holeAngleOffset;
    let penPos = {
      x: wheelCenter.x + d_hole * Math.cos(penGlobalAngle),
      y: wheelCenter.y + d_hole * Math.sin(penGlobalAngle)
    };

    // GARANTIE PHYSIQUE : le stylo ne peut pas pénétrer dans le corps plastique du rail
    if (!isEpi) {
      const surfaceY = isWave ? (rackBaseY + 18 * Math.sin(penPos.x / 35)) : rackBaseY;
      if (penPos.y > surfaceY - 0.5) {
        penPos.y = surfaceY - 0.5;
      }
    } else {
      const bottomSurfaceY = (isWave ? (rackBaseY + 18 * Math.sin(penPos.x / 35)) : rackBaseY) + rackH;
      if (penPos.y < bottomSurfaceY + 0.5) {
        penPos.y = bottomSurfaceY + 0.5;
      }
    }

    return {
      wheelCenter,
      wheelAngle,
      penPos,
      contactPoint,
      wheelRadius: r0,
      ringInnerRadius,
      ringOuterRadius,
      ringRadius: ringInnerRadius,
      selectedHole,
      pitch,
      mode
    };
  }

  // CAS 2 : ANNEAUX ET PLATEAUX FERMÉS
  const activeTeeth = isEpi ? outerTeeth : innerTeeth;
  const baseContactR = isEpi ? ringOuterRadius : ringInnerRadius;
  const effectiveTheta = theta + phaseOffset;
  const contactR = getRingLocalRadius(fixedGear, effectiveTheta, baseContactR);

  // DIMENSIONS PHYSIQUES STRICTEMENT INVARIANTES :
  // Le rayon r0 d'une roue mobile plastique ne change JAMAIS entre l'intérieur (Hypo) et l'extérieur (Epi) !

  // Rotation sans glissement de la roue
  let wheelAngle;
  if (isEpi) {
    const rollingAngle = (activeTeeth / n) * theta;
    wheelAngle = effectiveTheta + rollingAngle;
  } else {
    const rollingAngle = (activeTeeth / n) * theta;
    wheelAngle = effectiveTheta - rollingAngle;
  }

  // POSITIONNEMENT DU CENTRE ET CONTACT PHYSIQUE EXACT (SANS AUCUNE PÉNÉTRATION)
  let wheelCenter;
  let contactPoint;

  if (fixedGear.category === 'circle' && (!mobileGear || mobileGear.shape === 'round')) {
    // Cas circulaire classique standard : calcul analytique instantané
    if (isEpi) {
      const centerDist = contactR + r0;
      wheelCenter = {
        x: centerDist * Math.cos(effectiveTheta),
        y: centerDist * Math.sin(effectiveTheta)
      };
      contactPoint = {
        x: contactR * Math.cos(effectiveTheta),
        y: contactR * Math.sin(effectiveTheta)
      };
    } else {
      const centerDist = Math.max(2, contactR - r0);
      wheelCenter = {
        x: centerDist * Math.cos(effectiveTheta),
        y: centerDist * Math.sin(effectiveTheta)
      };
      contactPoint = {
        x: contactR * Math.cos(effectiveTheta),
        y: contactR * Math.sin(effectiveTheta)
      };
    }
  } else {
    // Cas universel : plateaux ou roues à formes spéciales (triangle, cœur, carré, ovale, croix, étoile...)
    // Résolution rigoureuse par bissection d'enveloppe radiale garantissant ZERO superposition physique
    const edgeX = contactR * Math.cos(effectiveTheta);
    const edgeY = contactR * Math.sin(effectiveTheta);
    const SAMPLES = 72;

    function evalPenAtFactor(factor) {
      const cx = factor * edgeX;
      const cy = factor * edgeY;
      let maxPen = -Infinity;
      for (let s = 0; s < SAMPLES; s++) {
        const psi = (s * 2 * Math.PI) / SAMPLES;
        const rPsi = getWheelLocalRadius(mobileGear, psi, r0);
        const wAngle = wheelAngle + psi;
        const wx = cx + rPsi * Math.cos(wAngle);
        const wy = cy + rPsi * Math.sin(wAngle);
        const dist = Math.hypot(wx, wy);
        const alpha = Math.atan2(wy, wx);
        const rBound = getRingLocalRadius(fixedGear, alpha, baseContactR);
        const pen = !isEpi ? (dist - rBound) : (rBound - dist);
        if (pen > maxPen) maxPen = pen;
      }
      return maxPen;
    }

    if (!isEpi) {
      // Hypotrochoïde : factor va de 0.0 (origine) à 1.0 (bordure intérieure)
      let low = 0.0, high = 1.0;
      for (let iter = 0; iter < 20; iter++) {
        const mid = (low + high) / 2;
        if (evalPenAtFactor(mid) > -0.5) high = mid;
        else low = mid;
      }
      wheelCenter = {
        x: low * edgeX,
        y: low * edgeY
      };
    } else {
      // Épitrochoïde : factor va de 1.0 (bordure) à 3.5 (extérieur)
      let low = 1.0, high = 3.5;
      for (let iter = 0; iter < 20; iter++) {
        const mid = (low + high) / 2;
        if (evalPenAtFactor(mid) > -0.5) low = mid;
        else high = mid;
      }
      wheelCenter = {
        x: high * edgeX,
        y: high * edgeY
      };
    }

    contactPoint = {
      x: edgeX,
      y: edgeY
    };
  }

  // Position absolue de la pointe du stylet (fixée dans la roue en plastique)
  const penGlobalAngle = wheelAngle + holeAngleOffset;
  let penPos = {
    x: wheelCenter.x + d_hole * Math.cos(penGlobalAngle),
    y: wheelCenter.y + d_hole * Math.sin(penGlobalAngle)
  };

  // GARANTIE PHYSIQUE SUB-PIXEL : le tracé reste strictly dans la zone de dessin
  const penDist = Math.hypot(penPos.x, penPos.y);
  const penAngle = Math.atan2(penPos.y, penPos.x);

  if (!isEpi) {
    const ringBoundaryAtPen = getRingLocalRadius(fixedGear, penAngle, ringInnerRadius);
    const maxAllowedDist = ringBoundaryAtPen - 0.5;
    if (penDist > maxAllowedDist) {
      const scale = maxAllowedDist / (penDist || 1);
      penPos.x *= scale;
      penPos.y *= scale;
    }
  } else {
    const ringBoundaryAtPen = getRingLocalRadius(fixedGear, penAngle, ringOuterRadius);
    const minAllowedDist = ringBoundaryAtPen + 0.5;
    if (penDist < minAllowedDist) {
      const scale = minAllowedDist / (penDist || 1);
      penPos.x *= scale;
      penPos.y *= scale;
    }
  }

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

// Génération de la trajectoire échantillonnée complète
export function generateFullTrajectory({
  fixedGear,
  mobileGear,
  holeIndex = 0,
  hole = null,
  mode = 'hypo',
  phaseOffset = 0,
  unitScale = TOOTH_PITCH,
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
