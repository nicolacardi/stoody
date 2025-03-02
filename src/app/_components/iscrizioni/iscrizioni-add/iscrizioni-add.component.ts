//#region ----- IMPORTS ------------------------

import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Observable }                           from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent }         from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { debounceTime, finalize, map, switchMap, tap } from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { DialogData }                           from 'src/app/_models/DialogData';

//services
import { AlunniService }                        from 'src/app/_components/alunni/alunni.service';
import { IscrizioniService }                    from '../iscrizioni.service';

//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';

//#endregion
@Component({
  selector: 'app-iscrizioni-add',
  templateUrl: './iscrizioni-add.component.html',
  styleUrls: ['./../iscrizioni.css'],
  standalone: false
})

export class IscrizioniAddComponent implements OnInit {

//#region ----- Variabili ----------------------
  form! :                                       UntypedFormGroup;
  filteredAlunni$!:                             Observable<ALU_Alunno[]>;
  alunniSelezionati:                            string[] = [];
  idAlunniSelezionati:                          number[] = [];
  removable =                                   true;
  selectable =                                  true;
  alunniIsLoading:                              boolean = false;
  classeSezioneAnnoID!:                         number;
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('nomeCognomeAlunno') nomeCognomeAlunno!: ElementRef<HTMLInputElement>;
//#endregion

//#region ----- Constructor --------------------
  constructor(private fb:                       UntypedFormBuilder,
              private svcAlunni:                AlunniService,
              private svcIscrizioni:            IscrizioniService,
              public dialogRef:                 MatDialogRef<IscrizioniAddComponent>,
              private _snackBar:                MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { 

    this.form = this.fb.group({
      nomeCognomeAlunno:     [null]
    });
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit(): void {

    console.log ("iscrizioni-add - ngOnInit - this.data", this.data);
    this.classeSezioneAnnoID = this.data.classeSezioneAnnoID;
    this.filteredAlunni$ = this.form.controls['nomeCognomeAlunno'].valueChanges
      .pipe(
        tap(() => this.alunniIsLoading = true),
        debounceTime(300),
        //delayWhen(() => timer(2000)),
        switchMap(
          val => this.svcAlunni.listByAnnoNoClasse(this.form.value.nomeCognomeAlunno, this.data.annoID)
            .pipe(
              map( val2 => val2.filter(val=>!this.idAlunniSelezionati.includes(val.id)) )//FANTASTICO!!! NON MOSTRA QUELLI GIA'SELEZIONATI! MEGLIO DI GOOGLE CHE LI RIMOSTRA!
            ) 
        ),
        // switchMap(() => 
        //   this.svcAlunni.listByAnnoNoClasse(this.form.value.nomeCognomeAlunno, this.data.annoID)
        // )
        // tap(val=> console.log("iscrizioni-add alunni disponibili in base a anno: ", this.data.annoID, "...e ad aver scritto:", this.form.value.nomeCognomeAlunno, " ->", val)),
        tap(() => this.alunniIsLoading = false)
    )
  }

//#endregion

//#region ----- Altri metodi -------------------

  selected(event: MatAutocompleteSelectedEvent): void {

    this.nomeCognomeAlunno.nativeElement.value = '';
    const alunnoToAdd = event.option.viewValue;
    const alunnoIDToAdd = parseInt(event.option.id);

    //in verità dopo la miglioria per cui non si vede più quanto giù selezionato questa if non servirebbe
    if (!this.alunniSelezionati.includes(alunnoToAdd)) { 
      this.alunniSelezionati.push(alunnoToAdd);
      this.idAlunniSelezionati.push(alunnoIDToAdd);
    }
  }

  remove(alunnoSelezionato: string): void {

    const index = this.alunniSelezionati.indexOf(alunnoSelezionato);
    if (index >= 0) {
      this.alunniSelezionati.splice(index, 1);
      this.idAlunniSelezionati.splice(index, 1);
    }
    this.form.controls['nomeCognomeAlunno'].setValue('');
  }
//#endregion

//#region ----- Operazioni CRUD ----------------

  save() {
    this.idAlunniSelezionati.forEach(
      val=>{
        let objIscrizione = {
          AlunnoID: val,
          ClasseSezioneAnnoID: this.data.classeSezioneAnnoID
        };
        this.svcIscrizioni.post(objIscrizione)
          .pipe( finalize(()=>this.dialogRef.close())).subscribe({
            next: res =>{},
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        });
      });
  }

//#endregion

}
