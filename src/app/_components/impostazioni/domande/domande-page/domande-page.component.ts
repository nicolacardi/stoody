//#region ----- IMPORTS ------------------------

import { Component, ViewChild }                 from '@angular/core';

//components
import { DomandeListComponent }                from '../domande-list/domande-list.component';
//#endregion
@Component({
  selector: 'app-domande-page',
  templateUrl: './domande-page.component.html',
  styleUrls: ['../domande.css']
})
export class DomandePageComponent {

  //#region ----- ViewChild Input Output ---------

  @ViewChild(DomandeListComponent) domandeList!: DomandeListComponent; 

  //#endregion

  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.domandeList.addRecord()
  }

}
