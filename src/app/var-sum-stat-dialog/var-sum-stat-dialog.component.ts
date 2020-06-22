import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

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
  selector: 'app-var-sum-stat-dialog',
  templateUrl: './var-sum-stat-dialog.component.html',
  styleUrls: ['./var-sum-stat-dialog.component.css']
})
export class VarSumStatDialogComponent implements OnInit {

  public sumStats: SumStats;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.sumStats = {medn : null,
                     stdev: null,
                     min: null,
                     max: null,
                     mean: null,
                     vald: null,
                     invd: null,
                     other: null};
    for (const obj of this.data['sumStat']) {
      if (obj['@type'] === 'medn' ) {
        this.sumStats.medn = obj['#text'];
      } else if (obj['@type'] === 'stdev') {
        this.sumStats.stdev = obj['#text'];
      } else if (obj['@type'] === 'min') {
        this.sumStats.min = obj['#text'];
      } else if (obj['@type'] === 'max') {
        this.sumStats.max = obj['#text'];
      } else if (obj['@type'] === 'mean') {
        this.sumStats.mean = obj['#text'];
      } else if (obj['@type'] === 'vald') {
        this.sumStats.vald = obj['#text'];
      } else if (obj['@type'] === 'invd') {
        this.sumStats.invd = obj['#text'];
      } else if (obj['@type'] === 'other') {
        this.sumStats.other = obj['#text'];
      }
    }
  }

}
