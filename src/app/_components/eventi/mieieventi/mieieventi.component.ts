//#region ----- IMPORTS ------------------------

import { Component, OnInit }                    from '@angular/core';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable, map }                           from 'rxjs';
import { MatDialog }                            from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//components
import { Utility }                              from '../../utilities/utility.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';


//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { EventiPersoneService }               from '../eventi-persone.service';

//models
import { User }                                 from 'src/app/_user/Users';
import { CAL_EventoPersone }                  from 'src/app/_models/CAL_Evento';

//#endregion

@Component({
  selector: 'app-miei-eventi',
  templateUrl: './mieieventi.component.html',
  styleUrls: ['../eventi.css']
})

export class MieiEventiComponent implements OnInit {

//#region ----- Variabili ----------------------

  //public userID: string;
  public currUser!:                             User;
  public obsMieiEventi$!:                      Observable<CAL_EventoPersone[]>
  public iscrizioneID:                          number = 43;
  public ckMostraEventiLette :                   boolean = false;


  matDataSource = new MatTableDataSource<CAL_EventoPersone>();
  displayedColumns: string[] = [
    "message",
    "actionsColumn",
    "delete"
  ];

//#endregion

//#region ----- Constructor --------------------

  constructor(private svcEventiPersone:                 EventiPersoneService,
              private _loadingService:                    LoadingService,
              private _snackBar:                          MatSnackBar, 
              public _dialog:                             MatDialog  ) {

    this.currUser = Utility.getCurrentUser();   
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(){
    this.loadData();
  }

  loadData(){
    let eventi$: Observable<CAL_EventoPersone[]>;

    if(this.ckMostraEventiLette){
      eventi$ = this.svcEventiPersone.listByPersona(this.currUser.personaID)
    }
    else  
    eventi$ = this.svcEventiPersone.listByPersona(this.currUser.personaID)
    .pipe(map(
      res=> res.filter((x) => x.ckLetto == false))
    );;
    

    eventi$.subscribe();
    this.obsMieiEventi$ =this._loadingService.showLoaderUntilCompleted(eventi$);
  }

//#endregion

//#region ----- Altri metodi -------------------

  setLetto(element: CAL_EventoPersone) {

    //element.ckLetto = !element.ckLetto;
    element.ckLetto = true;

    this.svcEventiPersone.put(element).subscribe({
      next: res=> this.loadData(),
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella chuisura della evento ', panelClass: ['red-snackbar']})
    });
  }

  setAccettato(element: CAL_EventoPersone) {
    element.ckAccettato = true;
    element.ckLetto = true; //una evento accettata si dà anche per letta (il flag ckLetto non compare quando si tratta di accettare o respingere)
    element.ckRespinto = false;
    this.svcEventiPersone.put(element).subscribe({
      next: res=> {},
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella chuisura della evento ', panelClass: ['red-snackbar']})
    });
  }

  setRespinto(element: CAL_EventoPersone) {
    if (element.personaID == this.currUser.personaID) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Non è possibile<br>respingere un proprio invito"}
      });
      this.loadData();
    } 
    else {
      element.ckAccettato = false;
      element.ckRespinto = true;
      this.svcEventiPersone.put(element).subscribe({
        next: res=> {},
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella chuisura della evento ', panelClass: ['red-snackbar']})
      });
    }
  }

//#endregion

  deleteMsg(id: number) {
    //TODO??
    //da decidere cosa fare
    // this.svcEventi.delete(id).subscribe(
    //   res=> this.loadData(),
    //   err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella cancellazione  del messaggio ', panelClass: ['red-snackbar']})
    // );
  }

  toggleAttivi(){
    this.ckMostraEventiLette = !this.ckMostraEventiLette;
    this.loadData();
  }
}
