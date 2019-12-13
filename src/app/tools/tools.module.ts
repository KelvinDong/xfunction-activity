import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsRoutingModule } from './tools-routing.module';

import { ShareModule} from '../share.module';
import { QuestionNaireCreateComponent } from './questionnaire/question-naire-create/question-naire-create.component';
import { QuestionnaireAddElementComponent } from './questionnaire/question-naire-create/questionnaire-add-element/questionnaire-add-element.component';
import { QuestionNaireListComponent } from './questionnaire/question-naire-list/question-naire-list.component';
import { QuestionnaireListBottomComponent } from './questionnaire/question-naire-list/questionnaire-list-bottom/questionnaire-list-bottom.component';
import { QuestionNairePublicComponent } from './questionnaire/question-naire-public/question-naire-public.component';
import { QuestionnaireEntryListComponent } from './questionnaire/question-naire-list/questionnaire-entry-list/questionnaire-entry-list.component';
import { DetailShareDialogComponent } from './questionnaire/question-naire-public/detail-share-dialog/detail-share-dialog.component';

import { RotateComponent } from './rotate/rotate.component';
import { RotateDialogComponent } from './rotate/rotate-dialog/rotate-dialog.component';

@NgModule({
  declarations: [
  QuestionNaireCreateComponent,
  QuestionnaireAddElementComponent,
  QuestionNaireListComponent,
  QuestionnaireListBottomComponent,
  QuestionNairePublicComponent,
  QuestionnaireEntryListComponent,
  DetailShareDialogComponent,
  RotateComponent,
  RotateDialogComponent
  ],
  entryComponents: [
    QuestionnaireAddElementComponent,
    QuestionnaireListBottomComponent,
    DetailShareDialogComponent,
    RotateDialogComponent
  ],
  imports: [
    CommonModule,
    ToolsRoutingModule,
    ShareModule
  ]
})
export class ToolsModule { }
