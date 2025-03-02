//#region ----- IMPORTS ------------------------

import { Component, Input }            from '@angular/core';
import { MatSnackBar }                 from '@angular/material/snack-bar';
import { Observable}                   from 'rxjs';
import { MatTableDataSource }          from '@angular/material/table';
//services
import { PagelleService }              from '../pagelle.service';
import { LoadingService }              from '../../utilities/loading/loading.service';
import { IscrizioniService }           from '../../iscrizioni/iscrizioni.service';
import { CertCompetenzeService }       from '../../procedura-iscrizione/iscrizione-risposte/certcompetenze.service';
import { ConsOrientativiService }      from '../../procedura-iscrizione/iscrizione-risposte/consorientativi.service';

//models
import { CLS_Iscrizione }              from 'src/app/_models/CLS_Iscrizione';
import { DOC_DocsIscrizione }          from 'src/app/_models/DOC_DocsIscrizione';
import { FilesService }                from '../files.service';
import { SnackbarComponent }           from '../../utilities/snackbar/snackbar.component';
import { saveAs }                      from 'file-saver';

//#endregion

@Component({
  selector: 'app-documenti-alunno-list',
  templateUrl: './documenti-alunno-list.component.html',
  styleUrls: ['../pagelle.css'],
  standalone: false
})
export class DocumentiAlunnoListComponent {
  matDataSource =                               new MatTableDataSource<DOC_DocsIscrizione>();
  filterValue = '';       
  displayedColumns:                             string[] =  [

    "annoScolastico", 
    "classe",
    "sezione",
    "dtDocumento",
    "tipo",
    "periodo",
    "statoID",
    "actionsColumn"

  ];

//#region ----- ViewChild Input Output ---------
  @Input('alunnoID') alunnoID!:                 number;
//#endregion


//#region ----- Constructor --------------------

  constructor(private svcIscrizioni:            IscrizioniService,
              private svcFiles:                 FilesService,
              private _loadingService:          LoadingService,
              private _snackBar:                MatSnackBar) { 
  }

  //#endregion

    ngOnInit() {
      this.loadData();
    }

    loadData() {

        if (this.alunnoID) {
          let obsIscrizioni$: Observable<CLS_Iscrizione[]>;
          obsIscrizioni$= this.svcIscrizioni.listByAlunno(this.alunnoID);
          let loadIscrizioni$ =this._loadingService.showLoaderUntilCompleted(obsIscrizioni$);
    
          loadIscrizioni$.subscribe( 
            iscrizioni =>   {
              console.log ("iscrizioni per documenti", iscrizioni);

              let DOC_Documento!: DOC_DocsIscrizione;
              let DOC_DocumentiIscrizione: DOC_DocsIscrizione[] = [];
              let iscrizione!: CLS_Iscrizione;
              for (let i=0; i < iscrizioni.length ; i++){ 
                iscrizione = iscrizioni[i];
                console.log("iscrizione", iscrizione);

                if (iscrizione.pagella1) {
                  DOC_Documento = {
                    docID: iscrizione.pagella1.id!,
                    iscrizioneID: iscrizione.id,
                    classe: iscrizione.classeSezioneAnno.classeSezione.classe?.descrizione!,
                    sezione: iscrizione.classeSezioneAnno.classeSezione.sezione!,
                    annoScolastico: iscrizione.classeSezioneAnno.anno.annoscolastico,
                    dtDocumento : iscrizione.pagella1.dtDocumento!,
                    periodo: 1,
                    tipo: "Pagella",
                    statoID: iscrizione.pagella1.statoID!
                  }
                  DOC_DocumentiIscrizione.push(DOC_Documento);
                }
                if (iscrizione.pagella2) {
                  DOC_Documento = {
                    docID: iscrizione.pagella2.id!,
                    iscrizioneID: iscrizione.id,
                    classe: iscrizione.classeSezioneAnno.classeSezione.classe?.descrizione!,
                    sezione: iscrizione.classeSezioneAnno.classeSezione.sezione!,
                    annoScolastico: iscrizione.classeSezioneAnno.anno.annoscolastico,
                    dtDocumento : iscrizione.pagella2.dtDocumento!,
                    periodo: 2,
                    tipo: "Pagella",
                    statoID: iscrizione.pagella2.statoID!
                  }
                  DOC_DocumentiIscrizione.push(DOC_Documento);
                }
                if (iscrizione.certCompetenze) {
                  DOC_Documento = {
                    docID: iscrizione.certCompetenze.id!,
                    iscrizioneID: iscrizione.id,
                    classe: iscrizione.classeSezioneAnno.classeSezione.classe?.descrizione!,
                    sezione: iscrizione.classeSezioneAnno.classeSezione.sezione!,
                    annoScolastico: iscrizione.classeSezioneAnno.anno.annoscolastico,
                    dtDocumento : iscrizione.certCompetenze.dtDocumento!,
                    periodo: null,
                    tipo: "CertificazioneCompetenze",
                    statoID: iscrizione.certCompetenze.statoID!
                  }
                  DOC_DocumentiIscrizione.push(DOC_Documento);
                }
                if (iscrizione.consOrientativo) {
                  DOC_Documento = {
                    docID: iscrizione.consOrientativo.id!,
                    iscrizioneID: iscrizione.id,
                    classe: iscrizione.classeSezioneAnno.classeSezione.classe?.descrizione!,
                    sezione: iscrizione.classeSezioneAnno.classeSezione.sezione!,
                    annoScolastico: iscrizione.classeSezioneAnno.anno.annoscolastico,
                    dtDocumento : iscrizione.consOrientativo.dtDocumento!,
                    periodo: 0,
                    tipo: "ConsiglioOrientativo",
                    statoID: iscrizione.consOrientativo.statoID!
                  }
                  DOC_DocumentiIscrizione.push(DOC_Documento);
                }
              }
              this.matDataSource.data = DOC_DocumentiIscrizione;
            }
          );
        }

    }


    downloadFile(tipo: string, id:number) {
      console.log("scarico", tipo, id)
      this.svcFiles.getByDocAndTipo(id, tipo).subscribe({
        next: res => {
          console.log("res", res);
          const byteCharacters = atob(res.fileBase64!);                  // Decodifica la stringa base64 in un array di byte
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {       // Crea un array di valori numerici, un elemento dell'array per ogni carattere
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);          //a sua volta byteNumbers viene trascodificato in byteArray
          const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          saveAs(blob, tipo);


        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore di caricamento', panelClass: ['red-snackbar']})
      });
    }
}
