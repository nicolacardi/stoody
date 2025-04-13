//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit, ViewChild }       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }       from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA }   from '@angular/material/dialog';
import { MatSnackBar }                                from '@angular/material/snack-bar';
import { SnackbarComponent }                          from '../../utilities/snackbar/snackbar.component';
import { Observable }                                 from 'rxjs';
import { map, tap }                                   from 'rxjs/operators';
import { MatSelect }                                  from '@angular/material/select';

//components
import { DialogYesNoComponent }                       from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { LoadingService }                             from '../../utilities/loading/loading.service';
import { IscrizioniService }                          from '../../iscrizioni/iscrizioni.service';
import { LezioniService }                             from '../lezioni.service';
import { VotiInterrService }                          from '../voti-interr.service';

//models
import { CAL_Lezione }                                from 'src/app/_models/CAL_Lezione';
import { TST_VotoInterr }                             from 'src/app/_models/TST_VotiInterr';
import { DialogDataVotoInterr }                       from 'src/app/_models/DialogData';
import { CLS_Iscrizione }                             from 'src/app/_models/CLS_Iscrizione';
import { MAT_Materia }                                from 'src/app/_models/MAT_Materia';
import { MaterieService }                             from '../../materie/materie.service';

//#endregion
@Component({
  selector: 'app-voto-interr-edit',
  templateUrl: './voto-interr-edit.component.html',
  styleUrls: ['./../lezioni.css']
})
export class VotoInterrEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  dateArr!:                                     string[];
  obsLezioni$!:                                 Observable<CAL_Lezione[]>;
  obsMaterie$!:                                 Observable<MAT_Materia[]>;

  obsIscrizioni$!:                              Observable<CLS_Iscrizione[]>;
  votoInterr$!:                                 Observable<TST_VotoInterr>;
  prof!:                                        string;
  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  breakpoint!:                                  number;

  lezioneSelected!:                             CAL_Lezione;
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('selectLezione') public selectLezione!: MatSelect;
  userFullName: any;
//#endregion

//#region ----- Constructor --------------------

  constructor(
    @Inject(MAT_DIALOG_DATA) public data        : DialogDataVotoInterr,
    public _dialogRef                           : MatDialogRef<VotoInterrEditComponent>,
    private fb                                  : UntypedFormBuilder,
    public _dialog                              : MatDialog,
    private _snackBar                           : MatSnackBar,
    private _loadingService                     : LoadingService,
    private svcLezioni                          : LezioniService,
    private svcMaterie                          : MaterieService,
    private svcVotiInterr                       : VotiInterrService,
    private svcIscrizioni                       : IscrizioniService
  ) { 

    _dialogRef.disableClose = true;
    this.form = this.fb.group({
      id:                                       [null],
      lezioneID:                                [''],
      materiaID:                                [''],
      alunnoID:                                 [''],
      argomento:                                [''],
      voto:                                     [''],
      giudizio:                                 ['']
    });
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit() {
    this.loadData();
  }

  loadData(){

    //********************* POPOLAMENTO COMBO LEZIONI *******************
    this.dateArr = [];

    //popolo la combo delle lezioni disponibili per il docente in questa classeSezioneAnno
    if (this.data.votoInterr == null) {
      //caso nuova interrogazione
      //se data.lezioneID != undefined mi trovo nell'orario docente: devo valorizzare e più oltre inibire la scelta della lezione
      if (this.data.lezioneID != undefined ) {
        //estraggo un array di UN SOLO valore (data.lezioneID)... per passarlo alla selectLezione
        this.obsLezioni$= this.svcLezioni.list()
        .pipe (
          map(val=>val.filter(val=>(val.id == this.data.lezioneID))),  
          tap(val => {
            this.form.controls['lezioneID'].setValue(val[0].id);
            this.form.controls['lezioneID'].disable();
          })
          //tap(val =>  val.forEach(x=> this.dateArr.push(x.dtCalendario))) //non serve...la combo è disabled
        )
      } 
      else {
        //se invece data.lezioneID == undefined allora devo caricare tutte le lezioni e non selezionarne alcuna
        this.obsLezioni$= this.svcLezioni.listByDocenteClasseSezioneAnno(this.data.docenteID, this.data.classeSezioneAnnoID)
          .pipe(
            tap(val =>  {
              val.forEach(x=> this.dateArr.push(x.dtCalendario))
              this.form.controls['lezioneID'].enable();
            })
          );
      }
    } else {
      //caso click su interrogazione esistente
      //estraggo un array di UN SOLO valore... per passarlo alla selectLezione
      this.obsLezioni$= this.svcLezioni.list()
      .pipe (
        map(val=>val.filter(val=>(val.id == this.data.votoInterr.lezioneID))),  
        tap(val => {
          this.form.controls['lezioneID'].setValue(val[0].id);
          this.form.controls['lezioneID'].disable();
        })
        //tap(val =>  val.forEach(x=> this.dateArr.push(x.dtCalendario))) //non serve...la combo è disabled
      )
    }

    //********************* POPOLAMENTO COMBO MATERIE DELLA CLASSE E DEL DOCENTE *******************

    //popolo la combo delle materie disponibili per il docente in questa classeSezioneAnno
    //l'insegnante potrebbe fare lezione di Psicologia ma interrogare in antropologia se è una sua materia
    //o forse di default bosognerbbe mettere la materia della lezione in corso??
    console.log("voto-inter-edit - loadData - docenteID", this.data.docenteID)
    this.obsMaterie$= this.svcMaterie.listByClasseSezioneAnnoANDDocente(this.data.classeSezioneAnnoID, this.data.docenteID);

    //********************* POPOLAMENTO COMBO ALUNNI *******************
    this.obsIscrizioni$= this.svcIscrizioni.listByClasseSezioneAnno(this.data.classeSezioneAnnoID);

    //********************* POPOLAMENTO FORM *******************
    if (this.data.votoInterr == null) {
      //se data.lezioneID != undefined mi trovo nell'orario docente: ho valorizzato adesso devo inibire la scelta della lezione
      // if (this.data.lezioneID != undefined ) {
      //   this.form.controls['lezioneID'].disable();
      // } else {
      //   this.form.controls['lezioneID'].enable();
      // }
      //console.log ("voto-interr-edit NUOVA INTERR loadData - this.data", this.data);
      
      this.emptyForm = true
    } 
    else {
      //console.log ("voto-interr-edit EDIT INTERR loadData - this.data", this.data);
      // this.form.controls['lezioneID'].disable();
      const obsVotoInterr$: Observable<TST_VotoInterr> = this.svcVotiInterr.get(this.data.votoInterr.id);
      const loadVotoInterr$ = this._loadingService.showLoaderUntilCompleted(obsVotoInterr$);
      
      this.votoInterr$ = loadVotoInterr$
      .pipe( 
        tap( val => this.form.patchValue(val) )
      );

    }
  }

//#endregion

//#region ----- Operazioni CRUD ----------------
  save(){

    if (this.data.votoInterr == null){ 
      //Inserimento nuova interrogazione
      //questo ciclo for serve per passare al form ANCHE i valori disabled (nel caso specifico se siamo in orario, lezioneID è disabled)
      for (const prop in this.form.controls) {
        this.form.value[prop] = this.form.controls[prop].value;
      }
      let votoInterrObj: TST_VotoInterr = {
        alunnoID: this.form.controls['alunnoID'].value,
        lezioneID : this.form.controls['lezioneID'].value,
        materiaID:  this.form.controls['materiaID'].value,
        argomento: this.form.controls['argomento'].value,
        voto: this.form.controls['voto'].value,
        giudizio: this.form.controls['giudizio'].value,
      }

      // console.log ("voto-interr-edit save POST this.form.value", this.form.value);
      // console.log ("voto-interr-edit save POST votoInterrObj", votoInterrObj);
      this.form.controls['id'].setValue(0);
      this.svcVotiInterr.post(votoInterrObj).subscribe({
        next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      });

    } 
    else { 
      //Update interrogazione
      //questo ciclo for serve per passare al form ANCHE i valori disabled (nel caso specifico se siamo in edit, lezioneID è disabled)
      for (const prop in this.form.controls) {
        this.form.value[prop] = this.form.controls[prop].value;
      }
      
      // console.log ("voto-interr-edit save PUT this.form.value", this.form.value);
      this.svcVotiInterr.put(this.form.value).subscribe({
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
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del Voto ?"}
    });

    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {

        this.svcVotiInterr.delete(this.data.votoInterr.id!).subscribe({
          next: res => {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
          },
          error: err=>  this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        });

        for (const prop in this.form.controls) {
          this.form.value[prop] = this.form.controls[prop].value;
        }
      } 
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
    this.svcLezioni.get(this.form.controls['lezioneID'].value).subscribe(res => {
      this.lezioneSelected = res}
    );
  }
  
  
//#endregion

}
