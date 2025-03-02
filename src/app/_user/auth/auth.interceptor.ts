import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators'; 
import { Router }                               from '@angular/router';
import { UserService } from '../user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {


      public isLoggedInAuth = false;

    //QUESTO COMPONENT SERVE PERCHE' TUTTE LE CHIAMATE AI WEBSERVICE VENGANO "CORREDATE" DEL TOKEN
    //INFATTI COME SI PUO' VEDERE  headers: req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'))
    //VIENE POI USATA DIRETTAMENTE IN APP.MODULE IN QUESTO MODO:
    //    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    //E QUESTO E' SUFFICIENTE 
    constructor(private router: Router,
                private svcUser: UserService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        //console.log("test auth", req);
        if(localStorage.getItem('token') != null ){
            //console.log("C'E' il token");

            const clonedReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'))
                    //.set('Access-Control-Allow-Origin', '*')
                    //.set('Access-Control-Allow-Credentials', 'true')
            });
           
            return next.handle(clonedReq).pipe(
                tap({
                        next: res=> {},
                        error: err=> {
                            if(err.status == 401){
                                localStorage.removeItem('token');
                                // console.log("auth.interceptor -manca il token: redirect to Login "); //di qui non dovrebbe mai passare
                                       this.svcUser.Logout(); //se c'è il token ma per esempio è quello vecchio bisogna essere cacciati fuori         
                                this.router.navigateByUrl('/user/login');
                            }
                        }
                    }
                )
            )
        } else {
            //console.log("MANCA il token");
            return next.handle(req.clone());
        }
    }

      setLoggedInAuth(status: boolean) {
    this.isLoggedInAuth = status;
    }

    getIsLoggedInAuth() {
        return this.isLoggedInAuth;
    }
}