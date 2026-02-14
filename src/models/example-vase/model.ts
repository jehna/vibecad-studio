import { draw } from "replicad";

export const defaultParams = {
  baseWidth: 25,
  height: 100,
};

export function main(params: typeof defaultParams) {
  const { baseWidth, height } = params;

  const profile = draw()
    .hLine(baseWidth)
    .smoothSplineTo([baseWidth * 1.5, height * 0.2], {
      endTangent: [0, 1],
    })
    .smoothSplineTo([baseWidth * 0.7, height * 0.7], {
      endTangent: [0, 1],
      startFactor: 3,
    })
    .smoothSplineTo([baseWidth, height], {
      endTangent: [0, 1],
      startFactor: 3,
    })
    .lineTo([0, height])
    .close();

  return profile
    .sketchOnPlane("XZ")
    .revolve()
    .shell(6, (f: any) => f.containsPoint([0, 0, height]))
    .fillet(1.7, (e: any) => e.inPlane("XY", height));
}
