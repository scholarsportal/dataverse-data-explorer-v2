import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

interface Data {
  data: any;
  sortedCategories: any;
}

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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
  panelOpenState = false;
  selectedVars = [];
  ngOnInit(): void {

    console.log('--------------');

    for (let i = 0; i < this.data.length; i++) {
      const selectedVar = this.data[i];
      selectedVar.sortedCategories = [];
      selectedVar.sumStats = {medn : null,
        stdev: null,
        min: null,
        max: null,
        mean: null,
        vald: null,
        invd: null,
        other: null};

      for (const obj of selectedVar['sumStat']) {
        if (obj['@type'] === 'medn' ) {
          selectedVar.sumStats.medn = obj['#text'];
        } else if (obj['@type'] === 'stdev') {
          selectedVar.sumStats.stdev = obj['#text'];
        } else if (obj['@type'] === 'min') {
          selectedVar.sumStats.min = obj['#text'];
        } else if (obj['@type'] === 'max') {
          selectedVar.sumStats.max = obj['#text'];
        } else if (obj['@type'] === 'mean') {
          selectedVar.sumStats.mean = obj['#text'];
        } else if (obj['@type'] === 'vald') {
          selectedVar.sumStats.vald = obj['#text'];
        } else if (obj['@type'] === 'invd') {
          selectedVar.sumStats.invd = obj['#text'];
        } else if (obj['@type'] === 'other') {
          selectedVar.sumStats.other = obj['#text'];
        }
      }

      console.log(selectedVar);
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
    console.log("sortedVars")
    console.log(this.selectedVars);

  }

  isUndefined(val) {
    return typeof val === 'undefined';
  }

  doesExist(val) {
    return typeof val !== 'undefined' && val > 1;
  }

}
