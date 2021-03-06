import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateNewcaseComponent } from './create-newcase/create-newcase.component';
import { AppMaterialModule } from './app-material.module';
import { CreateNewcaseService } from './create-newcase/create-newcase.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { JsonRpcService } from './json-rpc.service';
import { DynamicFormItemComponent } from './dynamic-form/dynamic-form-item/dynamic-form-item.component';
import { EscapeHtmlPipe } from './pipes/keep-html.pipe';
import { appRoutes } from './app.routing';
import { CaseComponent } from './case/case.component';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserService } from './user.service';
import { CaseListComponent } from './case-list/case-list.component';
import { ScriptParametersDialogComponent } from './script-parameters-dialog/script-parameters-dialog.component';
import { ToolParametersService } from './tool-parameters.service';
import { PleaseWaitOverlayComponent } from './please-wait-overlay/please-wait-overlay.component';
import { CopyCaseDialogComponent } from './copy-case-dialog/copy-case-dialog.component';
import { SubmitWithCylcDialogComponent } from './submit-with-cylc-dialog/submit-with-cylc-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    CaseComponent,
    CreateNewcaseComponent,
    DynamicFormItemComponent,
    HelpDialogComponent,
    EscapeHtmlPipe,
    LoginComponent,
    CaseListComponent,
    ScriptParametersDialogComponent,
    PleaseWaitOverlayComponent,
    CopyCaseDialogComponent,
    SubmitWithCylcDialogComponent,
  ],
  entryComponents: [
    CopyCaseDialogComponent,
    HelpDialogComponent,
    ScriptParametersDialogComponent,
    SubmitWithCylcDialogComponent,
    PleaseWaitOverlayComponent,
  ],
  imports: [
    AppMaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes, { enableTracing: false, relativeLinkResolution: 'legacy' }),
  ],
  providers: [
    CreateNewcaseService,
    JsonRpcService,
    UserService,
    ToolParametersService,
    // { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
