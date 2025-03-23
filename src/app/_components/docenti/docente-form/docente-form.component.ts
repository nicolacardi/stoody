//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnInit, Output }                     from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog }                            from '@angular/material/dialog';
import { Observable, of, tap }                  from 'rxjs';

//components

//services
import { DocentiService }                       from '../docenti.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { PER_Docente }                          from 'src/app/_models/PER_Docente';

//#endregion

@Component({
  selector: 'app-docente-form',
  templateUrl: './docente-form.component.html',
  styleUrls:    ['./../docenti.css']
})

export class DocenteFormComponent implements OnInit {

//#region ----- Variabili ----------------------
  docente$!:                                    Observable<PER_Docente>;
  form! :                                       UntypedFormGroup;
  
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() docenteID!:                           number;
  @Output('formValid') formValid = new EventEmitter<boolean>();
  @Output('formChanged') formChanged = new EventEmitter();
  @Output('deletedRole') deletedRole = new EventEmitter<string>();

//#endregion
  
//#region ----- Constructor --------------------

  constructor(public _dialog:                   MatDialog,
              private fb:                       UntypedFormBuilder, 
              private svcDocenti:               DocentiService,
              private _loadingService :         LoadingService ) {

    this.form = this.fb.group(
    {
      id:                                       [null],
      personaID:                                [null],
      abilitazione:                             ['', Validators.maxLength(255)],
    });
  }

//#endregion


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();

    this.form.valueChanges.subscribe( res=> {
        this.formValid.emit(this.form.valid);
        this.formChanged.emit()
      }
    )
  }

  loadData(){

    if (this.docenteID && this.docenteID + '' != "0") {
      const obsDocente$: Observable<PER_Docente> = this.svcDocenti.get(this.docenteID);
      const loadDocente$ = this._loadingService.showLoaderUntilCompleted(obsDocente$);

      this.docente$ = loadDocente$
      .pipe( 
          tap(
            docente => this.form.patchValue(docente)
          )
      );
    }
    else 
      this.emptyForm = true
  }

  save() {
    if (this.docenteID == null || this.docenteID == 0) 
      this.svcDocenti.post(this.form.value).subscribe();
    else 
      this.svcDocenti.put(this.form.value).subscribe();
  }

  delete() :Observable<any>{
    if (this.docenteID != null) 
      return this.svcDocenti.delete(this.docenteID) 
    else 
      return of();
  }


  deleteRole() {
    this.delete();
    this.deletedRole.emit('Docente')
  }
//#endregion
}
