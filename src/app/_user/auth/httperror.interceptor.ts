//NUOVO INTERCEPTOR 10/08/23
//trovato qui https://stackoverflow.com/questions/70633922/http-error-interceptor-not-working-catcherror-not-working-with-angular-13
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
  } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable, throwError } from 'rxjs';
  import { catchError, tap } from 'rxjs/operators';
  
  @Injectable()
  export class HttpErrorInterceptor implements HttpInterceptor {
    intercept(
      request: HttpRequest<unknown>,
      next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
          // console.warn(
          //   'the interceptor has caught an error:',
          //   error
          // );

        //   if ([401, 403].indexOf(err.status) !== -1) {
        //     // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        //     this.uService.Logout();
        //     location.reload();
        // }

          return throwError(() => error);
        })
      );
    }
  }