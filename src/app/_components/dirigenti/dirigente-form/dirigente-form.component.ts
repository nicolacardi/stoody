//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnChanges, OnInit, Output }       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }                from '@angular/forms';
import { MatDialog }                                                       from '@angular/material/dialog';
import { Observable, tap }                                                 from 'rxjs';
import { MatSnackBar }                                                     from '@angular/material/snack-bar';

//components
import { SnackbarComponent }                                               from '../../utilities/snackbar/snackbar.component';

//services
import { DirigentiService }                                                from '../dirigenti.service';
import { LoadingService }                                                  from '../../utilities/loading/loading.service';

//models
import { PER_Dirigente }                                                   from 'src/app/_models/PER_Dirigente';


//#endregion

@Component({
  selector: 'app-dirigente-form',
  templateUrl: './dirigente-form.component.html',
  styleUrls:    ['./../dirigenti.css']
})

export class DirigenteFormComponent implements OnInit, OnChanges {

//#region ----- Variabili ----------------------
  dirigente$!:                                    Observable<PER_Dirigente>;
  form! :                                       UntypedFormGroup;
  
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() dirigenteID!:                           number;
  @Output('formValid') formValid = new EventEmitter<boolean>();
  @Output('formChanged') formChanged = new EventEmitter();
  @Output('deletedRole') deletedRole = new EventEmitter<string>();

//#endregion
  
//#region ----- Constructor --------------------

  constructor(
    public _dialog               : MatDialog,
    private fb                   : UntypedFormBuilder,
    private svcDirigenti         : DirigentiService,
    private _loadingService      : LoadingService,
    private _snackBar            : MatSnackBar,
              
  ) {

    this.form        = this.fb.group(
    {
      id             : [null],
      personaID      : [null],
      abilitazione   : ['', Validators.maxLength(255)],
      ckAttivo       : [true]
    });
  }

//#endregion


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();

    this.form.valueChanges.subscribe( res=> {
        this.formValid.emit(this.form.valid);
        //this.formChanged.emit()
      }
    )
  }

  ngOnChanges () {
    this.loadData();
    this.formValid.emit(this.form.valid);
  }

  loadData(){

    if (this.dirigenteID && this.dirigenteID + '' != "0") {
      const obsDirigente$: Observable<PER_Dirigente> = this.svcDirigenti.get(this.dirigenteID);
      const loadDirigente$ = this._loadingService.showLoaderUntilCompleted(obsDirigente$);

      this.dirigente$ = loadDirigente$
      .pipe( 
          tap(
            dirigente => 
              {this.form.patchValue(dirigente)
                console.log (dirigente);
              }
          )
      );
    }
    else 
      this.emptyForm = true
  }

  save() {
    if (this.dirigenteID == null || this.dirigenteID == 0) 
      this.svcDirigenti.post(this.form.value).subscribe();
    else 
      this.svcDirigenti.put(this.form.value).subscribe();
  }
  
  delete(){
    if (this.dirigenteID != null) 
      this.svcDirigenti.delete(this.dirigenteID)
      .subscribe({
        next: res=>{
          this._snackBar.openFromComponent(SnackbarComponent,{data: 'Ruolo Dirigente cancellato', panelClass: ['red-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
      });
  }


  deleteRole() {
    this.delete();
    this.deletedRole.emit('Dirigente')
  }
//#endregion
}
