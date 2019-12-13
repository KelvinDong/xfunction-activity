import { Component, OnInit, Inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { urlDefine, baseConfig } from 'src/app/ts/base-config';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import wx from 'weixin-jsapi';
import { UserService, Result } from 'src/app/user/user.service';

@Component({
  selector: 'app-activity-list-dialog',
  templateUrl: './activity-list-dialog.component.html',
  styleUrls: ['./activity-list-dialog.component.css']
})
export class ActivityListDialogComponent implements OnInit {

  webUrl = environment.web;
  urlDefine = urlDefine;

  constructor(
    public dialogRef: MatDialogRef<ActivityListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService
  ) { }

  ngOnInit() {

    if (this.data.type === 8) { // 调起微信扫扫
      const url = window.location.href;
      console.log(url);
      this.userService.post(baseConfig.getWxParam, { url }).subscribe(
        (data: Result) => {
          console.log(data);
          const result = { ...data };
          if (result.success) {
            wx.config({
              debug: false, // 这里一般在测试阶段先用ture，等打包给后台的时候就改回false,
              appId: result.data.appId,
              timestamp: result.data.timestamp,
              nonceStr: result.data.nonceStr,
              signature: result.data.signature,
              jsApiList: ['scanQRCode']
            });
            wx.ready(() => {
              wx.scanQRCode({
                needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
                success:  (res) => {
                  window.location.href = res.resultStr;
                }
              });
            });
            wx.error((res) => {
             console.log(res);
            });
          }
        },
        (error: Result) => { this.userService.showError(error); }
      );
    }
  }

}
