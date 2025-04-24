//#region ----- IMPORTS ------------------------

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { MatSelect }                            from '@angular/material/select';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatSort }                              from '@angular/material/sort';
import { finalize }                             from 'rxjs/operators';
import { ActivatedRoute }                       from '@angular/router';
import { SelectionModel }                       from '@angular/cdk/collections';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//components
import { ClasseSezioneAnnoEditComponent }       from '../classe-sezione-anno-edit/classe-sezione-anno-edit.component';
import { ClassiSezioniAnniFilterComponent }     from '../classi-sezioni-anni-filter/classi-sezioni-anni-filter.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { ClassiSezioniAnniService }             from '../classi-sezioni-anni.service';
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { DocentiService }                       from '../../docenti/docenti.service';

//classes
import { User }                                 from 'src/app/_user/Users';
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { PER_Docente }                          from 'src/app/_models/PER_Docente';
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';
import { RisorseCSAListEditComponent }          from '../../impostazioni/risorse-csa/risorse-csa-list-edit/risorse-csa-list-edit.component';

//#endregion
@Component({
  selector: 'app-classi-sezioni-anni-list',
  templateUrl: './classi-sezioni-anni-list.component.html',
  styleUrls: ['./../classi.css'],
  standalone: false
})

export class ClassiSezioniAnniListComponent implements OnInit {

//#region ----- Variabili ----------------------
  currUser!:                                    User;

  matDataSourceIscrizioni =                     new MatTableDataSource<CLS_ClasseSezioneAnno>();
  matDataSource =                               new MatTableDataSource<CLS_ClasseSezioneAnnoGroup>();

  displayedColumns:                             string[] =  [];

  displayedColumnsCoordinatoreDashBoard:              string[] =  [
    "descrizione",
    "sezione",
    "numAlunni"
  ];

  displayedColumnsSegreteriaDashboard:                   string[] =  [
    "descrizione",
    "sezione",
    "numAlunni",

    "numStato10",
    "numStato20",
    "numStato30",
    "numStato40",
    "numStato50",
    "numStato60",
    "numStato70",
    "numStato80",
  ];


  displayedColumnsImpostazioni:                 string[] =  [
    "actionsColumn",
    "documents",
    "descrizione",
    "sezione",
    "numAlunni",

    "descrizioneAnnoSuccessivo",
    "sezioneAnnoSuccessivo"
  ];

  displayedColumnsAlunnoEdit:               string[] =  [
    "descrizione",
    "sezione",
    "addToAttended"
  ];


  displayedColumnsRettaCalcolo:                 string[] =  [
    "descrizione",
    "sezione",
    "numAlunni",
    //"numStato20Highlight",
    "numStato30Highlight",
    "importo",
    "importo2",
    "select",
  ];

  rptTitle = 'Lista Classi';
  rptFileName = 'ListaClassi';
  rptFieldsToKeep  = [
    "descrizione2",
    "sezione",
    "numAlunni",
    "numStato10",
    "numStato20",
    "numStato30",
    "numStato40",
    "numStato50",
    "numStato60",
    "numStato70",
    "numStato80"

  ];

  rptColumnsNames  = [
    "descrizione",
    "sezione",
    "numero alunni",
    "Stato 10",
    "Stato 20",
    "Stato 30",
    "Stato 40",
    "Stato 50",
    "Stato 60",
    "Stato 70",
    "Stato 80"
  ];

  selection =                                   new SelectionModel<CLS_ClasseSezioneAnnoGroup>(true, []);   //rappresenta la selezione delle checkbox
  
  toggleChecks:                                 boolean = false;
  public ckSoloAttivi :                         boolean = true;

  annoIDrouted!:                                string; //Da routing
  docenteIDrouted!:                             string; //Da routing
  classeSezioneAnnoIDrouted!:                   number; //Da routing

  docenteID!:                                   number;
  
  classeSezioneAnnoID!:                         number;
  classeSezioneAnno!:                           CLS_ClasseSezioneAnno;

  showSelectDocente:                            boolean = true;

  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;

  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>;     
  obsDocenti$!:                                 Observable<PER_Docente[]>;

  form! :                                       UntypedFormGroup;
  public showProgress=                          false;
  selectedRowIndex = -1;

  filterValue = '';       //Filtro semplice

  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    classe: '',
    sezione: '',
    filtrosx: ''
  };
    
//#endregion

//#region ----- ViewChild Input Output ---------
  
  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;
  @ViewChild("filterInput") filterInput!:       ElementRef;  
  @ViewChild('selectAnnoScolastico') selectAnnoScolastico!:       MatSelect; 

  @ViewChildren("endedIcons", { read: ElementRef }) endedIcons!:  QueryList<ElementRef>   //elenco delle icone di fine procedura
  //@ViewChildren("ckSelected", { read: ElementRef }) ckSelected!:  QueryList<ElementRef>   //elenco delle icone di fine procedura)
  //@ViewChildren ('ckSelected' ) ckSelected!:QueryList<any>;
  
  @Input('dove') dove! :                        string;
  @Input('alunnoID') alunnoID! :                number;
  @Input() classiSezioniAnniFilterComponent!:   ClassiSezioniAnniFilterComponent;

  @Output('annoID') annoIdEmitter = new EventEmitter<number>(); //annoId viene EMESSO quando si seleziona un anno dalla select
  @Output('classeSezioneAnnoID') classeSezioneAnnoIDEmitter = new EventEmitter<number>(); //classeId viene EMESSO quando si clicca su una classe
  @Output('docenteId') docenteIdEmitter = new EventEmitter<number>(); //docenteId viene EMESSO quando si seleziona un docente dalla select

  @Output('addToAttended') addToAttended = new EventEmitter<CLS_ClasseSezioneAnnoGroup>(); //EMESSO quando si clicca sul (+) di aggiunta alle classi frequentate

//#endregion

//#region ----- Constructor --------------------
  constructor(private svcClassiSezioniAnni:     ClassiSezioniAnniService,
              private svcAnni:                  AnniScolasticiService,
              private svcDocenti:               DocentiService,
              private _loadingService:          LoadingService,
              private fb:                       UntypedFormBuilder, 
              public _dialog:                   MatDialog, 
              private actRoute:                 ActivatedRoute,
              private _snackBar:                MatSnackBar ) {

    
    this.currUser = Utility.getCurrentUser();
    let objAnno = sessionStorage.getItem('AnnoCorrente');

    this.form = this.fb.group( {
      selectAnnoScolastico:  + (JSON.parse(objAnno!) as _UT_Parametro).parValue,
      selectDocente: 0
    });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------
 
  ngOnInit() {

    //vede se arriva qualcosa dal actRouter
    this.actRoute.queryParams.subscribe(
      params => {
          this.annoIDrouted = params['annoID'];     
          this.docenteIDrouted = params['docenteID'];   
          this.classeSezioneAnnoIDrouted = params['classeSezioneAnnoID'];  
    });
    
    //prepara anni
    this.obsAnni$ = this.svcAnni.list()
      .pipe(
        finalize( () => {
            if (this.annoIDrouted) this.form.controls['selectAnnoScolastico'].setValue(parseInt(this.annoIDrouted));
          }
        )
      );

    //se cambia anno
    this.form.controls['selectAnnoScolastico'].valueChanges.subscribe(
      res => {
        this.loadData();
        this.annoIdEmitter.emit(res);
        this.resetSelections();                 //vanno resettate le selezioni delle checkbox e masterToggle
        this.toggleChecks = false;
      }
    );
    //emette anno all'inizio...NON INIBIRE! non funzionerebbe l'aggiunta di un alunno a una classe in quanto non saprebbe l'annoID
    this.annoIdEmitter.emit(this.form.controls['selectAnnoScolastico'].value);


    this.showPageTitle = false;
    this.showTableRibbon = false;
    this.showSelectDocente = false;

    //in tutti i casi meno che nell'utlimo devo anche procedere alla loadData
    switch(this.dove) {
      case 'alunno-edit':
        this.displayedColumns = this.displayedColumnsAlunnoEdit;
        this.loadData();
        break;
      case 'coordinatore-dashboard':
      case 'orario-page':
        this.displayedColumns = this.displayedColumnsCoordinatoreDashBoard;
        this.loadData();
        break;
      case 'segreteria-dashboard':
          this.displayedColumns = this.displayedColumnsSegreteriaDashboard;
          this.showPageTitle = true;
          this.showTableRibbon = true;
          this.loadData();
          break;
      case 'impostazioni':
          this.displayedColumns = this.displayedColumnsImpostazioni;
          this.showPageTitle = false;
          this.showTableRibbon = true;
          this.loadData();
          break;
      case 'retta-calcolo':
          this.displayedColumns = this.displayedColumnsRettaCalcolo;
          this.loadData();
          break;
      case 'docenti-dashboard':

      
        //docenti-dashboard è l'unico caso in cui c'è anche la combo Docente che rende questo caso più articolato
        //Si noti che NON termina con loadData

          //prepara docenti
          this.obsDocenti$ = this.svcDocenti.list();

          //se cambia docente
          this.form.controls['selectDocente'].valueChanges.subscribe(
            res => {
              this.loadData();
              this.docenteIdEmitter.emit(res);
              this.resetSelections();                 //vanno resettate le selezioni delle checkbox e masterToggle
              this.toggleChecks = false;
            }
          );
        //emette docente all'inizio (FORSE NON SERVE) NC 21/09/24
        //this.docenteIdEmitter.emit(this.form.controls['selectDocente'].value);



        this.displayedColumns = this.displayedColumnsCoordinatoreDashBoard;
        this.showSelectDocente = true;


        if(this.currUser != undefined && this.currUser.personaID != undefined && this.currUser.personaID != 0) {

          this.svcDocenti.getByPersona(this.currUser.personaID).subscribe ( {
            next: res => {   
              if(res){
                // L'utente è un docente: imposto il docente uguale a se stesso e disabilito la combo docenti
                // a meno che non sia anche Coordinatore didattico
                this.docenteID = res.id;
                this.form.controls['selectDocente'].setValue(this.docenteID);
                if (!this.currUser.persona?._LstRoles!.includes('CoordDidattico')) this.form.controls['selectDocente'].disable(); 
              }
              else {
                this.obsDocenti$.subscribe((docenti) => {
                  if (docenti.length > 0) {
                    //Se volessi impostare il primo elemento come valore predefinito
                    //this.docenteID = docenti[0].id;
                    //this.form.controls['selectDocente'].setValue(docenti[0].id);

                    //Così invece NON imposto alcun docente
                    this.docenteID = 0;
                    this.form.controls['selectDocente'].setValue(this.docenteID);
                  }
                });
              }
            },
            error: err=> {
              this.docenteID = 0;
            }
          });
        } 
        else 
          this.form.controls['selectDocente'].setValue(0);
        break;          


      default: this.displayedColumns = this.displayedColumnsCoordinatoreDashBoard;
    }
  }


  loadData () {
    // console.log("classi-sezioni-anni-list - loadData - ", this.dove);
    let annoID: number;
    annoID = this.form.controls["selectAnnoScolastico"].value;

    let docenteID: number;
    docenteID = this.form.controls["selectDocente"].value;
    // console.log("docente ID", docenteID);
    if(this.dove !="docenti-dashboard" || docenteID>0){  //qualora ci sia la selectDocente (docenti-dashboard) deve essere valorizzata
      let obsClassi$: Observable<CLS_ClasseSezioneAnnoGroup[]>;
      obsClassi$= this.svcClassiSezioniAnni.listByAnnoDocenteGroupByClasse(annoID, docenteID);
      
      const loadClassi$ =this._loadingService.showLoaderUntilCompleted(obsClassi$);

      loadClassi$.subscribe( val =>   {
        //console.log("classi-sezioni-anni-list - loadData val", val);
        this.matDataSource.data = val;
        if (this.dove == "impostazioni" || this.dove == "segreteria-dashboard") {
          this.matDataSource.paginator = this.paginator;
          this.sortCustom(); 
          this.matDataSource.sort = this.sort; 
          this.matDataSource.filterPredicate = this.filterPredicate();
        }

        //ora se ci sono record e se è arrivato un valore di classe seleziono quello
        //se ci sono record e non è arrivato un valore seleziono il primo
        //se non ci sono record non ne seleziono alcuno
        if(this.matDataSource.data.length >0){
          if (this.classeSezioneAnnoIDrouted) 
            this.rowclicked(this.classeSezioneAnnoIDrouted);  
          else
            this.rowclicked(this.matDataSource.data[0].id); //così seleziona la prima riga
        }
        else
          this.rowclicked(undefined);
      });
    }
  }

  rowclicked(classeSezioneAnnoID?: number ){

    //il click su una classe deve essere trasmesso su al parent
    this.classeSezioneAnnoID = classeSezioneAnnoID!;
    //per potermi estrarre seq in iscrizioni-classe-calcolo mi preparo qui il valore della classe
    if (classeSezioneAnnoID) {this.svcClassiSezioniAnni.get(this.classeSezioneAnnoID).subscribe(val=>this.classeSezioneAnno = val);} 

    if(classeSezioneAnnoID!= undefined && classeSezioneAnnoID != null)
      this.selectedRowIndex = classeSezioneAnnoID;
    else 
      if(this.matDataSource.data[0])
        this.selectedRowIndex = this.matDataSource.data[0].id;
      else
        this.selectedRowIndex = 0;

    this.classeSezioneAnnoIDEmitter.emit(this.selectedRowIndex);
  }

//#endregion

//#region ----- Emit per alunno-edit -----------

  addToAttendedEmit(item: CLS_ClasseSezioneAnnoGroup) {
    this.addToAttended.emit(item);
  }

//#endregion

//#region ----- Filtri & Sort ------------------

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      let boolSx = String(data.descrizione2).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.sezione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;;

      let boolDx = String(data.descrizione2).toLowerCase().indexOf(searchTerms.classe) !== -1
                && String(data.sezione).toLowerCase().indexOf(searchTerms.sezione) !== -1;

      return boolDx && boolSx;
    }
    return filterFunction;
  }


// filterPredicateCustom(){
//   //questa funzione consente il filtro ANCHE sugli oggetti della classe
//   //https://stackoverflow.com/questions/49833315/angular-material-2-datasource-filter-with-nested-object/49833467
//   this.matDataSource.filterPredicate = (data, filter: string)  => {
//     const accumulator = (currentTerm: any, key: any) => { //Key è il campo in cui cerco
//       switch(key) { 
//         case "classeSezione": { 
//           return currentTerm + data.classeSezione.sezione + data.classeSezione.classe.descrizione2 ; 
//            break; 
//         } 
//         case "classeSezioneAnnoSucc": { 

//           return currentTerm + 
//           ((data.ClasseSezioneAnnoSucc == null) ? "" : data.ClasseSezioneAnnoSucc.classeSezione.sezione) + 
//           ((data.ClasseSezioneAnnoSucc == null) ? "" : data.ClasseSezioneAnnoSucc.classeSezione.classe.descrizione2);
//            break; 
//         } 

//         default: { 
//         //   return currentTerm + data.importo + data.dtPagamento; 
//         return currentTerm;  //di qua non passerà mai
//            break; 
//         } 
//      } 
//     };
//     const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
//     const transformedFilter = filter.trim().toLowerCase();
//     return dataStr.indexOf(transformedFilter) !== -1;
//   };
// }

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        //case 'annoscolastico':              return item.annoScolastico;
        case 'sezione':                     return item.sezione;
        case 'descrizione':                 return item.descrizione2;
        case 'descrizioneBreve':            return item.descrizioneBreve;
        case 'numAlunni':                   return item.numAlunni;

        //case 'seq':                         return item.classeSezione.classe.seq;
        default: return item[property]
      }
    };
  }
//#endregion

//#region ----- Add Edit Drop ------------------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '400px',
      data: 0
    };
    const dialogRef = this._dialog.open(ClasseSezioneAnnoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  openDetail(classeSezioneAnnoID:any) {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '400px',
      data: classeSezioneAnnoID
    };

    const dialogRef = this._dialog.open(ClasseSezioneAnnoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() =>  this.loadData());
  }

  openDetailDocs(classeSezioneAnno:CLS_ClasseSezioneAnno) {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '400px',
      data: classeSezioneAnno
    };

    const dialogRef = this._dialog.open(RisorseCSAListEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() =>  this.loadData());
  }

  updateImporto(element: CLS_ClasseSezioneAnno, value: any) {

    element.classeSezione.classe!.importo = parseFloat(value);

    this.svcClassiSezioniAnni.put(element).subscribe({
      next: res=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Importo salvato', panelClass: ['green-snackbar']}),  //MOSTRA ESITO OK MA NON SALVA,
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    }); 
  }
//#endregion

//#region ----- Gestione Campo Checkbox --------
  selectedRow(element: CLS_ClasseSezioneAnnoGroup) {
      this.selection.toggle(element);
  }

  masterToggle() {
    this.toggleChecks = !this.toggleChecks;

    if (this.toggleChecks) {
      const visibleData = this.matDataSource.filteredData || this.matDataSource.data;
      //this.selection.select(...visibleData.filter(x=> (x.numAlunni != 0 && x.numAlunni != x.numStato20))); //YUHUUU!
      this.selection.select(...visibleData.filter(x=> (x.numAlunni != 0 && x.numAlunni > x.numStato30))); //YUHUUU!

    } else 
      this.resetSelections();
  }

  resetSelections() {
    this.selection.clear();
    this.matDataSource.data.forEach(row => this.selection.deselect(row));
  }

  toggleAttivi(){
    this.ckSoloAttivi = !this.ckSoloAttivi;
    this.loadData();
  }

  getChecked() {
    //funzione usata da classi-dahsboard
    return this.selection.selected;
  }

    //non so se serva questo metodo: genera un valore per l'aria-label...
  //forse serve per poi pescare i valori selezionati?
  checkboxLabel(row?: CLS_ClasseSezioneAnnoGroup): string {
    if (!row) 
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    else
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  //questo metodo ritorna un booleano che dice se sono selezionati tutti i record o no
  //per ora non lo utilizzo
  isAllSelected() {
    const numSelected = this.selection.selected.length;   //conta il numero di elementi selezionati
    const numRows = this.matDataSource.data.length;       //conta il numero di elementi del matDataSource
    return numSelected === numRows;                       //ritorna un booleano che dice se sono selezionati tutti i record o no
  }

  isNoneSelected() {
    const numSelected = this.selection.selected.length;   //conta il numero di elementi selezionati
    return numSelected === 0;                       //ritorna un booleano che dice se sono selezionati tutti i record o no
  }
//#endregion

//non chiaro ma compareWith= compareObjects consente di impostare correttamente il valore di default NC 120123
  compareObjects(o1: any, o2: any): boolean {
    //console.log ("compareObjects, o1, o2", o1, o2);
    return o1.name === o2.name && o1.id === o2.id;
  }

}


