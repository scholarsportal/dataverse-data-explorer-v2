import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DdiService} from '../ddi.service';

@Component({
  selector: 'app-var-dialog',
  templateUrl: './var-dialog.component.html',
  styleUrls: ['./var-dialog.component.css']
})
export class VarDialogComponent implements OnInit {


  constructor( @Inject(MAT_DIALOG_DATA) public data: any,
               public dialogRef: MatDialogRef<VarDialogComponent>,
               private ddiService: DdiService) { }

  ngOnInit(): void {
  }

  isNote() {
    if (this.data.notes === undefined || this.data.notes['#cdata'] === undefined || this.data.notes['#cdata'].trim().length === 0) {
      return false;
    } else {
      return true;
    }
  }

  hasWeghtedVar() {
    if (this.data['@wgt-var'] === undefined || this.data['@wgt-var'].trim().length === 0) {
      return false;
    } else {
      return true;
    }
  }

  isWeight() {
    if (this.data['@wgt'] === undefined || this.data['@wgt'].trim().length === 0) {
      return false;
    } else {
      return true;
    }
  }

}
