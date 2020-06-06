import { Component, OnInit, Input } from '@angular/core';
import { UserService, Result } from '../../user/user.service';
import { Router} from '@angular/router';

import { urlDefine, baseConfig, lsDefine} from '../../ts/base-config';
import { getUserToken as getUserLocalToken, getUserAvatar, getUserMobile} from '../../ts/base-utils';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { AboutDialogComponent } from '../../user/about-dialog/about-dialog.component';
import { environment } from 'src/environments/environment';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

@Component({
  selector: 'app-master-head',
  templateUrl: './master-head.component.html',
  styleUrls: ['./master-head.component.css']
})
export class MasterHeadComponent implements OnInit {

  @Input() showProgress = false;
  @Input() title = 'Xfunction';

  urlDefine = urlDefine;
  userToken: string;
  userAvatar: string;
  baseUrl = environment.media + '/activity/images';

  constructor(
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog,
    public aboutDialog: MatDialog
  ) { }

  ngOnInit() {

    this.userToken = getUserLocalToken();
    this.userAvatar = getUserAvatar();
  }
  
  login(){
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      // height: '400px',
      // width: '90%',
      data: { userMoble: getUserMobile() }
    });
    dialogRef.afterClosed().subscribe((resultData: any) => {
      if (resultData) {
        this.ngOnInit();
      }
    });
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

    window.location.href = 'https://www.xfunction.cn'
    return;
    const dialogRef = this.aboutDialog.open(AboutDialogComponent, {
      // width: '90%',
      data: {userName: ''}
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was OK :' + result);
    });
  }

  toCheckinDemo(){
    window.open('/activity/my/checkin-demo', '_blank');
  }


}
