import { ServerResponse } from 'http';
import { RequestHandler } from './request-handler';

class RequestHandlerWrapper {
    requestHandler: RequestHandler;

    constructor() {
        this.requestHandler = new RequestHandler();
    }

    setUpAppLevelMiddlewares<T>(middlewares: T[]) {
        this.requestHandler.setUpAppLevelMiddlewares(...middlewares);
    }

    addUrlNotFoundEvent(callback: (req: any, res: ServerResponse, errorMsg: string) => void) {
        this.requestHandler.addUrlNotFoundEvent(callback)
    }

    handleRequest(req: any, res: ServerResponse) {
        const {apiKey, queryParams, params, errorMsg} = this.requestHandler.parseUrl(req.url, req.method);
        if(!apiKey) {
            this.requestHandler.emit('url-not-found', req, res, errorMsg);
            return;
        }

        req.query = queryParams;
        req.params = params;
        this.requestHandler.currentUrl = req.url;
        this.requestHandler.currentMethod = req.method;

        this.requestHandler.callAPILevelMiddlewares(apiKey, req, res);
    }
}

export * from './api-decorators';
export default new RequestHandlerWrapper();