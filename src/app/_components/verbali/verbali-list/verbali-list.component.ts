//#region ----- IMPORTS ------------------------

import { CdkDragDrop, moveItemInArray }         from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild }  from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

//components
import { VerbaleEditComponent }                 from '../verbale-edit/verbale-edit.component';
import { VerbaliFilterComponent }               from '../verbali-filter/verbali-filter.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { VerbaliService }                       from '../verbali.service';
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';

//models
import { DOC_Verbale }                          from 'src/app/_models/DOC_Verbale';
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';

//#endregion
@Component({
  selector: 'app-verbali-list',
  templateUrl: './verbali-list.component.html',
  styleUrls: ['../verbali.css']
})
export class VerbaliListComponent implements OnInit, OnChanges {
  
//#region ----- Variabili ----------------------

  matDataSource =                               new MatTableDataSource<DOC_Verbale>();
  form:                                         UntypedFormGroup;                                  
  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>;           //Serve per la combo anno scolastico
  annoID!:                                      number;

  displayedColumns:                             string[] =  [
    "actionsColumn", 
    "nome",
    "tipoVerbale",
    "dtVerbale",
    "classe",
    "titolo",
  ];



  rptTitle = 'Lista Verbali';
  rptFileName = 'ListaVerbali';
  rptFieldsToKeep  = [
    "dtVerbale"
     ];

  rptColumnsNames  = [
    "data Verbale"
    ];

  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;

  filterValue = '';       //Filtro semplice
  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    nome: '',
    cognome: '',
    tipo: '',
    dtVerbale: '',
    classe: '',
    titolo: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output -------

  @Input() verbaliFilterComponent!:             VerbaliFilterComponent;

  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;
  @ViewChild("filterInput") filterInput!:       ElementRef;


//#endregion  

  constructor(
    private svcVerbali:                         VerbaliService,
    private svcAnni:                            AnniScolasticiService,

    private _loadingService:                    LoadingService,
    public _dialog:                             MatDialog,
    private fb:                                 UntypedFormBuilder, 

  ) {
    let obj = localStorage.getItem('AnnoCorrente');
    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    });




  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    this.obsAnni$= this.svcAnni.list();
    this.loadData();
  }

  ngOnInit(): void{

    //TODO NON FUNZIONA MAI e quindi sempre annoID ha valore 2...

    this.form.controls['selectAnnoScolastico'].valueChanges.subscribe(
      res => {
        // console.log("NON PASSA MAI DI QUA!", res);

        this.loadData();
      }
    );


  }



  loadData() {


    
    this.annoID = this.form.controls['selectAnnoScolastico'].value;
    this.showPageTitle = true;
    this.showTableRibbon = true;
    
    let obsVerbali$: Observable<DOC_Verbale[]>;
    obsVerbali$= this.svcVerbali.listByAnno(this.annoID);
    let loadVerbali$ =this._loadingService.showLoaderUntilCompleted(obsVerbali$);

    loadVerbali$.subscribe( 
      val =>   {
        console.log("verbali-list - loadData - val", val)
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );
  }

//#endregion

//#region ----- Filtri & Sort -------


resetSearch(){
  this.filterInput.nativeElement.value = "";
  this.filterValue = "";
  this.filterValues.filtrosx = "";
}

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {

      let searchTerms = JSON.parse(filter);

      let dtVerbaleddmmyyyy!: string;
      if (data.dtVerbale){
        let dArrN = data.dtVerbale.split("-");
        dtVerbaleddmmyyyy = dArrN[2].substring(0,2)+ "/" +dArrN[1]+"/"+dArrN[0];
      } 
      else 
        dtVerbaleddmmyyyy = '';

      let boolSx =  String(data.persona.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  || String(data.persona.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  || String(data.tipoVerbale.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  || String(dtVerbaleddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                  || String(data.titolo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  || String(data.classeSezioneAnno.classeSezione.classe.descrizione2 + ' ' + data.classeSezioneAnno.classeSezione.sezione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1 ;
      
      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = 
                    String(data.persona.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                    && String(data.persona.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                    && String(data.tipoVerbale.descrizione).indexOf(searchTerms.tipo) !== -1
                    && String(dtVerbaleddmmyyyy).indexOf(searchTerms.dtVerbale) !== -1
                    && String(data.titolo).toLowerCase().indexOf(searchTerms.titolo) !== -1
                    && String(data.classeSezioneAnno.classeSezione.classe.descrizione2 + ' ' + data.classeSezioneAnno.classeSezione.sezione).toLowerCase().indexOf(searchTerms.classe) !== -1;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop -------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '500px',
      data: {
        verbale: null,
        annoID: this.annoID
      }
    };
    const dialogRef = this._dialog.open(VerbaleEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( res => 
      this.loadData()
    );
  }

  openDetail(element: DOC_Verbale){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '500px',
      data: {
        verbale: element,
        annoID: this.annoID
      }
    };
    const dialogRef = this._dialog.open(VerbaleEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( 
      res=> this.loadData()
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

}
