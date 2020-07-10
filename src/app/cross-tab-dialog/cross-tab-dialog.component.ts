import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

  selectedVarsCol = [];
  selectedVarsRow = [];
  tableRows = [];
  sumCol;

  ngOnInit(): void {
    this.selectedVarsCol = this.data.col.selected;
    this.selectedVarsRow = this.data.row.selected;

    this.calculateSortedCategories(this.selectedVarsRow);
    this.calculateSpanAndRepeate(this.selectedVarsRow);
    this.calculateCombineCategories(this.selectedVarsRow);

    if (this.selectedVarsCol.length > 0) {
      this.calculateSortedCategories(this.selectedVarsCol);
      this.calculateSpanAndRepeate(this.selectedVarsCol);
      this.calculateCombineCategories(this.selectedVarsCol);


      /*  for (let i = 0; i < this.tableRows; i++) {
          this.tableRows[i] = {
            combinedCategories: null,
            tds: new Array()
          };
        }*/


      for (let variable = 0; variable < this.selectedVarsCol.length; variable++) {
        console.log(this.selectedVarsCol[variable].repeat);
        let index = 0;
        for (let repeat = 0; repeat < this.selectedVarsCol[variable].repeat; repeat++) {

          for (let category = 0; category < this.selectedVarsCol[variable].sortedCategories.length; category++) {

            const td = {
              span: null,
              text: null,
              categoryPerc: null
            };
            td.span = this.selectedVarsCol[variable].span;
            console.log("span = " + td.span);
            console.log(this.selectedVarsCol[variable].sortedCategories[category]);
            td.text = this.selectedVarsCol[variable].sortedCategories[category].labl["#text"];
            td.categoryPerc = this.selectedVarsCol[variable].sortedCategories[category].countPerc;
            if (typeof this.tableRows[index] === 'undefined') {
              this.tableRows[index] = {
                combinedCategories: null,
                tds: []
              };
            }
            this.tableRows[index].tds.push(td);
            index = index + td.span;
          }
        }
      }


      console.log("--------------");
      let categoriesColSpan = new Array(this.selectedVarsCol.length);
      let categoriesCol = new Array(this.selectedVarsCol.length);
      console.log(this.tableRows.length);
      for (let i = 0; i < this.tableRows.length; i++) {
        let category = -1;
        let indexCol = 0;
        for (let j = 0; j < this.selectedVarsCol.length; j++) {
          if (categoriesColSpan[j] == null || categoriesColSpan[j] === 0) {
            categoriesColSpan[j] = this.tableRows[i].tds[indexCol].span - 1;
            categoriesCol[j] = this.tableRows[i].tds[indexCol].categoryPerc;
            if (category !== -1) {
              category = (category * this.tableRows[i].tds[indexCol].categoryPerc) / 100.0;
            } else {
              category = this.tableRows[i].tds[indexCol].categoryPerc;
            }
            indexCol++;
          } else {
            categoriesColSpan[j]--;
            if (category !== -1) {
              category = (category * categoriesCol[j]) / 100.0;
            } else {
              category = categoriesCol[j];
            }
          }

        }
        console.log("Category " + category);
        this.tableRows[i].combinedCategories = category;
      }
      console.log('Combined');
      this.sumCol = 0;
      for (let i = 0; i < this.tableRows.length; i++) {
        console.log(this.tableRows[i].combinedCategories);
        this.sumCol = this.sumCol + this.tableRows[i].combinedCategories;
      }
    }

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
  calculateSpanAndRepeate(selectedVars) {
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
        console.log(selectedVars[i].repeat);
        for (let j = 0; j < selectedVars[i].repeat; j++) {
          for (let k = 0; k < selectedVars[i].sortedCategories.length; k++) {
            selectedVars[i].combinedCategories.push(selectedVars[i].sortedCategories[k]);
          }
        }
      }
    }
  }


}
