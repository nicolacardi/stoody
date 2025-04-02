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
import { ScadenzePersoneService }               from '../scadenze-persone.service';

//models
import { User }                                 from 'src/app/_user/Users';
import { CAL_ScadenzaPersone }                  from 'src/app/_models/CAL_Scadenza';

//#endregion

@Component({
  selector: 'app-mie-scadenze',
  templateUrl: './miescadenze.component.html',
  styleUrls: ['../scadenze.css']
})

export class MieScadenzeComponent implements OnInit {

//#region ----- Variabili ----------------------

  //public userID: string;
  public currUser!:                             User;
  public obsMieScadenze$!:                      Observable<CAL_ScadenzaPersone[]>
  public iscrizioneID:                          number = 43;
  public ckMostraScadenzeLette :                   boolean = false;


  matDataSource = new MatTableDataSource<CAL_ScadenzaPersone>();
  displayedColumns: string[] = [
    "message",
    "actionsColumn",
    "delete"
  ];

//#endregion

//#region ----- Constructor --------------------

  constructor(private svcScadenzePersone:                 ScadenzePersoneService,
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
    let scadenze$: Observable<CAL_ScadenzaPersone[]>;

    if(this.ckMostraScadenzeLette){
      scadenze$ = this.svcScadenzePersone.listByPersona(this.currUser.personaID)
    }
    else  
    scadenze$ = this.svcScadenzePersone.listByPersona(this.currUser.personaID)
    .pipe(map(
      res=> res.filter((x) => x.ckLetto == false))
    );;
    

    scadenze$.subscribe();
    this.obsMieScadenze$ =this._loadingService.showLoaderUntilCompleted(scadenze$);
  }

//#endregion

//#region ----- Altri metodi -------------------

  setLetto(element: CAL_ScadenzaPersone) {

    //element.ckLetto = !element.ckLetto;
    element.ckLetto = true;

    this.svcScadenzePersone.put(element).subscribe({
      next: res=> this.loadData(),
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella chuisura della scadenza ', panelClass: ['red-snackbar']})
    });
  }

  setAccettato(element: CAL_ScadenzaPersone) {
    element.ckAccettato = true;
    element.ckLetto = true; //una scadenza accettata si dà anche per letta (il flag ckLetto non compare quando si tratta di accettare o respingere)
    element.ckRespinto = false;
    this.svcScadenzePersone.put(element).subscribe({
      next: res=> {},
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella chuisura della scadenza ', panelClass: ['red-snackbar']})
    });
  }

  setRespinto(element: CAL_ScadenzaPersone) {
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
      this.svcScadenzePersone.put(element).subscribe({
        next: res=> {},
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella chuisura della scadenza ', panelClass: ['red-snackbar']})
      });
    }
  }

//#endregion

  deleteMsg(id: number) {
    //TODO??
    //da decidere cosa fare
    // this.svcScadenze.delete(id).subscribe(
    //   res=> this.loadData(),
    //   err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella cancellazione  del messaggio ', panelClass: ['red-snackbar']})
    // );
  }

  toggleAttivi(){
    this.ckMostraScadenzeLette = !this.ckMostraScadenzeLette;
    this.loadData();
  }
}
