//#region ----- IMPORTS ------------------------

import { Component, Inject, Input, OnInit,  }          from '@angular/core';
import { UntypedFormGroup }                     from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { FormatoData, Utility }                 from '../../utilities/utility.component';

//components

//services
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';

//models
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';

//#endregion

@Component({
  selector: 'app-voti-compito-page',
  templateUrl: './voti-compito-page.component.html',
  styleUrls: ['../lezioni.css']
})
export class VotiCompitoPageComponent implements OnInit {
//#region ----- Variabili ----------------------

  form! :                                       UntypedFormGroup;
  strClasseSezioneAnno!:                        string;
  dtStart!:                                     Date;
  strDtStart!:                                  string;
  strArgomento!:                                string;
//#endregion


//#region ----- Constructor --------------------

constructor(public _dialogRef:                            MatDialogRef<VotiCompitoPageComponent>,
            @Inject(MAT_DIALOG_DATA) public data:         CAL_Lezione,
            private svcClasseSezioneAnno:                 ClassiSezioniAnniService ) { 

}

//#endregion

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {

    if (this.data.classeDocenteMateria.classeSezioneAnnoID != null && this.data.classeDocenteMateria.classeSezioneAnnoID != undefined) {
      this.svcClasseSezioneAnno.get(this.data.classeDocenteMateria.classeSezioneAnnoID).subscribe(
        val => this.strClasseSezioneAnno = val.classeSezione.classe!.descrizione2 + " " + val.classeSezione.sezione
      );
    }
    this.dtStart = new Date (this.data.start);
    this.strDtStart = Utility.formatDate(this.dtStart, FormatoData.yyyy_mm_dd);
  }
  
//#endregion

}
