import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatDrawer }                            from '@angular/material/sidenav';
import { Observable }                           from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';

//components
import { VerbaliFilterComponent }                  from '../verbali-filter/verbali-filter.component';
import { VerbaliListComponent }                    from '../verbali-list/verbali-list.component';

//services
import { NavigationService }                    from '../../utilities/navigation/navigation.service';
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';

//models
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';


@Component({
  selector: 'app-verbali-page',
  templateUrl: './verbali-page.component.html',
  styleUrls: ['../verbali.css']
})

export class VerbaliPageComponent implements OnInit {

  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>;     
  // form! :                                       UntypedFormGroup;
  annoID!:                                       number;
//#region ----- ViewChild Input Output -------
  @ViewChild(VerbaliListComponent) verbaliList!: VerbaliListComponent; 
  @ViewChild(VerbaliFilterComponent) verbaliFilterComponent!: VerbaliFilterComponent; 
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;

  @Input('classeSezioneAnnoID') classeSezioneAnnoID!:         number;
  @Input('dove') dove! :                        string;
  @Input('docenteID') docenteID!:               number;


//#endregion

  constructor(
    private _navigationService:                 NavigationService,
    private svcAnni:                            AnniScolasticiService,
    // private fb:                                   UntypedFormBuilder 
  ) {

    // let objAnno = sessionStorage.getItem('AnnoCorrente');
    // this.form = this.fb.group( {
    //   selectAnnoScolastico:  + (JSON.parse(objAnno!) as _UT_Parametro).parValue,
    // });
  }

//#region ----- LifeCycle Hooks e simili-------
  
  ngOnInit() {
    this._navigationService.passPage("verbaliPage");
    this.obsAnni$ = this.svcAnni.list();
  }

//#endregion

//#region ----- Add Edit Drop -------
  addRecord() {
    this.verbaliList.addRecord()
  }
//#endregion

//#region ----- Reset vari -------
  resetFiltri() {
    this.verbaliFilterComponent.resetAllInputs();
  }
//#endregion

//#region ----- Altri metodi -------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
  }
//#endregion
}
