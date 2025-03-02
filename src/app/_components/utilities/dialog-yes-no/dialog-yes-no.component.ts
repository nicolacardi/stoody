import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogData } from 'src/app/_models/DialogData';
@Component({
  selector: 'app-dialog-yes-no',
  templateUrl: './dialog-yes-no.component.html',
  styleUrls: ['./dialog-yes-no.component.css']
})

export class DialogYesNoComponent   {

  constructor( public dialogRef: MatDialogRef<DialogYesNoComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {

    }
}
