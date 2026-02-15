import { wrap } from "comlink";
import OpenScadWorker from "../workers/openscad.worker?worker";

const api: any = wrap(new OpenScadWorker());
export default api;
