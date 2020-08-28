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
  selector: 'app-var-sum-stat-dialog',
  templateUrl: './var-sum-stat-dialog.component.html',
  styleUrls: ['./var-sum-stat-dialog.component.css']
})
export class VarSumStatDialogComponent implements OnInit {

  public sumStats: SumStats;
  private variable;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private ddiService: DdiService) { }

  ngOnInit(): void {
    if (typeof this.data['sumStat'] !== 'undefined') {
      this.sumStats = this.ddiService.getSumStat(this.data);
    } else {
      const obj = this.data['varFormat'];
      if (obj['@type'] === 'numeric') {
         this.getVariableData(this.data["@ID"]);
      }
    }
  }
  getVariableData(id) {
    const detailUrl = this.ddiService.getDetailUrl(id);
    if (detailUrl !== null) {
      this.ddiService
        .getDDI(detailUrl)
        .subscribe(
          data => this.processVariables(data),
          error => console.log(error),
          () => this.completeVariables()
        );
    } else {
      console.log("Not connected to dataverse");
    }
  }
  processVariables(data) {
    this.variable = this.ddiService.processVariables(data);
  }
  completeVariables() {
    this.sumStats = this.ddiService.completeVariables(this.variable);
  }
}
