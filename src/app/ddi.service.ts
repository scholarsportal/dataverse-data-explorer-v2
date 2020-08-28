import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class DdiService {
  private searchInput = new BehaviorSubject('');
  currentSearchInput = this.searchInput.asObservable();

  constructor(private http: HttpClient) {}
  getDDI(url: string) {
    return this.http.get(url, { responseType: 'text' });
  }

  putDDI(url: string, body: string, key: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/xml',
        'X-Dataverse-key': key
      })

    };
    return this.http.put(url, body, httpOptions);
    // return this.http.post(url,body, httpOptions);
  }

  getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  getBaseUrl() {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;
    /*  if (port === '4200') {
        port = '8080';
      }*/
    let baseUrl = protocol + '//' + host;
    if (port != null || typeof port !== 'undefined') {
      baseUrl = baseUrl + ':' + port;
    }
    return baseUrl;
  }

  clearSearch() {
    this.searchInput.next('');
  }
// Statistics function for ddi
  calculateMedian(variable) {
    let mean = 0;
    variable.sort();
    if ((variable.length % 2) === 0) {
      const middle = variable.length / 2;
      mean = (variable[middle - 1] + variable[middle]) / 2;
    } else {
      const middle = Math.floor(variable.length / 2);
      mean = variable[middle];
    }
    return mean;
  }

  calculateStDev(variable, mean) {
    let sum = 0;
    let stdv = 0;
    if (variable.length > 1) {
      for (const v of variable) {
        sum = sum + (v - mean) * (v - mean);
      }
      stdv = Math.sqrt(sum / (variable.length - 1));
    } else {
      stdv = variable[0];
    }
    return stdv;
  }

  calculateValidVariable(variable) {
    const validVariable = [];
    for (const v of variable ) {
      if (v !== null && typeof v !== 'undefined' && v !== '' && !isNaN(Number(v))) {
        const vNum = parseFloat(v);
        validVariable.push(vNum);
      }
    }
    return validVariable;
  }

  calculateMean(variable) {
    let sum = 0;
    for (const v of variable ) {
      sum = sum + v;
    }
    return (sum / variable.length);
  }
  ///
  getSumStat(data) {
    const sumStats = {medn : null,
      stdev: null,
      min: null,
      max: null,
      mean: null,
      vald: null,
      invd: null,
      other: null};
    if (typeof data['sumStat'] !== 'undefined') {
      for (const obj of data['sumStat']) {
        if (obj['@type'] === 'medn') {
          sumStats.medn = obj['#text'];
        } else if (obj['@type'] === 'stdev') {
          sumStats.stdev = obj['#text'];
        } else if (obj['@type'] === 'min') {
          sumStats.min = obj['#text'];
        } else if (obj['@type'] === 'max') {
          sumStats.max = obj['#text'];
        } else if (obj['@type'] === 'mean') {
          sumStats.mean = obj['#text'];
        } else if (obj['@type'] === 'vald') {
          sumStats.vald = obj['#text'];
        } else if (obj['@type'] === 'invd') {
          sumStats.invd = obj['#text'];
        } else if (obj['@type'] === 'other') {
          sumStats.other = obj['#text'];
        }
      }
    }
    return sumStats;
  }

  getDetailUrl(id) {
    const siteUrl = this.getParameterByName('siteUrl');
    const fileId = this.getParameterByName('fileId');
    const key = this.getParameterByName('key');
    let detailUrl = null;

    if (siteUrl) {
      detailUrl =
        siteUrl +
        '/api/access/datafile/' +
        fileId +
        '?format=subset&variables=' +
        id +
        '&key=' +
        key;
      //  http://localhost:8080/api/access/datafile/41?variables=v885
    }
    return detailUrl;
  }

  processVariables(data) {
    const variable = data.split('\n');
    return variable;
  }
  completeVariables(variable) {
    const sumStats = {medn : null,
      stdev: null,
      min: null,
      max: null,
      mean: null,
      vald: null,
      invd: null,
      other: null};
    const validVariable = this.calculateValidVariable(variable);
    sumStats.vald = validVariable.length;
    sumStats.invd = variable.length - sumStats.vald - 2;
    if (validVariable.length > 0) {
      sumStats.mean = this.calculateMean(validVariable);
      sumStats.medn = this.calculateMedian(validVariable);
      sumStats.min = Math.min.apply(null, validVariable);
      sumStats.max = Math.max.apply(null, validVariable);
      sumStats.stdev = this.calculateStDev(validVariable, sumStats.mean);
    }
    return sumStats;
  }
}
