//#region ----- IMPORTS ------------------------
import { Component, ViewChild }                 from '@angular/core';

//components
import { RisorseListComponent }             from '../risorse-list/risorse-list.component';
//#endregion
@Component({
  selector: 'app-risorse-page',
  templateUrl: './risorse-page.component.html',
  styleUrls: ['../risorse.css']
})
export class RisorsePageComponent {

  //#region ----- ViewChild Input Output ---------

  @ViewChild(RisorseListComponent) risorseList!: RisorseListComponent; 

  //#endregion

  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.risorseList.addRecord()
  }

}
