import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {DdiService} from '../ddi.service';

import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-var-group',
  templateUrl: './var-group.component.html',
  styleUrls: ['./var-group.component.css']
})
export class VarGroupComponent implements OnInit {

  constructor(private ddiService: DdiService,
              private translate: TranslateService) { }
  allActive = true;
  source: any;
  @Input() variableGroups: any;

  @Output() subSetRows: EventEmitter<null> = new EventEmitter();
  @Output() parentScrollNav: EventEmitter<null> = new EventEmitter();

  ngOnInit(): void {
  }

  showAll() {
    this.ddiService.clearSearch();
    this.showActive();
    this.allActive = true;
    this.subSetRows.emit();
  }
  onGroupClick(_obj) {
    this.ddiService.clearSearch();
    const obj = _obj;
    const vars = obj.varGrp['@var'].split(' ');
    this.subSetRows.emit(vars);
    this.showActive(obj.varGrp['@ID']);
  }

  showActive(_id?) {
    this.allActive = false;
    // show it's active
    for (const i of this.variableGroups) {
      if (i.varGrp['@ID'] === _id) {
        i.active = true;
      } else {
        i.active = false;
      }
    }
  }

}

interface VarGroup {
  varGrp: {
    labl: string;
    '@var': string;
    '@ID': string;
  };
}
