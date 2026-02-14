const { draw } = replicad;

const main = () => {
  const baseWidth = 50;
  const height = 100;

  const profile = draw()
    .hLine(baseWidth)
    .smoothSplineTo([baseWidth * 1.5, height * 0.2], {
      endTangent: [0, 1],
    })
    .smoothSplineTo([baseWidth * 0.7, height * 0.7], {
      endTangent: [0, 1],
      startFactor: 3,
    })
    .smoothSplineTo([baseWidth , height], {
      endTangent: [0, 1],
      startFactor: 3,
    })
    .lineTo([0, height])
    .close();

  return profile
    .sketchOnPlane("XZ")
    .revolve()
    .shell(5, (f) => f.containsPoint([0, 0, height]))
    .fillet(1.7, (e) => e.inPlane("XY", height));
};
