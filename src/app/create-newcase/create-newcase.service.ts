import { xml2js } from 'xml-js';
import { forkJoin, Observable, of } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GridData } from '../types/GridData';
import { JsonRpcService } from '../json-rpc.service';
import { environment } from '../../environments/environment';
import { RpcExecuteCommandResponse } from '../types/RpcResponses';
import { catchError, map } from 'rxjs/operators';

export interface Compset {
  name: string;
  longName: string;
}

export interface CompsetsGroup {
  type: string;
  items: Compset[];
}

@Injectable({
  providedIn: 'root'
})
export class CreateNewcaseService {

  data: {
    compsets: CompsetsGroup[],
    gridData: GridData,
  };

  constructor(private http: HttpClient, private jsonRpc: JsonRpcService) {
  }

  async loadData(): Promise<void> {
    if (this.data) {
      return Promise.resolve();
    }
    this.data = { compsets: null, gridData: null };

    const allLoaded = new Promise<void>((resolve, reject) => {
      forkJoin({
        compsets: this.queryConfig('compsets'),
        grids: this.http.get('assets/config_grids.xml', {responseType: 'text'}),
      }).pipe(
        map(data => {
          this.data.compsets = this.parseCompsetsData(data.compsets);
          this.data.gridData = this.parseGridData(data.grids);
        }),
        catchError(err => {
          reject(err.message);
          return of([]);
        }),
      ).subscribe(data => {
        resolve();
      });
    });

    return allLoaded;
  }

  createNewcase(params: string[]): Observable<RpcExecuteCommandResponse> {
    return this.jsonRpc.rpc(environment.jsonRpcUrl, 'App.run_tool', ['create_newcase', params]);
  }

  private queryConfig(subject: 'compsets' | 'grids'): Observable<string> {
    return (this.jsonRpc.rpc(
      environment.jsonRpcUrl, 'App.run_tool', ['query_config', ['--' + subject, '--xml']]
    ) as Observable<RpcExecuteCommandResponse>).pipe(
      map(res => {
        if (res.return_code !== 0) {
          throw new Error(res.stderr);
        }
        return res.stdout;
      })
    );
  }

  private parseCompsetsData(compsetsXml: string): CompsetsGroup[] {
    // compsets xml is lacking root element
    compsetsXml = '<root>' + compsetsXml + '</root>';
    const parsed: any = xml2js(compsetsXml, {
      compact: true,
      trim: true,
      ignoreDeclaration: true,
      ignoreInstruction: true,
    });

    const types: string[] = parsed.root._text;

    return [...types.keys()].map(index => ({
      type: types[index],
      items: parsed.root.compsets[index].compset.map(compset => ({
        name: compset.alias._text,
        longName: compset.lname._text,
      })),
    }));
  }

  private parseGridData(defsXML: string): GridData {
    const parsed: any = xml2js(defsXML, {
      compact: true,
      trim: true,
      ignoreDeclaration: true,
      ignoreInstruction: true,
    });
    return parsed.grid_data;
  }
}
