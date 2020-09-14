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
  ngOnInit(): void {
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
        selectedVar.sortedCategories.sort((a, b) => {
          return a.catValu - b.catValu;
        });
      }
      this.selectedVars.push(selectedVar);
    }

  }

  getVariableData(item) {
    this.panelOpenState = true;
    if (item.sumStats === null) {
      const obj = item['varFormat'];
      if (obj['@type'] === 'numeric') {
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
      }
    }
  }
  processVariables(data) {
    this.variable = this.ddiService.processVariables(data);
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
