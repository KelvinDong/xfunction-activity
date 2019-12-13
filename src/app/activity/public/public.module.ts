import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { ShareModule} from '../../share.module';

import { SponsorActivityListComponent } from './sponsor-activity-list/sponsor-activity-list.component';
import { DetailShareDialogComponent } from './activity-detail/detail-share-dialog/detail-share-dialog.component';
import { CommentAddFormComponent } from './activity-detail/comment-add-form/comment-add-form.component';
import { PublicListComponent } from './public-list/public-list.component';
import { ActivityDetailComponent } from './activity-detail/activity-detail.component';
import { EntryFormComponent } from './activity-detail/entry-form/entry-form.component';

@NgModule({
  declarations: [
    ActivityDetailComponent,
    EntryFormComponent,
    PublicListComponent,
    SponsorActivityListComponent,
    CommentAddFormComponent,
    DetailShareDialogComponent
  ],
  entryComponents: [
    EntryFormComponent,
    CommentAddFormComponent,
    DetailShareDialogComponent
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    ShareModule
  ]
})
export class PublicModule { }
