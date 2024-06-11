import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DdiService } from '../ddi.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';

interface TD {
  span: number;
  text: string;
}

@Component({
  selector: 'app-cross-tab-dialog',
  templateUrl: './cross-tab-dialog.component.html',
  styleUrls: ['./cross-tab-dialog.component.css']
})
export class CrossTabDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private ddiService: DdiService,
              public snackBar: MatSnackBar,
              private translate: TranslateService) {}

  selectedVarsCol = [];
  selectedVarsRow = [];
  tableRows = [];
  sumCol;
  sumPerc;
  sumRow;
  numberOfRows;
  numberOfColumns;
  allPossibleCategoryCombRow;
  allPossibleCategoryCombCol;
  varsWithoutCategories = [];
  vars = [];
  maxNumberOfCategories: number;
  categoriesLoaded: boolean;

  ngOnInit(): void {
    this.categoriesLoaded = false;
    this.selectedVarsCol = this.data.row; // Columns are Rows and Rows are Columns
    this.selectedVarsRow = this.data.col;
    this.numberOfRows = this.selectedVarsRow.length;
    this.numberOfColumns = this.selectedVarsCol.length;
    this.maxNumberOfCategories = 50000;
    if (this.selectedVarsRow.length > 0) {
      this.calculateSortedCategories(this.selectedVarsRow);
    }

    if (this.selectedVarsCol.length > 0) {
      this.calculateSortedCategories(this.selectedVarsCol);
    }

    if (this.varsWithoutCategories.length > 0) {
      this.createCategories();
    } else {
      this.process();
    }
  }
  process() {
    if (this.selectedVarsRow.length > 0) {
      this.calculateSpanAndRepeat(this.selectedVarsRow);
      this.calculateCombineCategories(this.selectedVarsRow);
      // this.calculatePercRow(this.selectedVarsRow);
      this.allPossibleCategoryCombRow = this.calculateAllPossibleCategories(this.selectedVarsRow);

    }
    if (this.selectedVarsCol.length > 0) {
      this.calculateSpanAndRepeat(this.selectedVarsCol);
      this.calculateCombineCategories(this.selectedVarsCol);
      this.allPossibleCategoryCombCol = this.calculateAllPossibleCategories(this.selectedVarsCol);

      for (let variable = 0; variable < this.selectedVarsCol.length; variable++) {

        let index = 0;
        for (let repeat = 0; repeat < this.selectedVarsCol[variable].repeat; repeat++) {

          for (let category = 0; category < this.selectedVarsCol[variable].sortedCategories.length; category++) {

            const td = {
              span: null,
              text: null,
              categoryPerc: null
            };
            td.span = this.selectedVarsCol[variable].span;
            td.text = this.selectedVarsCol[variable].sortedCategories[category].labl["#text"];
            // td.categoryPerc = this.selectedVarsCol[variable].sortedCategories[category].countPerc;
            if (typeof this.tableRows[index] === 'undefined') {
              this.tableRows[index] = {
                tds: [],
                combinedCategories: [],
                totalNumber: {
                  numbers: 0,
                  percentages: 0
                }
              };
            }
            this.tableRows[index].tds.push(td);
            index = index + td.span;
          }
        }
      }
    }

    this.calculateCrossTabPercentages();
  }
  sortCategories(selectedVar) {
    if (typeof selectedVar.catgry !== 'undefined') {
      if (typeof selectedVar.catgry.length === 'undefined') {
        selectedVar.sortedCategories.push(selectedVar.catgry);
      } else {
        for (const j of selectedVar.catgry) {
          selectedVar.sortedCategories.push(j);
        }
      }

      selectedVar.sortedCategories.sort((a, b) => {
        return a.catValu - b.catValu;
      });
    } else {
      this.varsWithoutCategories.push(selectedVar);
    }
  }
  calculateSortedCategories(selectedVars) {
    for (let i = 0; i < selectedVars.length; i++) {
      const selectedVar = selectedVars[i];
      selectedVar.sortedCategories = [];
      selectedVar.combinedCategories = [];
      this.sortCategories(selectedVar);
    }
  }
  calculateSpanAndRepeat(selectedVars) {
    if (selectedVars.length > 0) {
      selectedVars[selectedVars.length - 1 ].span = 1;
      selectedVars[0].repeat = 1;
    }
    for (let i = selectedVars.length - 2 ; i >= 0 ; i--) {
      selectedVars[i].span = selectedVars[i + 1].sortedCategories.length * selectedVars[i + 1].span;
    }
    for (let i = 1; i < selectedVars.length ; i++) {
      selectedVars[i].repeat = selectedVars[i - 1].repeat * selectedVars[i - 1].sortedCategories.length;
    }
  }
  calculateCombineCategories(selectedVars) {
    for (let i = 0; i < selectedVars.length; i++) {
      if (i === 0) {
        selectedVars[0].combinedCategories = selectedVars[0].sortedCategories;
      } else {
        for (let j = 0; j < selectedVars[i].repeat; j++) {
          for (let k = 0; k < selectedVars[i].sortedCategories.length; k++) {
            selectedVars[i].combinedCategories.push(selectedVars[i].sortedCategories[k]);
          }
        }
      }
    }
  }
  calculatePercRow(selectedVars) {
    selectedVars[0].combinedCategoriesPerc = [];
    for (let k = 0; k < selectedVars[0].combinedCategories.length; k++) {
      selectedVars[0].combinedCategoriesPerc[k] = selectedVars[0].combinedCategories[k].countPerc;
    }
    for (let i = 1; i < selectedVars.length; i++) {
      selectedVars[i].combinedCategoriesPerc = [];
      for (let k = 0; k < selectedVars[i].combinedCategories.length; k++) {
        const pos = Math.floor(k / selectedVars[i].sortedCategories.length);
        const previousCat = selectedVars[i - 1].combinedCategoriesPerc[pos];
        const currentCat = selectedVars[i].combinedCategories[k].countPerc * previousCat / 100.0;
        selectedVars[i].combinedCategoriesPerc[k] = currentCat;

      }

    }
  }

  calculateAllPossibleCategories(selectedVars) {
    const allPossibleCategoryComb = [];
    for (let k = 0; k < selectedVars[selectedVars.length - 1].combinedCategories.length; k++) {
      //console.log(selectedVars[selectedVars.length - 1].combinedCategories[k].catValu);
      allPossibleCategoryComb[k] = [];
     // if (isNaN(selectedVars[selectedVars.length - 1].combinedCategories[k].catValu)) {
     //   allPossibleCategoryComb[k] = '\"' + selectedVars[selectedVars.length - 1].combinedCategories[k].catValu + '\"';
     // } else {
        allPossibleCategoryComb[k] = selectedVars[selectedVars.length - 1].combinedCategories[k].catValu;
     // }
      let pos = k;
      for (let i = selectedVars.length - 2; i > -1; i-- ) {
        pos = Math.floor(pos / selectedVars[i + 1].sortedCategories.length);
       // if (isNaN(selectedVars[i].combinedCategories[pos].catValu)) {
          //allPossibleCategoryComb[k] = '\"' + selectedVars[i].combinedCategories[pos].catValu + '\"' +
          //  '\t' + allPossibleCategoryComb[k];
        //} else {
          allPossibleCategoryComb[k] = selectedVars[i].combinedCategories[pos].catValu +
            '\t' + allPossibleCategoryComb[k];
        //}
      }
    }
    return allPossibleCategoryComb;
  }
  calculateNumbersofCategories(map) {
    this.sumCol = 0;
    this.sumPerc = 0;
    let lengthTable = 1;
    if (this.numberOfRows > 0) {
      lengthTable = this.allPossibleCategoryCombRow.length;
    }

    if (this.numberOfColumns === 0) {
      this.tableRows = new Array(1);
      this.tableRows[0] = {
        tds: [],
        combinedCategories: [],
        totalNumber : {
          numbers: 0,
          percentages: 0
        }
      };
    }
    for (let i = 0; i < this.tableRows.length; i++) {
      this.tableRows[i].combinedCategories = new Array(lengthTable);

      for (let k = 0; k < lengthTable; k++) {
        let key = null;
        if (this.numberOfRows > 0 && this.numberOfColumns > 0 ) {
          key = this.allPossibleCategoryCombRow[k] + '\t' + this.allPossibleCategoryCombCol[i];
        } else if (this.numberOfColumns > 0 ){
            key  = this.allPossibleCategoryCombCol[i];
        } else {
            key = this.allPossibleCategoryCombRow[k];
        }

        const value = map.get(key);
        if (typeof value !== 'undefined') {
          this.tableRows[i].combinedCategories[k] = {
            numbers: value,
            percentages: null
          };
          this.tableRows[i].totalNumber.numbers = this.tableRows[i].totalNumber.numbers + parseFloat(value);

        } else {
          this.tableRows[i].combinedCategories[k] = {
            numbers: 0,
            percentages: 0
          };

        }
      }
      this.sumCol = this.sumCol + this.tableRows[i].totalNumber.numbers;
    }
    for (let i = 0; i < this.tableRows.length; i++) {
      for (let k = 0; k < lengthTable; k++) {
        this.tableRows[i].combinedCategories[k].percentages = (this.tableRows[i].combinedCategories[k].numbers / this.sumCol) * 100;
        this.tableRows[i].totalNumber.percentages = this.tableRows[i].totalNumber.percentages + this.tableRows[i].combinedCategories[k].percentages;
        this.sumPerc = this.sumPerc + this.tableRows[i].combinedCategories[k].percentages;
      }
    }
  }

  calculateCrossTabPercentages() {
    let siteUrl = this.ddiService.getParameterByName('siteUrl');
    let fileId = this.ddiService.getParameterByName('fileId');
    let key = this.ddiService.getParameterByName('key');
    let detailUrl = null;
    let variables = '';

    for (const variable of this.selectedVarsRow) {
      if (variables === '') {
        variables = variables + variable['@ID'];
      } else {
        variables = variables + ',' + variable['@ID'];
      }
    }
    for (const variable of this.selectedVarsCol) {
      if (variables === '') {
        variables = variables + variable['@ID'];
      } else {
        variables = variables + ',' + variable['@ID'];
      }
    }
    let aut = '';
    if ((key !== null) && (key !== 'null'))  {
      aut = '&key=' + key;
    }
    if (!siteUrl) {
      const baseUrl = 'https://demodv.scholarsportal.info';
      //fileId = '3';
      fileId = '10159';
      detailUrl =
        baseUrl +
        '/api/access/datafile/' +
        fileId +
        '?format=subset&variables=' +
        variables +
        aut;
    } else {
      detailUrl =
        siteUrl +
        '/api/access/datafile/' +
        fileId +
        '?format=subset&variables=' +
        variables +
        aut;
    }
    this.ddiService
      .getDDI(detailUrl)
      .subscribe(
        data => this.processVariables(data),
        error => console.log(error),
        () => this.completeVariables()
      );
    //  http://localhost:8080/api/access/datafile/41?variables=v885

  }
  processCrossTabPercentage(map) {
    this.calculateNumbersofCategories(map);
    this.sumRow = null;
    if (this.tableRows !== null && this.selectedVarsRow.length > 0 &&
      !(typeof this.tableRows[this.selectedVarsRow.length - 1] === 'undefined')) {
      this.sumRow = new Array(this.tableRows[this.selectedVarsRow.length - 1].combinedCategories.length > 0);
      for (let k = 0; k < this.tableRows[this.selectedVarsRow.length - 1].combinedCategories.length; k++) {
        this.sumRow[k] = {
          numbers: 0,
          percentages: 0
        };
        for (let i = 0; i < this.tableRows.length; i++) {
          this.sumRow[k].numbers = this.sumRow[k].numbers + this.tableRows[i].combinedCategories[k].numbers;
          this.sumRow[k].percentages = this.sumRow[k].percentages + this.tableRows[i].combinedCategories[k].percentages;
        }
      }
    }
    this.categoriesLoaded = true;
  }

  processVariables(data) {
    const variables = data.split('\n');
    const map = new Map();
    for (let i = 1; i < variables.length; i++) {
      if (map.has(variables[i])) {
        map.set(variables[i], map.get(variables[i]) + 1);
      } else {
        map.set(variables[i], 1);
      }
    }
    this.processCrossTabPercentage(map);
  }

  completeVariables() {
    this.categoriesLoaded = true;
  }

  createCategories() {
    let vars = this.varsWithoutCategories[0]['@ID'];
    for (let i = 1; i < this.varsWithoutCategories.length; i++) {
      vars = vars + ',' + this.varsWithoutCategories[i]['@ID'];
    }
    const detailUrl = this.ddiService.getDetailUrl(vars);
    if (detailUrl !== null) {
      this.ddiService
        .getDDI(detailUrl)
        .subscribe(
          data => this.processVariablesCat(data),
          error => console.log(error),
          () => this.completeVariablesCat()
        );
      //  http://localhost:8080/api/access/datafile/41?variables=v885
    } else {
      // this.categoriesLoaded = true;
    }
  }

  processVariablesCat(data) {
    const tempVars = this.ddiService.processVariables(data, '\n');
    if (tempVars.length > 0) {
      const names = this.ddiService.processVariables(tempVars[0], '\t');
      const vars = new Array(names.length);
      for (let k = 0; k < names.length; k++) {
        vars[k] = [];
      }
      for (let i = 1; i < tempVars.length; i++) {
        const temp = this.ddiService.processVariables(tempVars[i], '\t');
        for (let k = 0; k < temp.length; k++) {
          let trimVar = temp[k].trim();
          if (trimVar.substring(0, 1).localeCompare('"') === 0 &&
            (trimVar.substring(temp.length - 1, temp.length ).localeCompare('"') === 0)) {
            trimVar = trimVar.substring(1, trimVar.length - 1).trim();
          }
          if (trimVar.localeCompare('') !== 0) {
            vars[k].push(trimVar);
          }
        }
      }
      this.vars = vars;
      /*this.mapCategories = new Map();
      for (let i = 0; i < this.vars[0].length; i++) {
        let temp = '';
        for (let j = 0; j < this.vars.length; j++) {
          if (j === 0) {
            temp = this.vars[j][i];
          } else {
            temp = temp + '\t' + this.vars[j][i];
          }
          if (this.mapCategories.has(temp )) {
            this.mapCategories.set(temp, this.mapCategories.get(temp) + 1);
          } else {
            this.mapCategories.set(temp, 1);
          }
        }
      }*/
    }
  }

  completeVariablesCat() {
    const ddi = this.ddiService.sorting.bind(this);
    for (let i = 0; i < this.vars.length; i++ ) {
      this.varsWithoutCategories[i].sortedCategories = this.ddiService.completeVariableForCategories(this.vars[i], 0, true);
      this.varsWithoutCategories[i].sortedCategories.sort(  (a, b) =>  {
        return ddi(b, a);
      }  );
    }
    let totalCategories = 1;
    const selectedRowsWithCategories = [];
    for (const row of this.selectedVarsRow) {
      if (row.sortedCategories.length > 0) {
        selectedRowsWithCategories.push(row);
        totalCategories = totalCategories * row.sortedCategories.length;
      }
    }
    this.selectedVarsRow = selectedRowsWithCategories;

    const selectedColsWithCategories = [];
    for (const col of this.selectedVarsCol) {
      if (col.sortedCategories.length > 0) {
        selectedRowsWithCategories.push(col);
        totalCategories = totalCategories * col.sortedCategories.length;
      }
    }
    this.selectedVarsCol = selectedColsWithCategories;

    this.numberOfRows = this.selectedVarsRow.length;
    this.numberOfColumns = this.selectedVarsCol.length;
    if (totalCategories > this.maxNumberOfCategories) {
      this.snackBar.open(this.translate.instant('CROSSTAB.TOOMANYCAT', {length}), '', {
        duration: 2000
      });
      return;
    }
    this.process();
  }



}
