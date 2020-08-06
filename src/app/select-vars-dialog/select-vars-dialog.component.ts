import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CrossTabDialogComponent} from '../cross-tab-dialog/cross-tab-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-select-vars-dialog',
  templateUrl: './select-vars-dialog.component.html',
  styleUrls: ['./select-vars-dialog.component.css']
})
export class SelectVarsDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<SelectVarsDialogComponent>,
              public dialog: MatDialog,
              public snackBar: MatSnackBar,
              private translate: TranslateService) { }

  selectedVarsCol = [];
  selectedVarsRow = [];
  selectedOptions = [];
  selectedOption;
  selectedOptionsRow = [];
  selectedOptionRow;
  selectedOptionsCol = [];
  selectedOptionCol;
  variablesToSelect = [];
  dirRow: number;
  dirCol: number;
  public crossTabDialogRef: MatDialogRef<CrossTabDialogComponent>;
  maxSelectedVars: number;
  title: string;

  ngOnInit(): void {
    this.variablesToSelect = this.data.varArray;
    const group = this.data.grpTitle;
    this.title = this.translate.instant('CROSSTAB.VARS', {group});
    this.dirRow = 0;
    this.dirCol = 0;
    this.variablesToSelect.sort((a, b) => a['@name'].localeCompare(b['@name']));
    this.maxSelectedVars = 6;
  }

  onMoveToRows() {
    if (typeof this.selectedOption !== 'undefined' && this.selectedOption !== null && this.selectedOption.length > 0) {
      this.selectedVarsRow = this.selectedVarsRow.concat(this.selectedOption);
      this.variablesToSelect = this.variablesToSelect.filter((row) =>
        !this.selectedOption.includes(row)); // remove selectedOption array from variablesToSelect
      this.selectedOptions = null;
      this.selectedOption = null;
      this.selectedVarsRow.sort((a, b) => a['@name'].localeCompare(b['@name']));
    }

  }
  onMoveToCols() {
    if (typeof this.selectedOption !== 'undefined' && this.selectedOption !== null && this.selectedOption.length > 0) {
      this.selectedVarsCol = this.selectedVarsCol.concat(this.selectedOption);
      this.variablesToSelect = this.variablesToSelect.filter((row) =>
        !this.selectedOption.includes(row)); // remove selectedOption array from variablesToSelect
      this.selectedOptions = null;
      this.selectedOption = null;
      this.selectedVarsCol.sort((a, b) => a['@name'].localeCompare(b['@name']));
    }
  }
  onSelectOrDeselectVar($event) {
    this.selectedOption = $event;
    if (this.selectedOption.length > 0) {
      this.dirRow = 0;
      this.dirCol = 0;
      this.selectedOptionsRow = null;
      this.selectedOptionRow = null;
      this.selectedOptionsCol = null;
      this.selectedOptionCol = null;
    }
  }


  onSelectOrDeselectRow($event) {
    this.selectedOptionRow = $event;
    if (this.selectedOptionRow.length > 0) {
      this.dirRow = 1;
      this.selectedOptions = null;
      this.selectedOption = null;
    }

  }

  onSelectOrDeselectCol($event) {
    this.selectedOptionCol = $event;
    if (this.selectedOptionCol.length > 0) {
      this.dirCol = 1;
      this.selectedOptions = null;
      this.selectedOption = null;
    }
  }

  onMoveToVarsFromRow() {
    if (typeof this.selectedOptionRow !== 'undefined' && this.selectedOptionRow !== null && this.selectedOptionRow.length > 0) {
      this.variablesToSelect = this.variablesToSelect.concat(this.selectedOptionRow);
      this.selectedVarsRow = this.selectedVarsRow.filter((row) =>
        !this.selectedOptionRow.includes(row)); // remove selectedOption array from variablesToSelect
      this.selectedOptionsRow = null;
      this.selectedOptionRow = null;
      this.variablesToSelect.sort((a, b) => a['@name'].localeCompare(b['@name']));
    }
  }

  onMoveToVarsFromCol() {
    if (typeof this.selectedOptionCol !== 'undefined' && this.selectedOptionCol !== null && this.selectedOptionCol.length > 0) {
      this.variablesToSelect = this.variablesToSelect.concat(this.selectedOptionCol);
      this.selectedVarsCol = this.selectedVarsCol.filter((row) =>
        !this.selectedOptionCol.includes(row)); // remove selectedOption array from variablesToSelect
      this.selectedOptionsCol = null;
      this.selectedOptionCol = null;
      this.variablesToSelect.sort((a, b) => a['@name'].localeCompare(b['@name']));
    }
  }

  onShowCrossTabTable() {

    var crossTab = {
      row: null,
      col: null
    };
    crossTab.row = this.selectedVarsRow;
    crossTab.col = this.selectedVarsCol;
    const numberOfSelectedVars = this.selectedVarsRow.length + this.selectedVarsCol.length;
    if (numberOfSelectedVars > this.maxSelectedVars) {
      const length = this.maxSelectedVars;
      this.snackBar.open(this.translate.instant('CROSSTAB.TOOMANYVAR', {length}), '', {
        duration: 2000
      });
      return;
    }
    if ((this.selectedVarsRow !== null  && this.selectedVarsRow.length > 0) ||
      (this.selectedVarsCol !== null && this.selectedVarsCol.length > 0)) {
      this.crossTabDialogRef = this.dialog.open(CrossTabDialogComponent, {
        width: '70em',
        data: crossTab,
        panelClass: 'field_width'
      });
      this.dialogRef.close();
    } else {
      this.snackBar.open(this.translate.instant('VARDIALSTAT.SELVARNOTE') , '', {
        duration: 2000
      });
    }
  }



}
