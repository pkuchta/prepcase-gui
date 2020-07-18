import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { JsonRpcService } from './json-rpc.service';
import { UserConfig } from './types/UserConfig';
import { map, tap } from 'rxjs/operators';
import { RpcCaseListResponse, RpcLoginResponse } from './types/RpcResponses';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  /**
   * null - uninitialized
   * false - not logged in
   * UserConfig - logged in
   */
  userConfig: UserConfig | null = null;
  private logged: Promise<boolean> = Promise.resolve(false);

  constructor(
    private jsonRpc: JsonRpcService,
  ) {
    this.checkIfLogged();
  }

  login(host, username, password): Observable<RpcLoginResponse> {
    const res = this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.login',
      [host, username, password]
    ) as Observable<RpcLoginResponse>;

    return res.pipe(
      tap(data => {
        if (data.error_code === '') {
          this.userConfig = data.config;
          this.logged = Promise.resolve(true);
        }
      }),
    );
  }

  isLogged(): Promise<boolean> {
    return this.logged;
  }

  logout(): void {
    this.userConfig = null;
    this.logged = Promise.resolve(false);
    this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.logout',
    ).subscribe();
  }

  getCaseList(): Observable<RpcCaseListResponse>  {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.list_cases',
      [this.userConfig.case_dirs]
    );
  }

  addNewCasePath(path): Observable<RpcCaseListResponse>  {
    return this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.add_new_case_path',
      [path]
    ).pipe(
      tap(data => this.userConfig.case_dirs = data)
    );
  }

  private checkIfLogged(): void {
    // check if user already logged in (page refresh)
    const res = this.jsonRpc.rpc(
      environment.jsonRpcUrl,
      'App.check_logged',
      []
    ) as Observable<UserConfig | false>;

    this.logged = res.pipe(
      map(data => {
        console.log('CHECK LOGGED', data);
        if (data) {
          this.userConfig = data;
          return true;
        } else {
          return false;
        }
      }),
    ).toPromise();
  }
}
