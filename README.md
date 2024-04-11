# API Decorators
Custom implementation of api decorators similiar to overnightjs projects.

## Request Handler
The default export object is used to:

### setUpAppLevelMiddlewares
Set up application level middlewares

```requestHandler.setUpAppLevelMiddlewares([verifyUser])``` 
where _verifyUser_ is a middleware function(callback).

### addUrlNotFoundEvent
Set up call back for url not found method: 
```
requestHandler.addUrlNotFoundEvent((req: any, res: ServerResponse, errorMsg: string) => {
    console.log(errorMsg);
    sendResponseMiddleware(res, errorMsg, 401, false, null);
})
```

### handleRequest
Handle incoming http request:

```this.server.on('request', requestHandler.handleRequest)```

## Decorators:
### Controller: 
Used for creating api resource. 
```@Controller("books")```
### Methods used:
```@Get('books')``` etc.
- All following HTTP Methods are used 
    - _Get_(GET)
    - _Post_(POST)
    - _Put_(PUT)
    - _Delete_(DELETE)
### Middleware: 
Middlewares for http methods.
```@Middleware([func1(), func2()])```


