import { draw, drawCircle, loft, type Sketches, type Wire, type Solid, type Compound } from "replicad";

export const defaultParams = {
  neckLength: 170,
  neckThickness: 6.5,
  baseWidth: 45,
  wallMountThickness: 8,
  rodRadius: 12,
  tipRadius: 14,
  transitionHeight: 10,
  transitionThickness: 8,
  hookHeight: 16,
  uCurveHeight: 10,
  holeRadius: 2.6,
};

function uSketchAtZ(z: number, width: number) {
  const halfWidth = width / 2;
  return draw([-width, 0])
    .vLine(halfWidth)
    .hBulgeArc(width, -1)
    .vLine(-halfWidth)
    .close()
    .translate([halfWidth, 0])
    .sketchOnPlane("XY", z) as Sketches;
}

export function main(params: typeof defaultParams) {
  const {
    neckLength, neckThickness, baseWidth,
    wallMountThickness, rodRadius, tipRadius,
    transitionHeight, transitionThickness,
    hookHeight, uCurveHeight, holeRadius,
  } = params;

  const rodLength = neckLength;
  const hookThickness = neckThickness;
  const wallMountRadius = baseWidth;

  const wallMount = uSketchAtZ(0, wallMountRadius).extrude(
    wallMountThickness
  ) as Solid;

  const rodTopZ = wallMountThickness + rodLength;
  const transitionTopPos = rodTopZ + transitionHeight;
  const transitionEnd = transitionTopPos + transitionThickness;

  const rod = loft([
    uSketchAtZ(wallMountThickness, rodRadius).wires() as Wire,
    uSketchAtZ(rodTopZ, rodRadius).wires() as Wire,
    uSketchAtZ(transitionTopPos, tipRadius).wires() as Wire,
    uSketchAtZ(transitionEnd, tipRadius).wires() as Wire,
  ]) as Solid;

  const keepVolume = uSketchAtZ(transitionEnd, tipRadius).extrude(
    hookHeight + uCurveHeight
  ) as Solid;

  const holeCenterZ = transitionEnd + uCurveHeight;

  const hole = drawCircle(holeRadius)
    .sketchOnPlane("YZ", [hookThickness / 2, tipRadius / 2])
    .extrude(-hookThickness) as Solid;

  const uProfile = (
    draw([0, transitionEnd])
      .vLine(uCurveHeight)
      .hBulgeArc(tipRadius, -1)
      .vLine(-uCurveHeight)
      .close()
      .sketchOnPlane("YZ")
      .extrude(hookThickness)
      .translate([-hookThickness / 2, 0, 0]) as Solid
  ).cut(hole.translate([0, 0, holeCenterZ]));

  const fullKeepVolume = wallMount.clone().fuse(rod.clone()).fuse(keepVolume);

  const rounded = wallMount
    .fuse(rod)
    .fuse(uProfile)
    .intersect(fullKeepVolume) as Compound;

  return rounded;
}
