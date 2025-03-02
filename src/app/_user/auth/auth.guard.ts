import { Injectable }                           from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import {MatSnackBar}                            from '@angular/material/snack-bar';
import { SnackbarComponent }                    from 'src/app/_components/utilities/snackbar/snackbar.component';

import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard {



   private lstroles: string[] = [];
  constructor( private router:        Router, 
               private svcUser:      UserService,
               private _snackBar:     MatSnackBar ) {
  }

  //AUTHGUARD SERVE AD AUTORIZZARE O MENO L'ACCESSO ALLE PAGINE IN BASE A QUALCHE CONDIZIONE, AD ESEMPIO NEL NS CASO AL RUOLO

  async canActivate( route:  ActivatedRouteSnapshot, state: RouterStateSnapshot):  Promise<boolean>  {

    const currentUser = this.svcUser.currentUser;

    //console.log("Auth.guard - canActivate - currentUser", currentUser);
    //console.log("Auth.guard - canActivate - route.data [da app-routing]- ", route.data);


    if (currentUser.persona && currentUser.persona._LstRoles) this.lstroles = currentUser.persona!._LstRoles!;

    if (currentUser) {
      //console.log("Auth.guard - canActivate - this.lstroles ", this.lstroles);
      if (route.data && route.data['roles'] && !route.data['roles'].some((role: string) => this.lstroles.includes(role))) {
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Utente non autorizzato', panelClass: ['red-snackbar']
          });
          this.router.navigate(['/home']);
          //console.log("return false");
          return false;
      }
      //console.log("return true");
      return true;
      
    }


    console.log("auth.guard - Not logged: redirect to Login "); //di qui non dovrebbe mai passare
    this.router.navigate(['user/login']);  
    return false;


  }



  
}

