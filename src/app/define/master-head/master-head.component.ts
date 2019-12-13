import { Component, OnInit, Input } from '@angular/core';
import { UserService, Result } from '../../user/user.service';
import { Router} from '@angular/router';

import { urlDefine, baseConfig, lsDefine} from '../../ts/base-config';
import { getUserName as getUserLocalName} from '../../ts/base-utils';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { AboutDialogComponent } from '../../user/about-dialog/about-dialog.component';

@Component({
  selector: 'app-master-head',
  templateUrl: './master-head.component.html',
  styleUrls: ['./master-head.component.css']
})
export class MasterHeadComponent implements OnInit {

  @Input() showProgress = false;
  @Input() title = 'Xfunction';

  urlDefine = urlDefine;
  userName: string;

  constructor(
    private userService: UserService,
    private router: Router,
    public aboutDialog: MatDialog
  ) { }

  ngOnInit() {

    this.userName = getUserLocalName();

  }
  

  logout() {
    window.localStorage.removeItem(lsDefine.userInfo);
    // 强制导航
    window.location.href = urlDefine.indexUrl;
    // 路由导航不行，如果在当前页就不刷新了
    // this.router.navigateByUrl(urlDefine.indexUrl);
  }

  shortLink(){
    window.location.href = 'https://www.xfunction.cn/shortLink/'
  }

  openAboutDialog(): void {
    const dialogRef = this.aboutDialog.open(AboutDialogComponent, {
      // width: '90%',
      data: {userName: this.userName}
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was OK :' + result);
    });
  }

  toCheckinDemo(){
    window.open('/activity/my/checkin-demo', '_blank');
  }


}
