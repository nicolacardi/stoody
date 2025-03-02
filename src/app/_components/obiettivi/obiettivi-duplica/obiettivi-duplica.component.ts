//#region ----- IMPORTS ------------------------

import { Component, OnInit }                    from '@angular/core';
import { Observable }                           from 'rxjs';
import { MatDialog, MatDialogRef }              from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

//components
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//services
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { ObiettiviService }                     from '../obiettivi.service';

//classes
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//#endregion
@Component({
  selector: 'app-obiettivi-duplica',
  templateUrl: './obiettivi-duplica.component.html',
  styleUrls: ['./../obiettivi.css']
})

export class ObiettiviDuplicaComponent implements OnInit {

//#region ----- Variabili ----------------------

  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>
  form!:                                        UntypedFormGroup;
//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef:                          MatDialogRef<ObiettiviDuplicaComponent>,
              private svcAnni:                            AnniScolasticiService,
              private svcObiettivi:                       ObiettiviService,
              private fb:                                 UntypedFormBuilder,
              public _dialog:                             MatDialog,
              private _snackBar:                          MatSnackBar  ) {
    
    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      selectAnnoFrom: [null],
      selectAnnoTo: [null],
    })
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.obsAnni$ = this.svcAnni.list();
  }
//#endregion

//#region ----- Altri metodi -------------------

  duplica() {
    if (this.form.controls['selectAnnoFrom'].value == this.form.controls['selectAnnoTo'].value) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: { titolo: "ATTENZIONE!", sottoTitolo: "L'anno di origine e destinazione coincidono" }
      });
      return;
    };
    this.svcObiettivi.duplicaObiettivi(this.form.controls['selectAnnoFrom'].value, this.form.controls['selectAnnoTo'].value).subscribe(
      res => {
        this._dialogRef.close();
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record duplicati', panelClass: ['green-snackbar']});
      }
    );
  }
//#endregion

}
