//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { concatMap, map, tap }                                  from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { AnniScolasticiService }                from '../anni-scolastici.service';

//classes
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { DialogDataAnnoEdit }                   from 'src/app/_models/DialogData';
import { FormatoData, Utility }                 from '../../utilities/utility.component';
import { IscrizioniService } from '../../iscrizioni/iscrizioni.service';
import { PagelleService } from '../../pagelle/pagelle.service';
import { ParametriService } from '../../impostazioni/parametri/parametri.service';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';

//#endregion

@Component({
  selector: 'app-annoscolastico-edit',
  templateUrl: './annoscolastico-edit.component.html',
  styleUrls: ['../anniscolastici.css']
})
export class AnnoscolasticoEditComponent implements OnInit {

  //#region ----- Variabili ----------------------

  anno$!:                     Observable<ASC_AnnoScolastico>;
  obsAnni$!:                  Observable<ASC_AnnoScolastico[]>;

  form! :                     UntypedFormGroup;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;
  annoCorrenteID!:                              number;
  ckCorrente= false;
//#endregion


//#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<AnnoscolasticoEditComponent>,
                    @Inject(MAT_DIALOG_DATA) public data:   DialogDataAnnoEdit,
                    private svcAnni :                       AnniScolasticiService,
                    private svcParametri:                   ParametriService,
                    private svcPagelle:                     PagelleService,
                    private _loadingService :               LoadingService,
                    private fb:                             UntypedFormBuilder, 
                    public _dialog:                         MatDialog,
                    private _snackBar:                      MatSnackBar ) { 


    _dialogRef.disableClose = true;

    this.form = this.fb.group({
        id:                                     [null],
        anno1:                                  ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
        anno2:                                  [''],
        annoscolastico:                         [''],
        iD_annoscolasticoPrec:                  [''],
        dtInizio:                               [''],
        dtFineQ1:                               [''],
        dtFine:                                 [''],
        ckChiuso:                               [''],
      });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    let objAnno = localStorage.getItem('AnnoCorrente');
    this.annoCorrenteID = + (JSON.parse(objAnno!) as _UT_Parametro).parValue
    this.loadData();

  }

  loadData(){



    this.obsAnni$ = this.svcAnni.list();

    if (this.data.annoID && this.data.annoID + '' != "0") {

      const obsAnno$: Observable<ASC_AnnoScolastico> = this.svcAnni.get(this.data.annoID);
      const loadAnno$ = this._loadingService.showLoaderUntilCompleted(obsAnno$);
      this.anno$ = loadAnno$
        .pipe(
          tap(
            anno => {
              // console.log ("annoscolastico-edit - loadData - anno", anno, this.annoCorrenteID)
              if (this.annoCorrenteID == anno.id) this.ckCorrente = true;
              this.form.patchValue(anno);

            }
          )
      );
    } 
    else 
        this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD ----------------

  save(){

    //this._snackBar.openFromComponent(SnackbarComponent, {data: 'Funzione non abilitata', panelClass: ['red-snackbar']})

    //TODO la data viene sbagliata di un giorno, va sistemata

    if (this.form.controls['id'].value == null) {
      this.svcAnni.post(this.form.value).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
        });
    }
    else {
      this.svcAnni.put(this.form.value).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
        });
    }
    
  }

  delete(){

    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Funzione non abilitata', panelClass: ['red-snackbar']})
    /*
    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result){
          this.svcAnni.delete(Number(this.data.materiaID)).subscribe({
            next: res=>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
    */
  }


  updateDt(dt: string, control: string){

    //prendo la stringa e ne estraggo i pezzi
    const parts = dt.split('/'); // Split the input string by '/'
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    // creo la nuova data con i valori estratti (assumendo l'ordine day/month/year)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // formatto la data al tipo richiesto dal controllo data ('yyyy-MM-dd')
    let formattedDate = date.toISOString().slice(0, 10);

    //piccolo step per evitare che 1/1/2008 diventi 31/12/2007
    formattedDate = Utility.formatDate(date, FormatoData.yyyy_mm_dd);

    //impostazione della data finale
    this.form.controls[control].setValue(formattedDate);
  }

  changedCkChiuso(event: any) {
    
    if (event.checked) {
      const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Chiudere l'anno significa che<br>non si potranno più modificare <br>iscrizioni, quote, voti, pagamenti,<br>pagelle, ed altri documenti. Continuare?"}
      });

      dialogYesNo.afterClosed().subscribe(result => {
        if(result) {
          // console.log("ANNO CHIUSO", this.form.controls['id'].value);
          //TODO qui scatta una serie di eventi

          //TODO chiusura di tutte le pagelle
            //trova tutte le iscrizioni dell'anno e chiude ciascuna pagella
                this.svcPagelle.completaByAnno(this.form.controls['id'].value).subscribe(
                  
                );
          //TODO chiusura di tutti i cert Competenze e i cons orientativi

        }
        else {
          this.form.controls['ckChiuso'].setValue(false);
        }
      })
      }
  }

  setAnnoCorrente() {

    let parX! : _UT_Parametro;
    this.svcParametri.getByParName('AnnoCorrente')
    .pipe (
      tap( par => {                                 //al valore estratto vado a cambiare il valore
        par.parValue = this.form.controls['id'].value;
        parX = par;
        console.log ("par estratto", parX);       //e modifico il valore in localstorage
      }),
      concatMap(par => this.svcParametri.put(par)), //salvo il parametro che si chiama AnnoCorrente
      map( () => {
            localStorage.setItem(parX.parName, JSON.stringify(parX)); //imposto il valore nel localStorage
      })
      ).subscribe(

        {
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Anno Corrente Impostato', panelClass: ['green-snackbar']});
          },
          error: err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore', panelClass: ['red-snackbar']})
          )
        }


      )





  }

//#endregion


}