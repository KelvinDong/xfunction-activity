import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { baseConfig } from 'src/app/ts/base-config';
import { UserService, Result } from 'src/app/user/user.service';
import { getAndSavePath } from 'src/app/ts/base-utils';
import {
 faCheckCircle, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sign-wx',
  templateUrl: './sign-wx.component.html',
  styleUrls: ['./sign-wx.component.css']
})
export class SignWxComponent implements OnInit {

  title = '扫描个人签到码';
  showProgress = false;

  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;

  mes = '';

  suc = false;
  fal = false;

  constructor(
    private activeRoute: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit() {

    // 不登录的情况下可以返回此
    getAndSavePath(this.activeRoute);

    this.activeRoute.queryParamMap.subscribe((data: ParamMap) => {

      const id = data.get('id');
      const code = data.get('code');
      const a = data.get('a');

      let postUrl = baseConfig.signPerson;   // 主办方扫描个人签到码

      if( a !== null && a !== undefined)
      {
        this.title = '扫描活动现场码' ;
        postUrl = baseConfig.signActivity;  // 个人扫描 主办方提供的 活动现场码
      }

      if (id === null || code === null || id === undefined || code === undefined) {
        this.mes = '扫描失败:无参数输入';
        this.fal = true;
      } else {
        this.showProgress = true;
        this.userService.post(postUrl, { id, code }).subscribe(
          (data: Result) => {
            const result = { ...data };
            if (result.success) {
              this.mes = result.data;
              this.suc = true;
            } else {
              this.fal = true;
              this.mes = result.errorMsg;
            }
            this.showProgress = false;
          },
          (error: Result) => { this.userService.showError(error); this.showProgress = false; }
        );

      }
    });
  }

}
