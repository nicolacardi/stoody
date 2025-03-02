//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { Router }                               from '@angular/router';
import { Observable }                           from 'rxjs';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatTableDataSource }                   from '@angular/material/table';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

//services
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { ClassiSezioniAnniService }             from '../classi-sezioni-anni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';

//#endregion
@Component({
  selector: 'app-classi-sezioni-anni-summary',
  templateUrl: './classi-sezioni-anni-summary.component.html',
  styleUrls: ['../classi.css'],
  standalone: false
})
export class ClassiSezioniAnniSummaryComponent implements OnInit {

//#region ----- Variabili ----------------------
  obsAnni$!:                            Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico

  matDataSource = new MatTableDataSource<CLS_ClasseSezioneAnnoGroup>();
  form! :                               UntypedFormGroup;
  menuTopLeftPosition =  {x: '0', y: '0'} 
  displayedColumns: string[] =  [];
  displayedColumnsClassiSezioniAnniSummary: string[] = [
      "descrizioneBreve",
      "sezione",
      "numAlunni",
      "numMaschi",
      "numFemmine"
  ];
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
//#endregion

//#region ----- Constructor --------------------
  constructor(private svcClassiSezioniAnni:          ClassiSezioniAnniService,
              private svcAnni:            AnniScolasticiService,
              private fb:                 UntypedFormBuilder, 
              private _loadingService:    LoadingService,
              private router:             Router) { 

    let obj = localStorage.getItem('AnnoCorrente');
    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    })
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit(): void {
    this.obsAnni$= this.svcAnni.list();
    this.loadData();

    this.form.controls['selectAnnoScolastico'].valueChanges
    .subscribe(val => {
      this.loadData();
      //this.annoIdEmitter.emit(val);
    })
  }

  loadData() {

    this.displayedColumns = this.displayedColumnsClassiSezioniAnniSummary;
    
    let obsSummary$: Observable<CLS_ClasseSezioneAnnoGroup[]>;
    obsSummary$= this.svcClassiSezioniAnni.listByAnnoGroupByClasse(this.form.controls['selectAnnoScolastico'].value);
    const loadSummary$ =this._loadingService.showLoaderUntilCompleted(obsSummary$);

    loadSummary$.subscribe(
      val => {this.matDataSource.data = val}
    ); 
  }
  
//#endregion

//#region ----- Right Click --------------------
  onRightClick(event: MouseEvent, element: CLS_ClasseSezioneAnnoGroup) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
//#endregion

//#region ----- Altri Metodi -------------------
  getTotal() {
    return this.matDataSource.data.map(t => t.numAlunni).reduce((acc, value) => acc + value, 0)
  }
  getTotalM() {
    return this.matDataSource.data.map(t => t.numMaschi).reduce((acc, value) => acc + value, 0)
  }
  getTotalF() {
    return this.matDataSource.data.map(t => t.numFemmine).reduce((acc, value) => acc + value, 0)
  }

  openGestioneClasse(item: CLS_ClasseSezioneAnno) {
    this.router.navigate(['/coordinatore-dashboard'], { queryParams: { annoID: this.form.controls['selectAnnoScolastico'].value, classeSezioneAnnoID: item.id } });
  }

  openPagamentiClasse(item: CLS_ClasseSezioneAnno) {
    this.router.navigate(['/rette'], { queryParams: {classeSezioneAnnoID: item.id } });
  }
//#endregion
}
