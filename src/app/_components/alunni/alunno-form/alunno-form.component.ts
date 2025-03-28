//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnChanges, OnInit, Output }                     from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog }                            from '@angular/material/dialog';
import { Observable, of, tap }                  from 'rxjs';

//components

//services
import { AlunniService }                        from '../alunni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//#endregion

@Component({
  selector: 'app-alunno-form',
  templateUrl: './alunno-form.component.html',
  styleUrls:    ['./../alunni.css']
})

export class AlunnoFormComponent implements OnInit, OnChanges {

//#region ----- Variabili ----------------------
  alunno$!        : Observable<ALU_Alunno>;
  public form!    : UntypedFormGroup;
  
  emptyForm       : boolean = false;
  loading         : boolean = true;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() alunnoID!:                           number;
  @Output('formValid') formValid = new EventEmitter<boolean>();
  @Output('formChanged') formChanged = new EventEmitter();
  @Output('deletedRole') deletedRole = new EventEmitter<string>();

//#endregion
  
//#region ----- Constructor --------------------

  constructor(public _dialog                 : MatDialog,
              private fb                     : UntypedFormBuilder,
              private svcAlunni              : AlunniService,
              private _loadingService        : LoadingService,
                private _snackBar            : MatSnackBar,) {

    this.form                          = this.fb.group(
    {
      id                               : [null],
      personaID                        : [null],
      scuolaProvenienza                : ['', Validators.maxLength(255)],
      indirizzoScuolaProvenienza       : ['', Validators.maxLength(255)],
      ckDSA                            : [false],
      ckDisabile                       : [false],
      ckAttivo                         : [true]
    });
  }

//#endregion


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();

    this.form.valueChanges.subscribe(
      res=> {
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

    if (this.alunnoID && this.alunnoID + '' != "0") {
      
      const obsAlunno$: Observable<ALU_Alunno> = this.svcAlunni.get(this.alunnoID);
      const loadAlunno$ = this._loadingService.showLoaderUntilCompleted(obsAlunno$);

      this.alunno$ = loadAlunno$
      .pipe( 
          tap(
            alunno => {
              // console.log("alunno-form loadData - alunno", alunno);
              this.form.patchValue(alunno)
            }
          )
      );
    }
    else 
      this.emptyForm = true
  }


  save() {
    
    //this.form.controls['personaID'].setValue(this.personaID);

    if (this.alunnoID == null || this.alunnoID == 0) {
      // console.log ("alunno-form - save - post form", this.form.value);
      //return this.svcGenitori.post(this.form.value)
      this.svcAlunni.post(this.form.value).subscribe();
    }
    else {
      // console.log ("alunno-form - save - put form", this.form.value);
      this.svcAlunni.put(this.form.value).subscribe();
    }
  }


  delete(){
    if (this.alunnoID != null) 
      this.svcAlunni.delete(this.alunnoID)
      .subscribe({
        next: res=>{
          this._snackBar.openFromComponent(SnackbarComponent,{data: 'Ruolo Alunno cancellato', panelClass: ['red-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
      });

  }


  deleteRole() {
    this.delete();
    this.deletedRole.emit('Alunno')
  }
//#endregion
}
