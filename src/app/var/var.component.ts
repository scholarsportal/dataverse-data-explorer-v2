import {Component, OnInit, ViewChild, HostListener} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {FormControl} from '@angular/forms';
import {DdiService} from '../ddi.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-var',
  templateUrl: './var.component.html',
  styleUrls: ['./var.component.css']
})
export class VarComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  datasource: MatTableDataSource<any>;
  public searchFilter = new FormControl();
  _variables;
  renderedData = null;
  private filterValues = { search: '', _show: true };

  constructor(private ddiService: DdiService,
              private translate: TranslateService) { }

  ngOnInit() {
    this.ddiService.currentSearchInput.subscribe(message => this.searchFilter.patchValue(''));
    this.searchFilter.valueChanges.subscribe(value => {
      this.filterValues['search'] = value;
      this.datasource.filter = JSON.stringify(this.filterValues);
    });

    //this.group_select['hidden'] = true;
  }


  // Entry point - when data has been loaded
  onUpdateVars(data) {
    this._variables = data;
    // make sure all the data is set to show
    for (let i = 0; i < this._variables.length; i++) {
      this._variables[i]._show = true;
      // also make sure it has a label
      if (typeof this._variables[i].labl === 'undefined') {
        this._variables[i].labl = { '#text': '',  '@level': 'variable' };
      }
    }
    // show if var is _in_group
    //this.updateGroupsVars(true);
    this.datasource = new MatTableDataSource(this._variables);
    this.datasource.sort = this.sort;
    console.log(this.datasource);
    this.datasource.paginator = this.paginator;
    // sorting
    this.datasource.sortingDataAccessor = (datasort: any, property: string) => {
      switch (property) {
        case 'id':
          return +datasort['@ID'].replace(/\D/g, '');
        case 'name':
          return datasort['@name'];
        case 'labl':
          return datasort.labl['#text'];
        case '_order':
          return datasort._order;
        case 'wgt-var':
          if (datasort['@wgt'] === 'wgt') {
            return datasort['@wgt'];
          }
          return datasort['@wgt-var'];
        default:
          return '';
      }
    };
    // filter
    this.datasource.filterPredicate = this.createFilter();
    this.datasource.connect().subscribe(d => this.renderedData = d);
  }

  createFilter(): (data: any, filter: string) => boolean {
    const filterFunction = function(data, filter): boolean {
      const searchTerms = JSON.parse(filter);
      try {
        return (
          data['@ID']
            .toString()
            .toLowerCase()
            .indexOf(searchTerms.search.toLowerCase()) !== -1 ||
          data['@name']
            .toString()
            .toLowerCase()
            .indexOf(searchTerms.search.toLowerCase()) !== -1 ||
          data['labl']['#text']
            .toString()
            .toLowerCase()
            .indexOf(searchTerms.search.toLowerCase()) !== -1
        );
      } catch (e) {
        return false;
      }
    };
    return filterFunction;
  }

  getPageSizeOptions(): number[] {
    if (typeof this.datasource !== 'undefined') {
      if (this.datasource.paginator.length > 100) {
        return [25, 50, 100, this.datasource.paginator.length];
      } else if (this.datasource.paginator.length > 50 && this.datasource.paginator.length < 100) {
        return [25, 50, this.datasource.paginator.length];
      } else if (this.datasource.paginator.length > 25 && this.datasource.paginator.length < 50) {
        return [25, this.datasource.paginator.length];
      } else if (this.datasource.paginator.length >= 0 && this.datasource.paginator.length < 25) {
        return [this.datasource.paginator.length];
      } else {
        return [25, 50, 100];
      }
    } else {
      return [25];
    }

  }

  onView(_id) {
 /*   const data = this.getObjByID(_id, this._variables);
    // open a dialog showing the variables
    this.dialogStatRef = this.dialog.open(VarStatDialogComponent, {
      width: '35em',
      data: data,
      panelClass: 'field_width'
    });*/
  }

  getDisplayedColumns() {
    let displayedColumns = []; // 'order_arrows'

    displayedColumns = [
        'id',
        'name',
        'labl',
        'wgt-var',
        'view'
    ];
    return displayedColumns;
  }

  @HostListener('matSortChange', ['$event'])
  sortChange(sort) {
    console.log("sortChange");
    console.log(sort);
    let vars = [];

    for (let i = 0; i < this._variables.length; i++) {
      if (this._variables[i]['_show']) {
        vars.push(this._variables[i]);
      }
    }
    this.datasource.data = vars;
    this.datasource.data.sort();
    this.datasource.connect().subscribe(d => this.renderedData = d);

  }

  // get the var
  getObjByID(_id, _data) {
    for (const i of _data) {
      const obj = i;
      if (obj['@ID'] === _id) {
        return obj;
      }
    }
  }



}
