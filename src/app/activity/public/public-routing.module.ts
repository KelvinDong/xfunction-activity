import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivityDetailComponent } from './activity-detail/activity-detail.component';
import { PublicListComponent } from './public-list/public-list.component';
import { SponsorActivityListComponent } from './sponsor-activity-list/sponsor-activity-list.component';
import { urlDefine } from 'src/app/ts/base-config';

const routes: Routes = [  // activity/public/ .substr(16)
  { path: 'activity-detail/:id', component: ActivityDetailComponent},
  { path: 'public-list', component: PublicListComponent},
  { path: 'sponsor-activity-list/:id', component: SponsorActivityListComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
