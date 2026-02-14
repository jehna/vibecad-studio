declare const replicad: any;

const shapeOrSketch = (shape: any) => {
  if (!(shape instanceof replicad.Sketch)) return shape;
  if (shape.wire.isClosed) return shape.face();
  return shape.wire;
};

export class StudioHelper {
  _shapes: any[];
  _faceFinder: any;
  _edgeFinder: any;

  constructor() {
    this._shapes = [];
    this._faceFinder = null;
    this._edgeFinder = null;
  }

  debug(shape: any) {
    this._shapes.push(shape);
    return shape;
  }

  d(shape: any) {
    return this.debug(shape);
  }

  highlightFace(faceFinder: any) {
    this._faceFinder = faceFinder;
    return faceFinder;
  }

  hf(faceFinder: any) {
    return this.highlightFace(faceFinder);
  }

  highlightEdge(edgeFinder: any) {
    this._edgeFinder = edgeFinder;
    return edgeFinder;
  }

  he(edgeFinder: any) {
    return this.highlightEdge(edgeFinder);
  }

  apply(config: any[]) {
    const conf = config.concat(
      this._shapes.map((s, i) => ({
        shape: shapeOrSketch(s),
        name: `Debug ${i}`,
      }))
    );
    conf.forEach((shape) => {
      if (this._edgeFinder && !shape.highlightEdge) {
        shape.highlightEdge = this._edgeFinder;
      }
      if (this._faceFinder && !shape.highlightFace) {
        shape.highlightFace = this._faceFinder;
      }
    });
    return conf;
  }
}
