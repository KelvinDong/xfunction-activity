import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { urlDefine } from 'src/app/ts/base-config';

import { QuestionNaireCreateComponent } from './questionnaire/question-naire-create/question-naire-create.component';
import { QuestionNaireListComponent } from './questionnaire/question-naire-list/question-naire-list.component';
import { QuestionNairePublicComponent } from './questionnaire/question-naire-public/question-naire-public.component';
import { QuestionnaireEntryListComponent } from './questionnaire/question-naire-list/questionnaire-entry-list/questionnaire-entry-list.component';
import { RotateComponent } from './rotate/rotate.component';


const routes: Routes = [  // tools

  // { path: 'sponsor', component: ActivitySponsorComponent}

  { path: 'questionnaire-create', component: QuestionNaireCreateComponent},
  { path: 'questionnaire-create/:id', component: QuestionNaireCreateComponent},
  { path: 'questionnaire-list', component: QuestionNaireListComponent},
  { path: 'ginfo-create', component: QuestionNaireCreateComponent},
  { path: 'ginfo-create/:id', component: QuestionNaireCreateComponent},
  { path: 'ginfo-list', component: QuestionNaireListComponent},
  { path: 'questionnaire-public/:id', component: QuestionNairePublicComponent},
  { path: 'questionnaire-entry-list/:id', component: QuestionnaireEntryListComponent},

  { path: 'rotate', component: RotateComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule { }
