import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import { MatomoTracker } from 'ngx-matomo';
import { DdiService } from '../ddi.service';
import { xml2json } from '../../assets/js/xml2json';
import {TranslateService} from '@ngx-translate/core';

import { VarComponent } from '../var/var.component';
import {VarGroupComponent} from '../var-group/var-group.component';

import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css']
})
export class InterfaceComponent implements OnInit {
  @ViewChild(VarComponent, { static: true }) child;
  @ViewChild(VarGroupComponent, { static: true }) childGroups;
  @ViewChild('scrollMe', { static: true }) private myScrollContainer: ElementRef;

  translate: TranslateService;
  ddiLoaded = false; // show the loading
  data;
  title;
  firstCitat;
  secondCitat;
  doi;
  filename;
  dvLocale = null;
  _variables = []; // store the variables to be broadcast to child
  variableGroups = []; // store the variables in an array display
  siteUrl;
  fileId;
  fileMetadataId;
  key;

  constructor(
    private matomoTracker: MatomoTracker,
    private ddiService: DdiService,
    public snackBar: MatSnackBar,
    private translatePar: TranslateService) {

    this.translate = translatePar;
    this.translate.addLangs(['English', 'Français']);
    this.translate.setDefaultLang('English');

    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/English|Français/) ? browserLang : 'English');
  }

  ngOnInit(): void {
    console.log(this.child);
    this.ddiLoaded = false; // for now
    this.dvLocale = this.ddiService.getParameterByName('dvLocale');
    console.log(this.dvLocale);
    if (this.dvLocale != null) {
      if (this.dvLocale === 'en') {
        this.translate.use('English');
      } else if (this.dvLocale === 'fr') {
        this.translate.use('Français');
      } else {
        const browserLang = this.translate.getBrowserLang()
        this.translate.use(browserLang.match(/English|Français/) ? browserLang : 'English');
      }
    } else {
      const browserLang = this.translate.getBrowserLang();
      this.translate.use(browserLang.match(/English|Français/) ? browserLang : 'English');
    }

//siteUrl=https://dataverse.scholarsportal.info&fileId=8988

    this.siteUrl = this.ddiService.getParameterByName('siteUrl');
    console.log(this.siteUrl);
    this.fileId = this.ddiService.getParameterByName('fileId');
    console.log(this.fileId);
    this.fileMetadataId = this.ddiService.getParameterByName('fileMetadataId');
    this.key = this.ddiService.getParameterByName('key');
    console.log(this.fileMetadataId);
    let uri = null;
    if (this.siteUrl != null && this.fileId != null) {
      uri = this.siteUrl + '/api/access/datafile/' + this.fileId + '/metadata/ddi';
      if (this.fileMetadataId != null) {
        uri = uri + '?fileMetadataId=' + this.fileMetadataId;
      }
      if (this.key !== null ) {
        if (this.fileMetadataId != null) {
          uri = uri + '&key=' + this.key;
        } else {
          uri = uri + '?key=' + this.key;
        }
      }
    } else if (this.siteUrl == null && this.fileId == null){
      // Just for testing purposes
      uri = this.ddiService.getBaseUrl();
     // uri = uri + '/assets/test_groups.xml';
      uri = uri + '/assets/dct2.xml';
    }
    console.log(uri);

    this.getDDI(uri);
  }

  getDDI(_uri): void {
    const url = _uri;
    this.ddiService
      .getDDI(url)
      .subscribe(
        data => this.processDDI(data),
        error => console.log(error),
        () => this.completeDDI()
      );
  }

  processDDI(data) {
    const parser = new DOMParser();
    this.data = parser.parseFromString(data, 'text/xml');
  }

  completeDDI() {
    this.showVarsGroups();
    this.showVars();
    this.title = this.data
      .getElementsByTagName('stdyDscr')[0]
      .getElementsByTagName('titl')[0].textContent;
    const citation = this.data
      .getElementsByTagName('stdyDscr')[0]
      .getElementsByTagName('biblCit')[0].textContent;
    const start = citation.indexOf('http');
    const temp = citation.substr(start);
    const end = temp.indexOf(',');
    this.doi = temp.substr(0, end);
    this.firstCitat = citation.substr(0, start );
    this.firstCitat = this.firstCitat;
    this.secondCitat = temp.substr(end);
    this.secondCitat = this.secondCitat;

    this.filename = this.data
      .getElementsByTagName('fileDscr')[0]
      .getElementsByTagName('fileName')[0].textContent;
    this.showDDI();

    const agency =  this.data.getElementsByTagName('IDNo')[0];
    const obj = JSON.parse(xml2json(agency, ''));
  }

  showDDI() {
    this.ddiLoaded = true;
  }

  showVars() {
    const variables = [];
    const elm = this.data.getElementsByTagName('var');
    for (const elm_in of elm) {
      variables.push(JSON.parse(xml2json(elm_in, '')));
    }
    // flatten the table structure so it can be sorted/filtered appropriately
    const flat_array = [];
    for (let i = 0; i < variables.length; i++) {
      const obj = variables[i];
      // make equivalent variable to allow sorting
      for (const j in obj.var) {
        if (j.indexOf('@') === 0) {
          obj.var[j.substring(1).toLowerCase()] = obj.var[j];
        }
      }

      if (typeof obj.var.catgry !== 'undefined') {
        if (typeof obj.var.catgry.length === 'undefined') {
          // If there is only one category
          obj.var.catgry = [obj.var.catgry];
        }
        let sumCount = 0;
        for (let k = 0; k < obj.var.catgry.length; k++) {
          if (typeof obj.var.catgry[k].catStat !== 'undefined') {
            if (typeof obj.var.catgry[k].catStat.length === 'undefined') {
              obj.var.catgry[k].catStat = [obj.var.catgry[k].catStat];
            }
            // tslint:disable-next-line:radix
            sumCount = sumCount + parseInt(obj.var.catgry[k].catStat[0]['#text']);
          }
        }
        for (let k = 0; k < obj.var.catgry.length; k++) {
          if (typeof obj.var.catgry[k].catStat !== 'undefined') {
            // tslint:disable-next-line:radix
            obj.var.catgry[k].countPerc = parseInt(obj.var.catgry[k].catStat[0]['#text']) * 100 / sumCount;
          }
        }
        obj.var.sumCount = sumCount;
      }
      if (typeof obj.var.universe !== 'undefined') {
        if (typeof obj.var.universe.size === 'undefined') {
          obj.var.universe = {'#text': obj.var.universe};
        }
      }

      if (typeof obj.var.notes !== 'undefined') {
        if (typeof obj.var.notes.length !== undefined && obj.var.notes.length === 2 ) {
          if (obj.var.notes[0]['#cdata'] !== 'undefined') {
            obj.var.notes = {
              '#cdata': obj.var.notes[0]['#cdata'],
              '#text': obj.var.notes[1]['#text'],
              '@level': obj.var.notes[1]['@level'],
              '@subject': obj.var.notes[1]['@subject'],
              '@type': obj.var.notes[1]['@type']
            };
          } else {
            obj.var.notes = {
              '#cdata': obj.var.notes[1]['#cdata'],
              '#text': obj.var.notes[0]['#text'],
              '@level': obj.var.notes[0]['@level'],
              '@subject': obj.var.notes[0]['@subject'],
              '@type': obj.var.notes[0]['@type']
            };
          }
        }
      }
      flat_array.push(obj.var);
    }

    this._variables = flat_array;
    console.log(this._variables);
    this.child.onUpdateVars(this._variables);

  }

  showVarsGroups() {
    const elm = this.data.getElementsByTagName('varGrp');

    for (const elmIn of elm) {

      const obj = JSON.parse(xml2json(elmIn, ''));
      if (typeof obj.varGrp['@var'] === 'undefined') {
        obj.varGrp['@var'] = '';
      }
      this.variableGroups.push(obj);
    }
  }

  // pass the selected ids to the var table for display
  broadcastSubSetRows(ids) {
    this.child.onSubset(ids);
  }


  scrollNav() {
    const elm = this.myScrollContainer['_elementRef'].nativeElement;
    elm.scrollTop = elm.scrollHeight;
  }

  onSave(event){
    console.log(event);
    const option = event.value;
    let url = this.siteUrl;
    if (this.fileId === null) {
      this.snackBar.open(this.translate.instant('SAVE.NOFILEID') , '', {
        duration: 2000
      });
      return;
    }

    switch (Number(option)) {
      case 1:
        url = url + '/api/access/datafile/' + this.fileId + '?format=subset' + '&variables=';
        if (this.child.selection.selected.length === 0) {
          this.snackBar.open(this.translate.instant('SAVE.NOSELECT') , '', {
            duration: 2000
          });
          return;
        }
        for (let i = 0; i < this.child.selection.selected.length; i++) {
          if (i < this.child.selection.selected.length - 1) {
            url = url + this.child.selection.selected[i]['@ID'].substring(1) + ',';
          }
          else {
            url = url + this.child.selection.selected[i]['@ID'].substring(1);
            if (this.fileMetadataId !== null) {
              url = url + '&fileMetadataId=' + this.fileMetadataId;
            }
            if (this.key !== null) {
              url = url + '&key=' + this.key;
            }
          }
        }
        break;
      case 2:
        url = url + '/api/access/datafile/' + this.fileId + '?format=original';
        if (this.fileMetadataId !== null) {
          url = url + '&fileMetadataId=' + this.fileMetadataId;
        }
        if (this.key !== null) {
          url = url + '&key=' + this.key;
        }
        break;
      case 3:
        url = url + '/api/access/datafile/' + this.fileId;
        if (this.fileMetadataId !== null) {
          url = url + '?fileMetadataId=' + this.fileMetadataId;
          if (this.key !== null) {
            url = url + '&key=' + this.key;
          }
        } else {
          if (this.key !== null) {
            url = url + '?key=' + this.key;
          }
        }
        break;
      case 4:
        url = url + '/api/access/datafile/' + this.fileId + '/?format=RData';
        if (this.fileMetadataId !== null) {
          url = url + '&fileMetadataId=' + this.fileMetadataId;
        }
        if (this.key !== null) {
          url = url + '&key=' + this.key;
        }
        break;
      case 5:
        url = url + '/api/meta/datafile/' + this.fileId;
        if (this.fileMetadataId !== null) {
          url = url + '?fileMetadataId=' + this.fileMetadataId;
          if (this.key !== null) {
            url = url + '&key=' + this.key;
          }
        } else {
          if (this.key !== null) {
            url = url + '?key=' + this.key;
          }
        }
        break;
    }
    window.location.assign(url);
  }



}
