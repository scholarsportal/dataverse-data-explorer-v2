import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class DdiService {
  private searchInput = new BehaviorSubject('');
  currentSearchInput = this.searchInput.asObservable();

  constructor(private http: HttpClient) {
  }
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

  calculateValidVariable(variable, numericalVariable, indx) {
    const validVariable = [];
    for (let i = indx; i < variable.length; i++ ) {
      if (variable[i] !== null && typeof variable[i] !== 'undefined') {
        if (isNaN(parseFloat(variable[i]))) {
          if (variable[i].trim().localeCompare('') !== 0) {
            validVariable.push(variable[i]);
          }
        } else {
          numericalVariable.push(parseFloat(variable[i]));
          validVariable.push(variable[i]);
        }
      }
    }

    return validVariable;

  }

 /* calculateValidVariableForCategories(variable, indx, crosstab) {
    const validVariable = [];
    for (let i = indx; i < variable.length; i++ ) {

      if (variable[i] !== null && typeof variable[i] !== 'undefined') {
        let trimVar = null;
        if (!crosstab) {
          trimVar = variable[i].substring(1, variable[i].length - 1).trim();
        } else {
          trimVar = variable[i];
        }
        if (trimVar.localeCompare('') !== 0) {*/
          /*   if (variable[i].substring(0, 1).localeCompare('\"') !== 0 &&
               variable[i].substring(variable[i].length - 1, 1).localeCompare('\"') !== 0) {*/
          //validVariable.push(trimVar);
          /* } else {
             validVariable.push(variable[i]);
           }*/
  /*      }
      }
    }
    return validVariable;
  } */

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
    let aut = '';
    if ((key !== null) && (key !== 'null'))  {
      aut = '&key=' + key;
    }

    if (siteUrl) {
      detailUrl =
        siteUrl +
        '/api/access/datafile/' +
        fileId +
        '?format=subset&variables=' +
        id +
       aut;
      //  http://localhost:8080/api/access/datafile/41?variables=v885
    }
    return detailUrl;
  }

  processVariables(data, separator) {
    const variable = data.split(separator);
    return variable;
  }
  completeVariables(variable, indx) {
    const numericalVariable = [];
    const validVariable = this.calculateValidVariable(variable, numericalVariable, indx);
    const sumStats = this.calculateSummaryStatistics(validVariable, numericalVariable, variable, indx);
    return sumStats;
  }
  calculateSummaryStatistics(validVariable, numericalVariable, variable, indx ) {
    const sumStats = {medn : null,
      stdev: null,
      min: null,
      max: null,
      mean: null,
      vald: null,
      invd: null,
      other: null};
    sumStats.vald = validVariable.length - 1 + indx;
    sumStats.invd = variable.length - sumStats.vald - 2;
    if (numericalVariable.length > 0) {
      sumStats.mean = this.calculateMean(numericalVariable);
      sumStats.medn = this.calculateMedian(numericalVariable);
      sumStats.min = Math.min.apply(null, numericalVariable);
      sumStats.max = Math.max.apply(null, numericalVariable);
      sumStats.stdev = this.calculateStDev(numericalVariable, sumStats.mean);
    }
    return sumStats;
  }
  completeVariableForCategories(variable, indx, crosstab) {
    const createdCategories = [];
    const numericalVariable = [];
    const validVariable = this.calculateValidVariable(variable, numericalVariable, indx);
    const dict = {};
    let dictLength = 0;
    for (const varValid of validVariable) {
      let varClean = varValid;
      if (!crosstab) {
        if (varClean.substring(0, 1).localeCompare('"') === 0 &&
          (varClean.substring(varValid.length - 1, varValid.length ).localeCompare('"') === 0)) {
          varClean = varValid.substring(1, varValid.length - 1).trim();
        }
      }
      if (typeof  dict[varClean] === 'undefined') {
        dict[varClean] = 1;
        dictLength = dictLength + 1;
      } else {
        dict[varClean] = dict[varClean] + 1;
      }
    }
    if (dictLength < validVariable.length * 0.7 ) {
      for (const key in dict) {
        const row = {
          catValu: null,
          labl: {'@level': 'category', '#text': ''},
          catStat: {'@type': 'freq', '#text': ''},
          countPerc: null
        };
        let keyClean = key;
        if (key.substring(0, 1).localeCompare('"') === 0 &&
          (key.substring(key.length - 1, key.length ).localeCompare('"') === 0)) {
          keyClean = key.substring(1, key.length - 1).trim();
        }

        row.catValu = key;
        row.catStat['#text'] = dict[key].toString();
        row.labl['#text'] = keyClean;
        row.countPerc = (dict[key] / validVariable.length) * 100;

        createdCategories.push(row);
      }
    }
    return createdCategories;
  }
  sorting(a, b) {
    if (b.catValu.localeCompare('') === 0 && a.catValu.localeCompare('') === 0) return 0;
    if (a.catValu.localeCompare('') === 0 && b.catValu.localeCompare('') !== 0) {
      if (!isNaN(b.catValu)) {
        return 1;
      } else {
        return 2;
      }
    }
    if (b.catValu.localeCompare('') === 0 && a.catValu.localeCompare('') !== 0) {
      if (!isNaN(a.catValu)) {
        return -1 * parseFloat(a.catValu);
      } else {
        return -2;
      }
    }

    if (isNaN(a.catValu) && isNaN(b.catValu)) {
      return b.catValu.localeCompare(a.catValu);
    }
    if (!isNaN(a.catValu) && !isNaN(b.catValu))
    {
      return parseFloat(b.catValu) - parseFloat(a.catValu);
    }
  }
}
