//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatTableDataSource }                   from '@angular/material/table';
import { firstValueFrom, iif, Observable }                      from 'rxjs';
import { concatMap, map, tap }                  from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { VotiObiettiviEditComponent }           from '../voti-obiettivi-edit/voti-obiettivi-edit.component';
import { FormatoData, Utility }                 from '../../utilities/utility.component';
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { PagellaVotiService }                   from '../pagella-voti.service';
import { PagelleService }                       from '../pagelle.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { FilesService }                         from '../files.service';

//classes
import { DOC_Pagella }                          from 'src/app/_models/DOC_Pagella';
import { DOC_PagellaVoto, DOC_TipoGiudizio }    from 'src/app/_models/DOC_PagellaVoto';
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { RPT_TagDocument }                      from 'src/app/_models/RPT_TagDocument';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { RisorseCSAService } from '../../impostazioni/risorse-csa/risorse-csa.service';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

//#endregion
@Component({
  selector: 'app-pagella-voto-edit',
  templateUrl: './pagella-voto-edit.component.html',
  styleUrls: ['../pagelle.css']
})

export class PagellaVotoEditComponent implements OnInit  {
  
//#region ----- Variabili ----------------------
  matDataSource = new                           MatTableDataSource<DOC_PagellaVoto>();
  obsTipiGiudizio$!:                            Observable<DOC_TipoGiudizio[]>;
  showPageTitle:                                boolean = true;
  lstPagellaVoti!:                              DOC_PagellaVoto[];
  iscrizione!:                                  CLS_Iscrizione;
  classeSezioneAnnoID!:                         number;
  pagella!:                                     DOC_Pagella;
  headerRows!:                                  string[];
  displayedColumns!:                            string[];
  chiusa = false;
  form! :                                       UntypedFormGroup;


  displayedColumnsQ1: string[] = [
    "materia", 
    "multiVoto",
    "note"
  ];

  displayedColumnsQ2: string[] = [
    "multiVoto",
    "note"
  ];
//#endregion  

//#region ----- ViewChild Input Output ---------
  @Input('iscrizioneID') iscrizioneID!:         number;
  @Input('periodo') periodo!:                   number;

  @Output('reloadParent') reloadParent = new EventEmitter(); //EMESSO quando si chiude la dialog obiettivo
//#endregion

//#region ----- Constructor --------------------

  constructor(private svcPagelle:               PagelleService,
              private svcFiles:                 FilesService,
              private svcRisorseCSA:            RisorseCSAService,
              private svcPagellaVoti:           PagellaVotiService,
              private svcIscrizioni:            IscrizioniService,
              private _loadingService:          LoadingService,
              private fb:                       UntypedFormBuilder, 
              private _snackBar:                MatSnackBar,
              public _dialog:                   MatDialog ) {
                
    this.form = this.fb.group(
      {
        dtDocumento:                            [null],
        giudizioQuad:                           ['']
      });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {
    if (this.iscrizioneID != undefined && this.periodo != undefined  && this.iscrizioneID !=0) 
    {
      this.loadData();

      this.svcIscrizioni.get(this.iscrizioneID).subscribe(res => {
        this.iscrizione = res;
      });
      
      //mi servirà anche la classeSezioneAnnoID
      this.svcIscrizioni.get(this.iscrizioneID).subscribe(iscrizione => {this.classeSezioneAnnoID = iscrizione.classeSezioneAnnoID});

      this.svcPagelle.listByIscrizione(this.iscrizioneID).pipe (
      map(val=>val.filter(val=>(val.periodo == this.periodo)))).subscribe(
        val =>  {
          //console.log ("pagella-voto-edit - ngOnChanges - pagella", val);
          console.log ("pagella-voto-edit - loadData - pagella:", this.pagella);
          if (val.length != 0)  {
            this.pagella = val[0];
            this.chiusa = this.pagella.statoID! >= 2? true : false;
            this.chiusa? this.form.controls['dtDocumento'].disable(): this.form.controls['dtDocumento'].enable();
            this.chiusa? this.form.controls['giudizioQuad'].disable(): this.form.controls['giudizioQuad'].enable()

            this.form.controls['dtDocumento'].setValue(val[0].dtDocumento);
            this.form.controls['giudizioQuad'].setValue(val[0].giudizioQuad);
            //this.dtIns = val[0].dtIns!;
          }
          else {
            this.pagella = <DOC_Pagella>{};
            this.pagella.id = -1;
            this.pagella.iscrizioneID = this.iscrizioneID;
            this.pagella.periodo = this.periodo;
            this.pagella.statoID = 1;
            const d = new Date();
            d.setSeconds(0,0);
            let dateNow = d.toISOString().split('.')[0];
            this.pagella.dtIns = dateNow;

            this.form.controls['dtDocumento'].setValue("");
            this.form.controls['giudizioQuad'].setValue("");
            //this.dtIns = '';
          }
        }
      );
    }
    if (this.iscrizioneID ==0)
    {
      this.form.reset();
    } 
  }

  ngOnInit(): void {
    if (this.periodo == 1) { 
      this.headerRows = ['header-row-blank', 'header-row-Quad'];
      this.displayedColumns = this.displayedColumnsQ1
    } else {
      this.headerRows = ['header-row-Quad'];
       this.displayedColumns = this.displayedColumnsQ2
    }
  }

  loadData () {
    this.obsTipiGiudizio$= this.svcPagellaVoti.listTipiGiudizio();

    let obsPagellaVoti$: Observable<DOC_PagellaVoto[]>;
    obsPagellaVoti$ = this.svcPagellaVoti.listByIscrizionePeriodo(this.iscrizioneID, this.periodo);

    let loadPagella$ =this._loadingService.showLoaderUntilCompleted(obsPagellaVoti$);
    loadPagella$.subscribe(val => { 
      // console.log("pagella-voto-edit - loadData - val");
      // console.log(val);
      this.lstPagellaVoti = val;
      this.matDataSource.data = val ;

    });
  }

//#endregion


//#region ----- Operazioni CRUD ----------------


  savePagella() {
    //nel caso la pagella ancora non sia stata creata, va inserita
    if (this.pagella.id == -1) {
      // console.log("pagella voto-edit - savePagella - Pagella.id = -1: Non C'è una Pagella --->post pagella e poi postpagellaVoto");
      // console.log("pagella voto-edit - savePagella - this.pagella:", this.pagella);
      this.svcPagelle.post(this.pagella).subscribe() 
    }
    else {    //caso pagella già presente
      this.svcPagelle.put(this.pagella).subscribe() 
    }
  }

  savePagellaVoto (pagellaVoto: DOC_PagellaVoto) {
    //la save viene scatenata ogni volta che cambia un voto o commento/nota (vedi sotto, cerca this.save...)
    //pulizia forminput da oggetti composti
    delete pagellaVoto.iscrizione;
    delete pagellaVoto.materia;
    delete pagellaVoto.tipoGiudizio;
    delete pagellaVoto._ObiettiviCompleti;

    //nel caso la pagella ancora non sia stata creata, va inserita
    if (this.pagella.id == -1) {
      // console.log("pagella voto-edit - savePagellaVoto - Pagella.id = -1: Non C'è una Pagella --->post pagella e poi postpagellaVoto");
      // console.log("pagella voto-edit - savePagellaVoto - this.pagella:", this.pagella);
      this.svcPagelle.post(this.pagella)
        .pipe (
          tap( x =>  {
            pagellaVoto.pagellaID = x.id! 
          } ),
          concatMap( () =>   
            iif( () => pagellaVoto.id == 0 || pagellaVoto.id == undefined,
              this.svcPagellaVoti.post(pagellaVoto),
              this.svcPagellaVoti.put(pagellaVoto)
          )
        )
      ).subscribe() 
    }
    else {    //caso pagella già presente
      if (pagellaVoto.id == 0) {
        this.svcPagellaVoti.post(pagellaVoto).subscribe({
          next: res => this.loadData() ,
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio post', panelClass: ['red-snackbar']})
        })
      } 
      else {
        this.svcPagellaVoti.put(pagellaVoto).subscribe({
          next: res => { },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio put', panelClass: ['red-snackbar']})
        })
      }
    }
  }

//#endregion

//#region ----- Altri metodi -------------------

  changeSelectGiudizio(pagellaVoto: DOC_PagellaVoto, tipoGiudizioID: number) {

    pagellaVoto.pagellaID = this.pagella.id;

    if (pagellaVoto.tipoGiudizioID == null) 
    pagellaVoto.tipoGiudizioID = 1;
    pagellaVoto.tipoGiudizioID = tipoGiudizioID;

    let pagellaVoto2 = Object.assign({}, pagellaVoto);
    this.savePagellaVoto(pagellaVoto2)
  }

  changeVoto(pagellaVoto: DOC_PagellaVoto, voto: any) {

    pagellaVoto.pagellaID = this.pagella.id;

    let votoN = parseInt(voto);
    if (votoN >10 ) votoN = 10
    if (votoN <0 )  votoN = 0
    pagellaVoto.voto = votoN;

    if (pagellaVoto.tipoGiudizioID == null) 
      pagellaVoto.tipoGiudizioID = 1;

    let pagellaVoto2 = Object.assign({}, pagellaVoto);
    this.savePagellaVoto(pagellaVoto2)
  }

  changeNote(pagellaVoto: DOC_PagellaVoto, note: string) {
    
    pagellaVoto.pagellaID = this.pagella.id;;

    pagellaVoto.note = note;

    if (pagellaVoto.tipoGiudizioID == null) 
    pagellaVoto.tipoGiudizioID = 1;

    let pagellaVoto2 = Object.assign({}, pagellaVoto);
    this.savePagellaVoto(pagellaVoto2)
  }

  changeData(event: any) {
    this.pagella.dtDocumento = Utility.formatDate(event.target.value, FormatoData.yyyy_mm_dd);
    this.savePagella();
  }

  changeGiudizioQuad(event: any) {
    this.pagella.giudizioQuad = event?.target.value;
    this.savePagella();
  }

  openObiettivi(element: DOC_PagellaVoto) {

    const dialogConfig : MatDialogConfig = {
    panelClass: 'add-DetailDialog',
    width: '600px',
    height: '300px',
    data: {
        iscrizioneID:         this.iscrizioneID,
        pagellaID:            this.pagella.id,
        periodo:              this.periodo,
        pagellaVotoID:        element.id,
        materiaID:            element.materiaID,
        classeSezioneAnnoID:  this.classeSezioneAnnoID,
        chiusa:               this.chiusa
      }
    }
    
    const dialogRef = this._dialog.open(VotiObiettiviEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( 
      () => { 
        this.reloadParent.emit();
        this.loadData(); 
      });
  }
  
  chiudiDocumento() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "CHIUSURA DELLA PAGELLA", sottoTitolo: "Questa operazione è IRREVERSIBILE.<br>Non sarà più possibile modificare i voti.<br>Si conferma?"}
    });
    dialogYesNo.afterClosed().subscribe(result => {

      if(result) {
        this.svcPagelle.completa(this.pagella.id!).subscribe();
        this.chiusa = true;
        this.form.controls['dtDocumento'].disable();
        this.form.controls['giudizioQuad'].disable();
      }

    });
  }

  apriDocumento() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "APERTURA DELLA PAGELLA", sottoTitolo: "Operazione consentita solo agli IT Administrator...Qui serve una password."}
    });
    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {
        this.svcPagelle.riapri(this.pagella.id!).subscribe();
        this.chiusa = false;
        this.form.controls['dtDocumento'].enable();
        this.form.controls['giudizioQuad'].enable();

      }
    });
  }



  async downloadPreviewPagella() {
    let nomeFile: string;
    let template!: string;
    nomeFile = "PREVIEW_Pagella"  + '_' + this.iscrizione.classeSezioneAnno.anno.annoscolastico + "(" + this.periodo +"quad)_" + this.iscrizione.alunno.persona.cognome + ' ' + this.iscrizione.alunno.persona.nome + '.docx';    
    await firstValueFrom(this.svcRisorseCSA.getByTipoDocCSA(1, this.iscrizione.classeSezioneAnnoID)
      .pipe(
        tap(res=> {
          if (res) template= res.risorsa!.nomeFile
          })
      )
    );

    if (template== null || template == undefined || template == '') {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Non sembra disponibile un template per questa classe"}
      });
      return;
    }
    
    this.svcFiles.buildAndGetBase64(this.svcFiles.openXMLPreparaPagella(template, this.iscrizione, this.lstPagellaVoti, this.pagella), nomeFile );
  }
  

//#endregion
}