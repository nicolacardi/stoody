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
import { ClassiSezioniAnniService }             from '../../classi/classi-sezioni-anni.service';
import { AnniScolasticiService }                from '../../anni-scolastici/anni-scolastici.service';

//models
import { DialogDataDownloadRegistroClasse }     from 'src/app/_models/DialogData';
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_ClasseSezioneAnno }                from 'src/app/_models/CLS_ClasseSezioneAnno';

//#endregion

@Component({
  selector: 'app-download-registro-classe',
  templateUrl: './download-registro-classe.component.html',
  styleUrls: ['../lezioni.css'],

})

export class DownloadRegistroClasseComponent implements OnInit {

//#region ----- Variabili ----------------------

  form!:                                        UntypedFormGroup;
  currMonday!:                                  Date;
  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>; 
  obsClassiSezioniAnni$!:                       Observable<CLS_ClasseSezioneAnno[]>; 

//#endregion

//#region ----- Constructor --------------------

  constructor( public _dialogRef: MatDialogRef<DownloadRegistroClasseComponent>,
               private svcLezioni:              LezioniService,  
               private svcAnni:                 AnniScolasticiService,     
               private svcFiles:                FilesService,

               private svcClassiSezioniAnni:    ClassiSezioniAnniService,        
               @Inject(MAT_DIALOG_DATA) public data: DialogDataDownloadRegistroClasse,
               private fb:                      UntypedFormBuilder  ) {

    _dialogRef.disableClose = true;

    const today = new Date();
    let formattedDate= this.formatDt(Utility.formatDate(today.toISOString(), FormatoData.dd_mm_yyyy));
    this.form = this.fb.group({
      start:                                    [formattedDate, Validators.required],
      end:                                      [formattedDate, Validators.required],
      selectAnnoScolastico:                     [1, Validators.required],
      selectClasseSezioneAnno:                  ['', Validators.required]
      
    });
   }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {

    this.obsAnni$ = this.svcAnni.list();

    if (this.data) {
      this.form.controls['selectAnnoScolastico'].setValue(this.data.annoID);
      this.obsClassiSezioniAnni$ = this.svcClassiSezioniAnni.listByAnno(this.data.annoID);
      this.form.controls['selectClasseSezioneAnno'].setValue(this.data.classeSezioneAnnoID);
    }
    

    this.form.controls['selectAnnoScolastico'].valueChanges.subscribe(val=> {
      this.obsClassiSezioniAnni$ = this.svcClassiSezioniAnni.listByAnno(val);
    }  
    );

  }

//#endregion

//#region ----- Vari metodi --------------------
  downloadRegistro() {
    let CSAID= this.form.controls['selectClasseSezioneAnno'].value;
    let start = this.form.controls['start'].value;
    let end = this.form.controls['end'].value;
    console.log(CSAID, start, end);

    this.svcLezioni.listByCSAAndDate(CSAID, start, end).subscribe(listalezioni=> 
      {
        console.log (listalezioni);
        this.svcFiles.buildAndGetBase64PadreDoc(this.svcFiles.openXMLPreparaRegistroClasse(listalezioni), "Registro_di_Classe.docX");
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
