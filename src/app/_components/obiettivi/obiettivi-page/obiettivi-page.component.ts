//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatDrawer }                            from '@angular/material/sidenav';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { firstValueFrom, tap }                  from 'rxjs';

//components
import { ObiettiviDuplicaComponent }            from '../obiettivi-duplica/obiettivi-duplica.component';
import { ObiettiviFilterComponent }             from '../obiettivi-filter/obiettivi-filter.component';
import { ObiettiviListComponent }               from '../obiettivi-list/obiettivi-list.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { ObiettiviService }                     from '../obiettivi.service';

//models


//#endregion
@Component({
  selector: 'app-obiettivi-page',
  templateUrl: './obiettivi-page.component.html',
  styleUrls: ['../obiettivi.css']
})
export class ObiettiviPageComponent implements OnInit {

//#region ----- ViewChild Input Output ---------

  @ViewChild(ObiettiviListComponent) obiettiviList!: ObiettiviListComponent; 
  @ViewChild(ObiettiviFilterComponent) obiettiviFilterComponent!: ObiettiviFilterComponent; 

  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion
  
//#region ----- Constructor --------------------

  constructor(public _dialog:                   MatDialog, 
              private svcObiettivi:             ObiettiviService,
              private _snackBar:                MatSnackBar 
  ) { }

//#endregion

  ngOnInit(): void {}

//#region ----- Reset vari -------
  resetFiltri() {
    this.obiettiviFilterComponent.resetAllInputs();
  }
//#endregion

//#region ----- Altri metodi -------

  addRecord() {
    this.obiettiviList.addRecord()
  }

  openDrawer() {
    this.drawerFiltriAvanzati.open();
  }

  openDuplica() {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '400px',
      height: '430px',
      data: 0
    };
    const dialogRef = this._dialog.open(ObiettiviDuplicaComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( () => this.obiettiviList.loadData());
  }

  deleteSelection() {
    const objIdToRemove = this.obiettiviList.getChecked();

    const selections = objIdToRemove.length;
    if (selections <= 0) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Selezionare almeno un obiettivo da cancellare"}
      });
    }
    else{
      const dialogRef = this._dialog.open(DialogYesNoComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Si stanno cancellando "+selections+" obiettivi. Continuare?"}
      });
      dialogRef.afterClosed().subscribe(
        async result => {
          if(!result) return; 
          else {
            //per ragioni di sincronia (aggiornamento obiettiviList dopo il loop) usiamo la Promise()

            this.deleteObiettiviSequentially(objIdToRemove)
            .then(() => {
              //la then dovrebbe garantire che tutte le eliminazioni sono state completate con successo
              this.obiettiviList.resetSelections();
              this.obiettiviList.loadData();
            });
          }
      })
    }
  }

  async deleteObiettiviSequentially(objIdToRemove: any): Promise<any> {
    for (const element of objIdToRemove) {
      try {
        await firstValueFrom(this.svcObiettivi.delete(element.id).pipe(tap(()=>console.log("sto cancellando"))));
      } catch (err) {
        this._snackBar.openFromComponent(SnackbarComponent, {data: "Errore nella cancellazione", panelClass: ['red-snackbar']})
      }
    }
  }

//#endregion

}
