//#region ----- IMPORTS ------------------------

import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { DateAdapter }                          from '@angular/material/core';
import { DateRange, MatDateRangeSelectionStrategy, MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { LezioniService }                       from '../lezioni.service';

//models
import { DialogDataLezioniUtils }               from 'src/app/_models/DialogData';

//#endregion

//#region Injectable per la selezione dell'intervallo nel matdatepicker
  //si può creare una directive a sè oppure inserire un injectable qui e poi fornirlo come provider+useclass  al component
  //https://stackoverflow.com/questions/64521480/angular-material-datepicker-limit-the-range-selection

  @Injectable()
  export class MyRangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {
    start: any;
    
    constructor( private _dateAdapter: DateAdapter<D> ) {

    }

    //selectionFinished governa cosa accade quando si clicca per ritornare il valore del range
    selectionFinished(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
      let offset: number;
      let { start, end } = currentRange;

      if (start == null || (start && end)) {
        start = activeDate;
        end = null;
      } 
      else if (end == null) {     
        offset = -(this._dateAdapter.getDayOfWeek(start) - 1 );
        start = this._dateAdapter.addCalendarDays(start, offset);
        end = this._dateAdapter.addCalendarDays(start, 5);
        return new DateRange(start, end);
      }
      return new DateRange<D>(start, end);
    }

    //createPreview governa la fase di interazione prima del click di chiusura
    createPreview(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
      return this._createFiveDayRange(activeDate, currentRange);
    }

    //funzione di supporto...potrebbe forse essere usata anche da selectionFinished
    private _createFiveDayRange(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
      let { start, end } = currentRange;

      if (start && !end) {
        let offset: number;
        offset = -(this._dateAdapter.getDayOfWeek(start) - 1 );
        start = this._dateAdapter.addCalendarDays(start, offset);
        end = this._dateAdapter.addCalendarDays(start, 5);
        return new DateRange(start, end);
      }
      return new DateRange<D>(null, null);
    }
  }

//#endregion

@Component({
  selector: 'app-lezioni-utils',
  templateUrl: './lezioni-utils.component.html',
  styleUrls: ['../lezioni.css'],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: MyRangeSelectionStrategy,
    },
  ],
})

export class LezioniUtilsComponent implements OnInit {

//#region ----- Variabili ----------------------

  form!:                     UntypedFormGroup;
  form2!:                     UntypedFormGroup;
  currMonday!:               Date;

//#endregion

//#region ----- Constructor --------------------

  constructor( public _dialogRef: MatDialogRef<LezioniUtilsComponent>,
               private svcLezioni:                   LezioniService,         
               @Inject(MAT_DIALOG_DATA) public data: DialogDataLezioniUtils,
               private fb:                           UntypedFormBuilder, 
               private _dateAdapter:                 DateAdapter<Date>,
               private _snackBar:                    MatSnackBar  ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      picker1start:                  [null, Validators.required],
      picker1end:                    [null, Validators.required],
      ckTutteleClassi1:              [null],
    });

    this.form2 = this.fb.group({
      pickerDataSingola:             [null, Validators.required],
      ckTutteleClassi2:              [null],
    });
   }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {

    let currDate :Date = this.data.start;
    let offset:number = -(this._dateAdapter.getDayOfWeek(currDate) - 1 );
    this.currMonday = this._dateAdapter.addCalendarDays(currDate, offset);
    //this.currMonday = dtCopyToStart.toLocaleString('sv').replace(' ', 'T').substring(0,10);
  }

//#endregion

//#region ----- Vari metodi --------------------

  deleteByClasseSezioneAnnoAndDateSett() {
    
    let ckTutteleClassi1 = this.form.controls['ckTutteleClassi1'].value;
    let dtStart: Date;
    dtStart = this.form.controls['picker1start'].value;
    let dtStartYYYY_MM_DD = dtStart.toLocaleString('sv').replace(' ', 'T').substring(0,10);

    let dtEnd: Date;
    dtEnd = this.form.controls['picker1end'].value;
    let dtEndYYYY_MM_DD = dtEnd.toLocaleString('sv').replace(' ', 'T').substring(0,10);

    if (ckTutteleClassi1 == false  || ckTutteleClassi1 == null) {
      this.svcLezioni.deleteByClasseSezioneAnnoAndDate(this.data.classeSezioneAnnoID, dtStartYYYY_MM_DD, dtEndYYYY_MM_DD).subscribe({
        next: res => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Operazione effettuata correttamente', panelClass: ['green-snackbar']}) } ,
        error: err=> {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})}
      });
    } else {
      this.svcLezioni.deleteByDate(dtStartYYYY_MM_DD, dtEndYYYY_MM_DD).subscribe({
        next: res => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Operazione effettuata correttamente', panelClass: ['green-snackbar']}) } ,
        error: err=> {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})}
      });
    }
  }

  deleteByClasseSezioneAnnoAndDate() {
    
    let ckTutteleClassi2 = this.form2.controls['ckTutteleClassi2'].value;
    let dtStart: Date;
    dtStart = this.form2.controls['pickerDataSingola'].value;
    let dtStartYYYY_MM_DD = dtStart.toLocaleString('sv').replace(' ', 'T').substring(0,10);

    if (ckTutteleClassi2 == false  || ckTutteleClassi2 == null) {
      this.svcLezioni.deleteByClasseSezioneAnnoAndDate(this.data.classeSezioneAnnoID, dtStartYYYY_MM_DD, dtStartYYYY_MM_DD).subscribe({
        next: res => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Operazione effettuata correttamente', panelClass: ['green-snackbar']}) } ,
        error: err=> {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})}
      });
    } else {
      this.svcLezioni.deleteByDate(dtStartYYYY_MM_DD, dtStartYYYY_MM_DD).subscribe({
        next: res => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Operazione effettuata correttamente', panelClass: ['green-snackbar']}) } ,
        error: err=> {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})}
      });
    }
  }

  copiaFinoA() {

    let ckTutteleClassi1 = this.form.controls['ckTutteleClassi1'].value;

    let currDate :Date = this.data.start;
    let offset:number = -(this._dateAdapter.getDayOfWeek(currDate) - 1 );
    let dtFromStart:Date = this._dateAdapter.addCalendarDays(currDate, offset);
    let dtFromStartYYYY_MM_DD = dtFromStart.toLocaleString('sv').replace(' ', 'T').substring(0,10);

    let dtFromEnd: Date;
    dtFromEnd = this._dateAdapter.addCalendarDays(dtFromStart, 5);
    let dtFromEndYYYY_MM_DD = dtFromEnd.toLocaleString('sv').replace(' ', 'T').substring(0,10);

    let dtUntilStart: Date;
    dtUntilStart = this.form.controls['picker1start'].value;
    let dtUntilStartYYYY_MM_DD = dtUntilStart.toLocaleString('sv').replace(' ', 'T').substring(0,10);

    if (ckTutteleClassi1 == true) {
      this.svcLezioni.copyUntilDate(dtFromStartYYYY_MM_DD, dtFromEndYYYY_MM_DD, dtUntilStartYYYY_MM_DD)
        .subscribe({
          next: res => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Operazione effettuata correttamente', panelClass: ['green-snackbar']}) } ,
          error: err=> {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})}
      });
    } 
    else {
      //console.log ("this.data.classeSezioneAnnoID, dtFromStartYYYY_MM_DD, dtFromEndYYYY_MM_DD, dtUntilStartYYYY_MM_DD", this.data.classeSezioneAnnoID, dtFromStartYYYY_MM_DD, dtFromEndYYYY_MM_DD, dtUntilStartYYYY_MM_DD);

      this.svcLezioni.copyByClasseSezioneAnnoUntilDate(this.data.classeSezioneAnnoID, dtFromStartYYYY_MM_DD, dtFromEndYYYY_MM_DD, dtUntilStartYYYY_MM_DD)
        .subscribe({
          next: res => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Operazione effettuata correttamente', panelClass: ['green-snackbar']}) } ,
          error: err=> {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})}
      });
    }
  }

  copiaDa() {
    
    let ckTutteleClassi1 = this.form.controls['ckTutteleClassi1'].value;

    let dtFromStart: Date;
    dtFromStart = this.form.controls['picker1start'].value;
    let dtFromStartYYYY_MM_DD = dtFromStart.toLocaleString('sv').replace(' ', 'T').substring(0,10);

    let dtFromEnd: Date;
    dtFromEnd = this.form.controls['picker1end'].value;
    let dtFromEndYYYY_MM_DD = dtFromEnd.toLocaleString('sv').replace(' ', 'T').substring(0,10);
    
    let currDate :Date = this.data.start;
    let offset:number = -(this._dateAdapter.getDayOfWeek(currDate) - 1 );
    let dtCopyToStart:Date = this._dateAdapter.addCalendarDays(currDate, offset);
    let dtCopyToStartYYYY_MM_DD = dtCopyToStart.toLocaleString('sv').replace(' ', 'T').substring(0,10);

    if (ckTutteleClassi1 == true) {
      this.svcLezioni.copyToDate(dtFromStartYYYY_MM_DD, dtFromEndYYYY_MM_DD, dtCopyToStartYYYY_MM_DD)
        .subscribe({
          next: res => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Operazione effettuata correttamente', panelClass: ['green-snackbar']}) } ,
          error: err=> {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})}
      });
    } else {
      this.svcLezioni.copyByClasseSezioneAnnoToDate(this.data.classeSezioneAnnoID, dtFromStartYYYY_MM_DD, dtFromEndYYYY_MM_DD, dtCopyToStartYYYY_MM_DD)
        .subscribe({
          next: res => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Operazione effettuata correttamente', panelClass: ['green-snackbar']}) } ,
          error: err=> {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})}
      });
    }
  }

  propagaEpocaClasse() {

    let currDate :Date = this.data.start;
    let offset:number = -(this._dateAdapter.getDayOfWeek(currDate) - 1 );
    let dtFrom:Date = this._dateAdapter.addCalendarDays(currDate, offset);
    let dtFromYYYY_MM_DD = dtFrom.toLocaleString('sv').replace(' ', 'T').substring(0,10);  //la data del lunedi della settimana corrente
    let dtToEnd:Date = this._dateAdapter.addCalendarDays(dtFrom, 5);                     //la data del venerdi della settimana corrente
    let dtToEndYYYY_MM_DD = dtToEnd.toLocaleString('sv').replace(' ', 'T').substring(0,10);  //la data del venerdì della settimana corrente
    // console.log(dtFromYYYY_MM_DD, dtToEndYYYY_MM_DD );

      this.svcLezioni.propagaEpocaByClasseSezioneAnnoUntilDate(this.data.classeSezioneAnnoID, dtFromYYYY_MM_DD, dtToEndYYYY_MM_DD)
        .subscribe({
          next: res => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Operazione effettuata correttamente', panelClass: ['green-snackbar']}) } ,
          error: err=> {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})}
        });
    
  }

//#endregion
}
