import { wrap } from "comlink";
import CadWorker from "../builder.worker?worker";
const api: any = wrap(new CadWorker());

export default api;
