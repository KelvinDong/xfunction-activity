import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyRoutingModule } from './my-routing.module';

import { ShareModule} from '../../share.module';



import { CreateFormComponent } from './create-form/create-form.component';
import { CreateActivityComponent } from './create-activity/create-activity.component';
import { TicketsBottomComponent } from './create-activity/tickets-bottom/tickets-bottom.component';
import { TicketFormComponent } from './create-activity/ticket-form/ticket-form.component';
import { FormListComponent } from './form-list/form-list.component';
import { ActivityListComponent } from './activity-list/activity-list.component';
import { ListBottomComponent } from './activity-list/list-bottom/list-bottom.component';
import { EntryListComponent } from './entry-list/entry-list.component'; // 我的报名
import { EntryListBottomComponent } from './entry-list/entry-list-bottom/entry-list-bottom.component';
import { ActivityEntriesComponent } from './activity-list/activity-entries/activity-entries.component';


import { EntryListDialogComponent } from './entry-list/entry-list-dialog/entry-list-dialog.component';
import { SignWxComponent } from './sign-wx/sign-wx.component';
import { ActivityListDialogComponent } from './activity-list/activity-list-dialog/activity-list-dialog.component';
import { ActivitySponsorComponent } from './activity-sponsor/activity-sponsor.component';
import { SponsorListComponent } from './sponsor-list/sponsor-list.component';
import { ActivityCommentsComponent } from './activity-comments/activity-comments.component';
import { EntryCommentsComponent } from './entry-comments/entry-comments.component';
import { EntryCommentsBottomComponent } from './entry-comments/entry-comments-bottom/entry-comments-bottom.component';
import { ActivityCommentsBottomComponent } from './activity-comments/activity-comments-bottom/activity-comments-bottom.component';
import { ActivityCommentsReplyComponent } from './activity-comments/activity-comments-reply/activity-comments-reply.component';
import { EntryImportComponent } from './activity-list/entry-import/entry-import.component';
import { EntryLotteryComponent } from './activity-list/entry-lottery/entry-lottery.component';
import { CheckinDeomComponent } from './activity-list/checkin-deom/checkin-deom.component';



@NgModule({
  declarations: [
    CreateFormComponent,
    CreateActivityComponent,
    TicketsBottomComponent,
    TicketFormComponent,
    FormListComponent,
    ActivityListComponent,
    ListBottomComponent,
    EntryListComponent,
    EntryListBottomComponent,
    ActivityEntriesComponent,
    EntryListDialogComponent,
    SignWxComponent,
    ActivityListDialogComponent,
    ActivitySponsorComponent,

    
    SponsorListComponent,
    ActivityCommentsComponent,
    EntryCommentsComponent,
    
    EntryCommentsBottomComponent,
    ActivityCommentsBottomComponent,
    ActivityCommentsReplyComponent,
    EntryImportComponent,
    EntryLotteryComponent,
    CheckinDeomComponent,
  ],
  entryComponents: [
    TicketsBottomComponent,
    TicketFormComponent,
    ListBottomComponent,
    
    EntryListBottomComponent,
    EntryListDialogComponent,
    ActivityListDialogComponent,
    
    EntryCommentsBottomComponent,
    ActivityCommentsBottomComponent,
    ActivityCommentsReplyComponent,

    EntryImportComponent,
    
  ],
  imports: [
    CommonModule,
    MyRoutingModule,
    ShareModule
  ]
})
export class MyModule { }
