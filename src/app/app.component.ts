//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';
import { Router }                               from '@angular/router';

//services
import { UserService }                          from './_user/user.service';
import { EventEmitterService }                  from './_services/event-emitter.service';
import { Utility }                              from  './_components/utilities/utility.component';
// import { AuthInterceptor }                            from './_user/auth/auth.interceptor';

//models
import { User }                                 from './_user/Users';
import { MatExpansionPanel }                    from '@angular/material/expansion';
import { PER_Persona }                          from './_models/PER_Persone';

//#endregion
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})

export class AppComponent implements OnInit {

//#region ----- Variabili ----------------------
  public isLoggedIn?:                           boolean = false;
  public currUser!:                             User;
  public currPersona!:                          PER_Persona;

  public userFullName:                          string = "";
  public imgAccount =                           "";
  stringJson:                                   any;
  stringObject:                                 any;

  isPinned =                                    false;
  isExpanded =                                  false;

  public mode = new UntypedFormControl('over');
  title = 'Stoody';

//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('expansionSegreteria') public expansionSegreteria!: MatExpansionPanel;
  @ViewChild('expansionCoordinatore') public expansionCoordinatore!: MatExpansionPanel;
  @ViewChild('expansionPagamenti') public expansionPagamenti!: MatExpansionPanel;
  @ViewChild('expansionDocenti') public expansionDocenti!: MatExpansionPanel;

//#endregion
  constructor(private svcUser:                  UserService,
              private router:                   Router,
              private eventEmitterService:      EventEmitterService  ) {
   
  }

  ngOnInit () {

    //Carico i dati e l'immagine dell'utente tramite un eventEmitter
    if (this.eventEmitterService.userSubscribeAttiva==undefined) {    
      //in questo modo non solo faccio la subscribe al RefreshFoto ma imposto la subscription a un valore diverso da undefined
      this.eventEmitterService.userSubscribeAttiva = this.eventEmitterService.invokeUserEmit.subscribe(
        user => {
          this.currUser = user;
          //console.log ("app.component - ngOnInit currUser", this.currUser);
          //questo è un "captatore" dell'Emit, quindi può funzionare sia in fase di Login che di Logout
          if (user) {
            this.userFullName = this.currUser.fullname;
            this.isLoggedIn = true;
          } 
          else {
            this.isLoggedIn = false; //Ma serve? se emetto (vedi funzione logout sì) altrimenti no
          }
        }
      );    
    } 

    this.refreshUserData();

    //Carico i dati e l'immagine dell'utente tramite un eventEmitter
    if (this.eventEmitterService.refreshFotoSubscribeAttiva==undefined) {    
      //in questo modo non solo faccio la subscribe al RefreshFoto ma imposto la subscription a un valore diverso da undefined
      //inoltre predispongo per il refresh
      this.eventEmitterService.refreshFotoSubscribeAttiva = this.eventEmitterService.invokeAppComponentRefreshFoto.subscribe(
        () => this.refreshUserData()  //così facendo in caso di F5 viene lanciato refreshUserData
      );    
    } 
  }

  refreshUserData () {

    /*
    //console.log("app.component - refreshUserData");
    if(this.currUser) {
      //QUI L'UTENTE E' ENTRATO REGOLARMENTE
      //console.log("app.component - refreshUserData - currUser", this.currUser);
    } else {
      //se in Utility c'è lo user significa che è stato premuto F5
      this.currUser = Utility.getCurrentUser();
      //console.log("app.component - refreshUserData - ricarico currUser", this.currUser);
    }
    */
    if(!this.currUser) 
      this.currUser = Utility.getCurrentUser();

    if (this.currUser) {
      this.isLoggedIn = true;

      this.userFullName = this.currUser.fullname;
      this.svcUser.getFotoByUserID(this.currUser.userID).subscribe(
        res => this.imgAccount = res.foto
      );
    }

  }
  
  logOut() {
    //console.log("app.component - prima di Logout");
    this.svcUser.Logout(); //azzero tutto, compreso il BS dello User
    this.isLoggedIn = false;
    this.router.navigate(['/user/login']);
  }

  
  expandSegreteria() {
    setTimeout(() => this.expansionSegreteria.expanded = true, 10);
  }

  expandCoordinatore() {
    setTimeout(() => this.expansionCoordinatore.expanded = true, 10);
  }

  expandDocenti() {
    setTimeout(() => this.expansionDocenti.expanded = true, 10);
  }
  
  expandPagamenti() {
    setTimeout(() => this.expansionPagamenti.expanded = true, 10);
  }



  clickMenuItem() {
    if (!this.isPinned) {
      this.isExpanded = false
      // this.leftSidenav.mode = "side";
    }
  }

  clickHamburger() {
    if (!this.isPinned) 
      this.isExpanded = !this.isExpanded
    
    // if(this.isExpanded) 
    //   this.leftSidenav.mode = "over";
    // else 
    //   this.leftSidenav.mode = "side";
  }

  clickPin() {
    this.isPinned = true
    //this.leftSidenav.mode = "side";
  }

  clikUnPin() {
    this.isPinned = false; 
    this.isExpanded = false;
    //this.leftSidenav.mode = "side";
  }
}
