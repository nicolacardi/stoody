//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { firstValueFrom, tap }                       from 'rxjs';

//components
import { ClassiAnniMaterieDuplicaComponent }    from '../classi-anni-materie-duplica/classi-anni-materie-duplica.component';
import { ClassiAnniMaterieListComponent }       from '../classi-anni-materie-list/classi-anni-materie-list.component';
import { DialogOkComponent }                    from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent }                 from 'src/app/_components/utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from 'src/app/_components/utilities/snackbar/snackbar.component';

//services
import { ClasseAnnoMateriaService }             from '../classe-anno-materia.service';
import { MatSnackBar }                          from '@angular/material/snack-bar';


//#endregion
@Component({
  selector: 'app-classi-anni-materie-page',
  templateUrl: './classi-anni-materie-page.component.html',
  styleUrls: ['../classi-anni-materie.css']
})

export class ClassiAnniMateriePageComponent implements OnInit {

//#region ----- ViewChild Input Output ---------  

  @ViewChild(ClassiAnniMaterieListComponent) classiAnniMaterieList!: ClassiAnniMaterieListComponent;

//#endregion

  constructor(public _dialog:                   MatDialog,
              private svcClassiAnniMaterie:     ClasseAnnoMateriaService,
              private _snackBar:                MatSnackBar 
              ) { }

  ngOnInit(){
  }

  addRecord() {
    this.classiAnniMaterieList.addRecord()
  }

  openDuplica() {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '630px',
      data: 0
    };
    const dialogRef = this._dialog.open(ClassiAnniMaterieDuplicaComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( 
        () => this.classiAnniMaterieList.loadData()
    );
  }

  deleteSelection() {
    const objIdToRemove = this.classiAnniMaterieList.getChecked();

    const selections = objIdToRemove.length;
    console.log ("classi-anni-materie - deleteSelection - selections", selections);
    if (selections <= 0) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Selezionare almeno un obiettivo da cancellare"}
      });
    }
    else{
      const dialogRef = this._dialog.open(DialogYesNoComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Si stanno cancellando "+selections+" Tipi di Voto. Continuare?"}
      });
      dialogRef.afterClosed().subscribe(
        async result => {
          if(!result) return; 
          else {
            //per ragioni di sincronia (aggiornamento obiettiviList dopo il loop) usiamo la Promise()

            this.deleteTipiVotoSequentially(objIdToRemove)
            .then(() => {
              //la then dovrebbe garantire che tutte le eliminazioni sono state completate con successo
              this.classiAnniMaterieList.resetSelections();
              this.classiAnniMaterieList.loadData();
            });
          }
      })
    }
  }

  async deleteTipiVotoSequentially(objIdToRemove: any): Promise<any> {
    for (const element of objIdToRemove) {
      try {
        await firstValueFrom(this.svcClassiAnniMaterie.delete(element.id).pipe(tap(()=>console.log("sto cancellando"))));
      } catch (err) {
        this._snackBar.openFromComponent(SnackbarComponent, {data: "Errore nella cancellazione", panelClass: ['red-snackbar']})
      }
    }
  }


}
