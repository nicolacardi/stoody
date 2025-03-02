import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { ClassiSezioniAnniListComponent } from '../classi-sezioni-anni-list/classi-sezioni-anni-list.component';

@Component({
  selector: 'app-classi-sezioni-anni-page',
  templateUrl: './classi-sezioni-anni-page.component.html',
  styleUrls: ['./../classi.css']
})
export class ClassiPageComponent {


  @ViewChild(ClassiSezioniAnniListComponent) ClassiSezioniAnniListComponent!: ClassiSezioniAnniListComponent; 
  @Input('dove') dove! :                        string;
  constructor() { }

  ngOnChanges() {}
  ngOnInit() {if (this.dove==null || this.dove =='' || this.dove == undefined) {this.dove="segreteria-dashboard"} }

  resetFiltri() { }

  addRecord() {
      this.ClassiSezioniAnniListComponent.addRecord()
  }
  
}
