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

    callAPILevelMiddlewares(apiKey: string, req: any, res: ServerResponse) {
        this.requestHandler.callAPILevelMiddlewares(apiKey, req, res);
    }

    addUrlNotFoundEvent(callback: (req: any, res: ServerResponse) => void) {
        this.requestHandler.addUrlNotFoundEvent(callback)
    }

    parseUrl(url: string, method: string) {
        this.requestHandler.parseUrl(url, method);
    }
}

export * from './api-decorators';
export default new RequestHandlerWrapper();