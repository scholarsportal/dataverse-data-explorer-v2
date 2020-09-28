import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DdiService } from '../ddi.service';

@Component({
  selector: 'app-var-stat-dialog',
  templateUrl: './var-stat-dialog.component.html',
  styleUrls: ['./var-stat-dialog.component.css']
})
export class VarStatDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private ddiService: DdiService) { }

  sortedCategories = [];
  variable;
  ngOnInit(): void {
    if (typeof this.data.catgry !== 'undefined') {
      if (typeof this.data.catgry.length === 'undefined') {
        this.sortedCategories.push(this.data.catgry);
      } else {
        for (const i of this.data.catgry) {
          this.sortedCategories.push(i);
        }
      }
      this.sortedCategories.sort((a, b) => {
        return a.catValu - b.catValu;
      });
    }
    if (this.sortedCategories.length === 0) {
      this.createCategories();
    }
  }

  createCategories() {
    const detailUrl = this.ddiService.getDetailUrl(this.data['@ID']);
    if (detailUrl !== null) {
      this.ddiService
        .getDDI(detailUrl)
        .subscribe(
          data => this.processVariables(data),
          error => console.log(error),
          () => this.completeVariables()
        );
      //  http://localhost:8080/api/access/datafile/41?variables=v885
    }
  }

  processVariables(data) {
    this.variable = this.ddiService.processVariables(data, '\n');
  }

  completeVariables() {
    this.sortedCategories = this.ddiService.completeVariableForCategories(this.variable);
  }

  isUndefined(val) {
    return typeof val === 'undefined';
  }

  doesExist(val) {
    return typeof val !== 'undefined' && val > 1;
  }
  doCategoriesExist() {
    if (this.sortedCategories.length === 0) {
      return false;
    } else {
      return true;
    }
  }

}
