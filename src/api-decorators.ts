import { LinkedList } from "./utility/linked-list";
import { RequestHandler } from "./request-handler";
import { APIMetaData, APIMethodCallback } from "./types";

const requestHandler = new RequestHandler();

let apisOfResource: APIMetaData[] = [], 
    resourceName = '', 
    api: APIMetaData = {
        pathName: '',
        method: 'GET',
        callback: (req, res) => {},
        middlewareList: new LinkedList()
    }

const apiNameParamRegex = /\/(:\w*)/;

function addAPIToResource() {
    let apiAlreadyPresent = apisOfResource.some(doc => doc.pathName.replace(apiNameParamRegex, '/param') == api.pathName.replace(apiNameParamRegex, '/param'));
    if(apiAlreadyPresent) {
        throw Error(`API ${api.pathName} already exists!Give another name!`);
    }
    apisOfResource.push(api);
    api = {
        pathName: '',
        method: 'GET',
        callback: (req, res) => {},
        middlewareList: new LinkedList()
    }
}

export function Controller(value: string) {
    resourceName = value;
    return function(constructor: Function, descriptor: any) {
        try {
            // add api to request handler and reset current api to generate new api.
            requestHandler.addAPIsToResource(resourceName, apisOfResource);
            resourceName = '';
            apisOfResource = [];
        } catch(error: any) {
            throw Error(error);
        }
    }
}

export function Get(value: string) {
    return function(target: any, descriptor: any) {
        try {
            api['method'] = 'GET';
            api['callback'] = target;
            api['pathName'] = `${value}`;
            addAPIToResource();
        } catch(error: any) {
            throw Error(error);
        }
    }
}

export function Post(value: string) {
    return function(target: any, descriptor: any) {
        try {
            api['method'] = 'POST';
            api['callback'] = target;
            api['pathName'] = `${value}`;
            addAPIToResource();
        } catch(error: any) {
            throw Error(error);
        }
    }
}

export function Middleware(middlewares: APIMethodCallback[]) {
    return function(target: any, descriptor: any) {
        api['callback'] = target;
        api['middlewareList'].appendNodes(middlewares);
    }
}

export function Delete(value: string) {
    return function(target: any, descriptor: any) {
        try {
            api['method'] = 'DELETE';
            api['callback'] = target;
            api['pathName'] = `${value}`;
            addAPIToResource();
        } catch(error: any) {
            throw Error(error);
        }
    }
}

export function Put(value: string) {
    return function(target: any, descriptor: any) {
        try {
            api['method'] = 'PUT';
            api['callback'] = target;
            api['pathName'] = `${value}`;
            addAPIToResource();
        } catch(error: any) {
            throw Error(error);
        }
    }
}