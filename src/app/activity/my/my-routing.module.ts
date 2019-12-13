import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateFormComponent } from './create-form/create-form.component';
import { CreateActivityComponent } from './create-activity/create-activity.component';
import { FormListComponent } from './form-list/form-list.component';
import { ActivityListComponent } from './activity-list/activity-list.component';

import { EntryListComponent } from './entry-list/entry-list.component'; // 我的报名
import { ActivityEntriesComponent } from './activity-list/activity-entries/activity-entries.component'; // 单个活动的报名
import { SignWxComponent } from './sign-wx/sign-wx.component';

import { ActivitySponsorComponent } from './activity-sponsor/activity-sponsor.component';


import { SponsorListComponent } from './sponsor-list/sponsor-list.component';
import { ActivityCommentsComponent } from './activity-comments/activity-comments.component';
import { EntryCommentsComponent } from './entry-comments/entry-comments.component';
import { urlDefine } from 'src/app/ts/base-config';
import { EntryLotteryComponent } from './activity-list/entry-lottery/entry-lottery.component';
import { CheckinDeomComponent } from './activity-list/checkin-deom/checkin-deom.component';


const routes: Routes = [  // activity/my/  .substr(12)
  { path: 'create-form/:id', component: CreateFormComponent},
  { path: 'create-form', component: CreateFormComponent},
  { path: 'create-activity', component: CreateActivityComponent},
  { path: 'create-activity/:id', component: CreateActivityComponent},
  { path: 'form-list', component: FormListComponent},
  { path: 'activity-list', component: ActivityListComponent},

  { path: 'entry-list', component: EntryListComponent},
  { path: 'activity-entries/:id', component: ActivityEntriesComponent},
  { path: 'favi-sponsors', component: SponsorListComponent},

  { path: 'entry-lottery/:id', component: EntryLotteryComponent},

  { path: 'my-comments', component: EntryCommentsComponent},
  { path: 'activity-comments', component: ActivityCommentsComponent},

  { path: 'sign-wx', component: SignWxComponent},
  { path: 'sponsor', component: ActivitySponsorComponent},

  { path: 'checkin-demo', component: CheckinDeomComponent},
  { path: 'checkin-demo/:id', component: CheckinDeomComponent}
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyRoutingModule { }
