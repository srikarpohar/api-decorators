import EventEmitter from "events";
import { ServerResponse } from "http";
import { APIMetaData, APIMethod, APIMethodCallback } from "./types";
import { LinkedList } from "./utility/linked-list";

export type APIOfResource = {
    resourceName: string;
    apis: APIMetaData[]
}

export class RequestHandler extends EventEmitter {
    apisOfResources: APIOfResource[] = [];
    appLevelMiddlewares?: LinkedList<any> = new LinkedList();
    
    constructor() {
        super();
    }

    get currentUrl(): string {
        return this.currentUrl;
    }

    set currentUrl(url: string) {
        this.currentUrl = url;
    }


    get currentMethod(): APIMethod {
        return this.currentMethod;
    }

    set currentMethod(method: APIMethod) {
        this.currentMethod = method;
    }

    setUpAppLevelMiddlewares<T>(...middlewares: T[]) {
        this.appLevelMiddlewares?.appendNodes(middlewares);
    }

    callAPILevelMiddlewares = (apiKey: string, req: any, res: ServerResponse) => {
        let currMiddleWare = this.appLevelMiddlewares?.head;

        const callNextMiddleware = () => {
            if(currMiddleWare) {
                let prevMiddleware = currMiddleWare;
                currMiddleWare = currMiddleWare.next;
                prevMiddleware.data(req, res, callNextMiddleware)
            } else {
                this.callAPI(apiKey, req, res);
            }
        }

        callNextMiddleware();
    }

    callRequestLevelMiddlewares(req: any, res: ServerResponse, middleWareList: LinkedList<Function>, apiMethod: APIMethodCallback) {
        let currMiddleWare = middleWareList.head;

        const callNextMiddleware = () => {
            if(currMiddleWare) {
                let prevMiddleware = currMiddleWare;
                currMiddleWare = currMiddleWare.next;
                prevMiddleware.data(req, res, callNextMiddleware)
            } else {
                apiMethod(req, res);
            }
        }

        callNextMiddleware();
    }

    addAPIsToResource(resourceName: string, apis: APIMetaData[]) {
        let isResourceNamePresent = this.apisOfResources.some(doc => doc.resourceName == resourceName);
        if(isResourceNamePresent) {
            throw Error(`Resource ${resourceName} already exists. Give another name for resource!`);
        }

        this.apisOfResources = [
            ...this.apisOfResources, 
            {
                resourceName,
                apis
            }
        ]
        for(let api of apis) {
            let apiKey = `/${resourceName}${api.pathName == '' ? '' : '/'}${api.pathName}@${api.method}`;
            this.on(apiKey, (req: any, res: ServerResponse) => {
                this.callRequestLevelMiddlewares(req, res, api.middlewareList, api.callback)
            })
        }
    }

    addUrlNotFoundEvent(callback: (req, res, errorMsg) => void) {
        this.on('url-not-found', callback);
    }

    getResourceFromUrl(url: string) {
        let checkedUrl = '';
        for(let part of url.split("/")) {
            checkedUrl = `${checkedUrl}${checkedUrl ? '/' : ''}${part}`;
            let resource = this.apisOfResources.find(doc => doc.resourceName == checkedUrl);
            if(resource) {
                return resource;
            }
        }

        return null;
    }

    parseQueryParams(params: string) {
        const regex = new RegExp(/(\w*=\w*)/, 'gm');
        let m, result = {};

        while ((m = regex.exec(params)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            
            // The result can be accessed through the `m`-variable.
            m.forEach((match, _) => {
                const [key, value] = match.split("=");
                result = {
                    ...result,
                    [key]: value
                }
            });
        }

        return result;
    }

    parseParams(url: string[], apiUrl: string) {
        const apiUrlSplit = apiUrl.split("/");
        let params: any = {};
        for(let ind = 0;ind < apiUrlSplit.length;ind++) {
            if(apiUrlSplit[ind] && apiUrlSplit[ind][0] == ':') {
                params[apiUrlSplit[ind].slice(1)] = url[ind];
            }
        }

        return params;
    }

    parseUrl(url: string, method: string) {
        let [apiUrl, queryParams] = url.split("?");
        apiUrl = apiUrl.replace("/", "")
        const resource = this.getResourceFromUrl(apiUrl);
        if(!resource)
            return {
                apiKey: null,
                queryParams: {},
                params: {},
                errorMsg: 'Resource is not found!'
            };

        let urlAfterParsingResource = apiUrl.replace(resource.resourceName, "");
        urlAfterParsingResource = urlAfterParsingResource.replace("/", "");
        const urlSplit = urlAfterParsingResource.split("/");
        let apisOfResource = [...resource.apis].map(doc => {
            return {
                ...doc,
                parsedPathName: doc.pathName
            }
        });

        for(let part of urlSplit) {
            apisOfResource = apisOfResource.filter(doc => doc.method == method && 
                (doc.parsedPathName == part || (doc.parsedPathName.startsWith(":") && part != '')));

            if(!apisOfResource.length) {
                return {
                    apiKey: null,
                    queryParams: {},
                    params: {},
                    errorMsg: 'API is not found!'
                };
            }
            apisOfResource = apisOfResource.map(doc => {
                let {parsedPathName} = doc;
                parsedPathName = parsedPathName.replace(/.*\/?/, '')
                return {
                    ...doc,
                    parsedPathName
                }
            })
        }

        if(apisOfResource.length > 1) {
            return {
                apiKey: null,
                queryParams: {},
                params: {},
                errorMsg: `Multiple APIs found with same url ${url}`
            };
        } else if(!apisOfResource.length) {
            return {
                apiKey: null,
                queryParams: {},
                params: {},
                errorMsg: 'API is not found!'
            };
        } else {
            let [api] = apisOfResource, apiKey = `/${resource.resourceName}${api.pathName == '' ? '' : '/'}${api.pathName}@${api.method}`;
            return {
                apiKey,
                queryParams: this.parseQueryParams(queryParams),
                params: this.parseParams(urlSplit, api.pathName)
            }
        }
    }

    callAPI(apiKey: string, ...args: any[]) {
        const hasListeners = this.emit(apiKey, ...args);
        if(!hasListeners) {
            this.emit('url-not-found', ...args);
        }
    }
}