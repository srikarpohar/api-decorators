import { ServerResponse } from "http";
import { LinkedList } from "./utility/linked-list";

export type APIMethod = 'GET' | 'POST' | 'DELETE' | 'PUT';
export type APIMethodCallback = (req: any, res: ServerResponse) => void;
export type APIMetaData = {
    pathName: string;
    method: APIMethod;
    callback: APIMethodCallback;
    middlewareList: LinkedList<APIMethodCallback>
}