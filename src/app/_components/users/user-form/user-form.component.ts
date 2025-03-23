//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnChanges, OnInit, Output }      from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }    from '@angular/forms';
import { MatDialog }                                           from '@angular/material/dialog';
import { Observable, of, tap }                                 from 'rxjs';

//components

//services
import { LoadingService }                                      from '../../utilities/loading/loading.service';
import { UserService }                                         from 'src/app/_user/user.service';

//models
import { User }                                                from 'src/app/_user/Users';


//#endregion

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./../users.css']
})

export class UserFormComponent implements OnInit, OnChanges {

  //#region ----- Variabili ----------------------
  user$!:                                       Observable<User>;
  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() userID!:                            string;
  @Input() personaID!:                         number;

  @Output('formValid') formValid = new EventEmitter<boolean>();
  @Output('formChanged') formChanged = new EventEmitter();

//#endregion


//#region ----- Constructor --------------------

  constructor(public _dialog:                   MatDialog,
              private fb:                       UntypedFormBuilder, 
              private svcUser:                  UserService,
              private _loadingService :         LoadingService ) {

    this.form = this.fb.group(
    {
      id:                                       [null],
      personaID:                                [null],
      email:                                    ['', [Validators.email, Validators.required]],
      password:                                 [null]
    });

  }

//#endregion


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();

    this.form.valueChanges.subscribe(
      res=> {
        this.formValid.emit(this.form.valid);
        this.formChanged.emit();
      }
    )
  }

  ngOnChanges () {
    console.log("user-form - ngOnChanges - arrivato userID", this.userID);
    this.loadData();
  }

  loadData(){

    if (this.userID && this.userID + '' != "0") {
      const obsUser$: Observable<User> = this.svcUser.get(this.userID);
      const loadUser$ = this._loadingService.showLoaderUntilCompleted(obsUser$);

      this.user$ = loadUser$
      .pipe( 
          tap(
            user => this.form.patchValue(user)
          )
      );
    }
    else 
      this.emptyForm = true
  }

  save() {
    
    this.form.controls['personaID'].setValue(this.personaID);

    if (this.userID == null || this.userID == '') {
      console.log ("user-form - save - post form", this.form.value);
      //return this.svcGenitori.post(this.form.value)
      this.svcUser.post(this.form.value).subscribe();
    }
    else {
      console.log ("user-form - save - put form", this.form.value);
      this.svcUser.put(this.form.value).subscribe();
    }
  }

  delete() :Observable<any>{
    if (this.userID != null) 
      return this.svcUser.delete(this.userID) 
    else return of();
  }

}
