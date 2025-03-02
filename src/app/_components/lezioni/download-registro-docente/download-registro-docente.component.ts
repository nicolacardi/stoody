//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { Observable }                           from 'rxjs';


//components
import { FormatoData, Utility }                 from '../../utilities/utility.component';

//services
import { LezioniService }                       from '../lezioni.service';
import { FilesService }                         from '../../pagelle/files.service';
import { AnniScolasticiService }                from '../../anni-scolastici/anni-scolastici.service';
import { DocentiService }                       from '../../docenti/docenti.service';

//models
import { DialogDataDownloadRegistroDocente }    from 'src/app/_models/DialogData';
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { PER_Docente }                          from 'src/app/_models/PER_Docente';

//#endregion

@Component({
  selector: 'app-download-registro-docente',
  templateUrl: './download-registro-docente.component.html',
  styleUrls: ['../lezioni.css'],

})

export class DownloadRegistroDocenteComponent implements OnInit {

//#region ----- Variabili ----------------------

  form!:                                        UntypedFormGroup;
  currMonday!:                                  Date;
  // obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>; 
  obsDocenti$!:                                 Observable<PER_Docente[]>; 

//#endregion

//#region ----- Constructor --------------------

  constructor( public _dialogRef: MatDialogRef<DownloadRegistroDocenteComponent>,
               private svcLezioni:              LezioniService,  
               private svcFiles:                FilesService,
               private svcDocenti:              DocentiService,        
               @Inject(MAT_DIALOG_DATA) public data: DialogDataDownloadRegistroDocente,
               private fb:                      UntypedFormBuilder  ) {

    _dialogRef.disableClose = true;

    const today = new Date();
    let formattedDate= this.formatDt(Utility.formatDate(today.toISOString(), FormatoData.dd_mm_yyyy));
    this.form = this.fb.group({
      start:                                    [formattedDate, Validators.required],
      end:                                      [formattedDate, Validators.required],
      selectDocente:                            ['', Validators.required],
      // selectAnnoScolastico:                     [1, Validators.required],

      
    });
   }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {

    // this.obsAnni$ = this.svcAnni.list();

    // if (this.data) {
    //   this.form.controls['selectAnnoScolastico'].setValue(this.data.annoID);
    // }
    
    this.obsDocenti$ = this.svcDocenti.list();

  }

//#endregion

//#region ----- Vari metodi --------------------
  downloadRegistro() {

    let docenteID = this.form.controls['selectDocente'].value;
    let start = this.form.controls['start'].value;
    let end = this.form.controls['end'].value;
    console.log(start, end);

    this.svcLezioni.listByDocenteAndDate(docenteID, start, end).subscribe(listalezioni=> 
      {
        console.log (listalezioni);
        this.svcFiles.buildAndGetBase64PadreDoc(this.svcFiles.openXMLPreparaRegistroDocente(listalezioni), "Registro_Docente.docX");
      }
      )

  }



  changedDt(dt: string, control: string){
    if (dt == '' || dt== null || dt == undefined) return;
    let formattedDate = this.formatDt(dt);
    //impostazione della data finale
    this.form.controls[control].setValue(formattedDate, {emitEvent:false});
  }

  formatDt(dt: string): string{

    // console.log ("download-registro - formatDt - dt", dt);
    const parts = dt.split('/'); // Split the input string by '/'
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
  
    // creo la nuova data con i valori estratti (assumendo l'ordine day/month/year)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    // console.log ("download-registro - formatDt - date", date);
    // formatto la data al tipo richiesto dal controllo data ('yyyy-MM-dd')
    let formattedDate = date.toISOString().slice(0, 10);
  
    //piccolo step per evitare che 1/1/2008 diventi 31/12/2007
    formattedDate = Utility.formatDate(date, FormatoData.yyyy_mm_dd);

    //impostazione della data finale
    return formattedDate;
  }


//#endregion
}
