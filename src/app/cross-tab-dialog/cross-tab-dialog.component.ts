import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DdiService } from '../ddi.service';

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
              private ddiService: DdiService) {}

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

  ngOnInit(): void {
    this.selectedVarsCol = this.data.row; // Columns are Rows and Rows are Columns
    this.selectedVarsRow = this.data.col;
    this.numberOfRows = this.selectedVarsRow.length;
    this.numberOfColumns = this.selectedVarsCol.length;

    if (this.selectedVarsRow.length > 0) {
      this.calculateSortedCategories(this.selectedVarsRow);
      this.calculateSpanAndRepeat(this.selectedVarsRow);
      this.calculateCombineCategories(this.selectedVarsRow);
      // this.calculatePercRow(this.selectedVarsRow);

      this.allPossibleCategoryCombRow = this.calculateAllPossibleCategories(this.selectedVarsRow);

    }

    if (this.selectedVarsCol.length > 0) {
      this.calculateSortedCategories(this.selectedVarsCol);
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
                totalNumber : {
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
        let pos = Math.floor(k / selectedVars[i].sortedCategories.length);
        let previousCat = selectedVars[i - 1].combinedCategoriesPerc[pos];
        let currentCat = selectedVars[i].combinedCategories[k].countPerc * previousCat / 100.0;
        selectedVars[i].combinedCategoriesPerc[k] = currentCat;

      }

    }
  }

  calculateAllPossibleCategories(selectedVars) {
    const allPossibleCategoryComb = [];
    for (let k = 0; k < selectedVars[selectedVars.length - 1].combinedCategories.length; k++) {
      allPossibleCategoryComb[k] = [];
      allPossibleCategoryComb[k] = selectedVars[selectedVars.length - 1].combinedCategories[k].catValu;
      let pos = k;
      for (let i = selectedVars.length - 2; i > -1; i-- ) {
        pos = Math.floor(pos / selectedVars[i + 1].sortedCategories.length);
        allPossibleCategoryComb[k] =  selectedVars[i].combinedCategories[pos].catValu +
          '\t' + allPossibleCategoryComb[k];
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
      //this.tableRows[0] = {
      //};
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
          key = this.allPossibleCategoryCombCol[i];
        } else {
          key = this.allPossibleCategoryCombRow[k];
        }
        const value = map.get(key)
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
        variables = variables  + variable['@ID'];
      } else {
        variables = variables  + ',' + variable['@ID'];
      }
    }
    for (const variable of this.selectedVarsCol) {
      if (variables === '') {
        variables = variables  + variable['@ID'];
      } else {
        variables = variables  + ',' + variable['@ID'];
      }
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
          '&key=' +
          key;
    } else {
      detailUrl =
        siteUrl +
        '/api/access/datafile/' +
        fileId +
        '?format=subset&variables=' +
        variables +
        '&key=' +
        key;
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

  processVariables(data) {
    const variables = data.split('\n');
    const mapCategories = new Map();
    for (let i = 1; i < variables.length; i++) {
      if (mapCategories.has(variables[i])) {
        mapCategories.set(variables[i], mapCategories.get(variables[i]) + 1);
      } else {
        mapCategories.set(variables[i],  1);
      }
    }
    this.calculateNumbersofCategories(mapCategories);
    this.sumRow = null;
    if (this.tableRows !== null && this.selectedVarsRow.length > 0) {
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

  }

  completeVariables() {

  }



}
