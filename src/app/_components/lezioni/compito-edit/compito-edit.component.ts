//#region ----- IMPORTS ------------------------

import { Component, Inject, OnChanges, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { Observable }                           from 'rxjs';
import { map, tap }                                  from 'rxjs/operators';
import { MatSelect }                            from '@angular/material/select';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { LezioniService }                       from '../lezioni.service';
import { VotiCompitiService }                   from '../voti-compiti.service';

//models
import { CAL_Lezione }                          from 'src/app/_models/CAL_Lezione';
import { TST_VotoCompito }                      from 'src/app/_models/TST_VotiCompiti';

//#endregion
@Component({
  selector: 'app-compito-edit',
  templateUrl: './compito-edit.component.html',
  styleUrls: ['./../lezioni.css']
})
export class CompitoEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  dateArr!:                                     string[];
  obsLezioni$!:                                 Observable<CAL_Lezione[]>;
  lezione$!:                                    Observable<CAL_Lezione>;
  prof!:                                        string;
  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  breakpoint!:                                  number;
  userFullName: any;

  lezioneSelected!:                             CAL_Lezione;
//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChild('selectLezione') public selectLezione!: MatSelect;

//#endregion

//#region ----- Constructor --------------------

  constructor(@Inject(MAT_DIALOG_DATA) public data:       CAL_Lezione,
              public _dialogRef:                          MatDialogRef<CompitoEditComponent>,
              private fb:                                 UntypedFormBuilder,
              public _dialog:                             MatDialog,
              private _snackBar:                          MatSnackBar,
              private _loadingService :                   LoadingService,
              private svcLezioni:                         LezioniService,
              private svcIscrizioni:                      IscrizioniService,
              private svcVotiCompiti:                     VotiCompitiService ) { 

    _dialogRef.disableClose = true;
    this.form = this.fb.group({
      id:                                       [null],
      //ckCompito:                                [false],
      argomentoCompito:                         [''],
    });

    if (this.data.id == 0) {
      
      let currUser = Utility.getCurrentUser();
      this.prof = currUser.fullname;
    } else 
    this.prof = this.data.classeDocenteMateria.docente!.persona!.nome + ' ' + this.data.classeDocenteMateria.docente!.persona!.cognome;

  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData(){
    
    //Popolo la combo delle lezioni: 
    //Se sono in fase inserimento nuovo compito devono essere quelle SENZA compito!!!
    //Se sono in fase put/update di un compito esistente nella select ci metto direttamente la lezione che arriva da data.id
    this.dateArr = [];

    if (this.data.id == 0) {
      this.obsLezioni$= this.svcLezioni.listByDocenteClasseSezioneAnnoNoCompito(this.data.classeDocenteMateria.docenteID, this.data.classeDocenteMateria.classeSezioneAnnoID)
        .pipe(
          tap(val =>  val.forEach(x=> this.dateArr.push(x.dtCalendario)))
        );
    } 
    else {
      //estraggo un array di un valore...
      this.obsLezioni$= this.svcLezioni.list()
      .pipe (
        map(val=>val.filter(val=>(val.id == this.data.id))),  
        //tap(val =>  val.forEach(x=> this.dateArr.push(x.dtCalendario))) //non serve...la combo è disabled
      );
    }
    
    //********************* POPOLAMENTO FORM *******************
    if (this.data.id) {
      this.form.controls['id'].disable();
      const obsLezione$: Observable<CAL_Lezione> = this.svcLezioni.get(this.data.id);
      const loadLezione$ = this._loadingService.showLoaderUntilCompleted(obsLezione$);
      
      this.lezione$ = loadLezione$
      .pipe( 
        tap( val => this.form.patchValue(val) )
      );
    
    } 
    else {
      this.form.controls['id'].enable();
      this.emptyForm = true
    }
  }

//#endregion

//#region ----- Operazioni CRUD ----------------
  save(){
    //this.form.controls['ckCompito'].setValue(true);

    if (this.data.id == 0){ //Inserimento nuovo compito
      //Prima bisogna inserire in VotiCompiti un valore per ogni alunno iscritto alla classe della lezione selezionata
      this.svcIscrizioni.listByClasseSezioneAnno(this.lezioneSelected.classeDocenteMateria.classeSezioneAnnoID).subscribe(
        iscrizioni => { 
          for (let iscrizione of iscrizioni) {
            let objVoto : TST_VotoCompito =
            { 
              id : 0,
              alunnoID : iscrizione.alunnoID,
              lezioneID : this.lezioneSelected.id,
              voto : 0,
              giudizio: ''
            };

            this.svcVotiCompiti.post(objVoto).subscribe({
              next: res=> {},
              error: err=> {console.log ("fallito inserimento objVoto", objVoto)}
            });
          }

        //ora deve salvare il ckCompito e l'argomentoCompito nella lezione: 

        this.lezioneSelected.ckCompito = true;
        this.lezioneSelected.argomentoCompito = this.form.controls['argomentoCompito'].value;

        this.svcLezioni.put(this.lezioneSelected).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        });
      });
    }
    else {
      this.data.argomentoCompito = this.form.controls['argomentoCompito'].value;

      this.svcLezioni.put(this.data).subscribe({
        next: res => {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=>  this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      });
    }
  }

  delete(){
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del compito ?"}
    });

    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {

        this.svcVotiCompiti.deleteByLezione(this.data.id).subscribe();

        for (const prop in this.form.controls)
          this.form.value[prop] = this.form.controls[prop].value;
        
        this.data.ckCompito = false;

        this.svcLezioni.put(this.data).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record Cancellato', panelClass: ['red-snackbar']});
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        });
      } 
      else 
        this.data.ckCompito = true;
    });
  }


  setGiornoCorrente() {
    let oggi = new Date;
    let trovato = false;
    
    this.dateArr.forEach(
      (x, index) => {
        if (!trovato) {
          if (new Date (x) >= oggi) {
           this.selectLezione._keyManager.setActiveItem(index);
            trovato = true;
          }
        }
      }
    );
  }

  changeSelection() {
    this.svcLezioni.get(this.form.controls['id'].value).subscribe(res => {
      this.lezioneSelected = res}
    );
  }
  
  
//#endregion

}
