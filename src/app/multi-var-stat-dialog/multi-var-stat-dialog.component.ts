import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DdiService} from '../ddi.service';

interface SumStats {
  medn: number;
  stdev: number;
  min: number;
  max: number;
  mean: number;
  vald: number;
  invd: number;
  other: string;
}

@Component({
  selector: 'app-multi-var-stat-dialog',
  templateUrl: './multi-var-stat-dialog.component.html',
  styleUrls: ['./multi-var-stat-dialog.component.css']
})

export class MultiVarStatDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private ddiService: DdiService) { }
  panelOpenState = false;
  selectedVars = [];
  variable = [];
  selectedVar: any;
  varsWithoutCategories = [];
  vars = [];
  categoriesLoaded;
  ngOnInit(): void {
    this.categoriesLoaded = false;
    for (let i = 0; i < this.data.length; i++) {
      const selectedVar = this.data[i];
      selectedVar.sortedCategories = [];
      selectedVar.sumStats = null;

      if (typeof selectedVar['sumStat'] !== 'undefined') {
        selectedVar.sumStats = this.ddiService.getSumStat(selectedVar);
      }

      if (typeof selectedVar.catgry !== 'undefined') {
        if (typeof selectedVar.catgry.length === 'undefined') {
          selectedVar.sortedCategories.push(this.data[i].catgry);
        } else {
          for (const j of selectedVar.catgry) {
            selectedVar.sortedCategories.push(j);
          }
        }
      }
      if (selectedVar.sortedCategories.length === 0) {
        this.varsWithoutCategories.push(selectedVar);
      }
      this.selectedVars.push(selectedVar);
    }
    if (this.varsWithoutCategories.length > 0) {
      this.createCategories();
    } else {
      const ddi = this.ddiService.sorting.bind(this);
      this.selectedVar.sortedCategories.sort(  function(a, b ) {
        return ddi(b, a);
      }  );
      this.categoriesLoaded = true;
    }

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
    }
  }

  processVariablesCat(data) {
    const tempVars = this.ddiService.processVariables(data, '\n');
    if (tempVars.length > 0) {
      const names = this.ddiService.processVariables(tempVars[0], '\t');
      let vars = new Array(names.length);
      for (let k = 0; k < names.length; k++) {
        vars[k] = [];
      }
      for (let i = 1; i < tempVars.length; i++) {
        const temp = this.ddiService.processVariables(tempVars[i], '\t');
        for (let k = 0; k < temp.length; k++) {
          vars[k].push(temp[k]);
        }
      }
      this.vars = vars;
    }
  }

  completeVariablesCat() {
    const ddi = this.ddiService.sorting.bind(this);
    for (let i = 0; i < this.vars.length; i++ ) {
      this.varsWithoutCategories[i].sortedCategories = this.ddiService.completeVariableForCategories(this.vars[i]);
      this.varsWithoutCategories[i].sortedCategories.sort(  (a, b) =>  {
        return ddi(b, a);
      }  );
    }
    this.categoriesLoaded = true;
  }

  getVariableData(item) {
    this.panelOpenState = true;
    if (item.sumStats === null) {
      const obj = item['varFormat'];
      // if (obj['@type'] === 'numeric') {
        const id = item["@ID"];
        const detailUrl = this.ddiService.getDetailUrl(id);
        if (detailUrl !== null) {
          this.ddiService
            .getDDI(detailUrl)
            .subscribe(
              data => this.processVariables(data),
              error => console.log(error),
              () => this.completeVariables(item)
            );
        } else {
          console.log("Not connected to dataverse");
        }
      //}
    }
  }
  processVariables(data) {
    this.variable = this.ddiService.processVariables(data, '\n');
  }
  completeVariables(item) {
    item.sumStats = this.ddiService.completeVariables(this.variable);
  }

  isUndefined(val) {
    return typeof val === 'undefined';
  }

  doesExist(val) {
    return typeof val !== 'undefined' && val > 1;
  }

  isNotEmpty(val) {
    return val !== null && typeof val !== 'undefined' && val !== 'NaN';
  }

  doCategoriesExist(item) {
    if (item.sortedCategories.length === 0) {
      return false;
    } else {
      return true;
    }
  }

}
