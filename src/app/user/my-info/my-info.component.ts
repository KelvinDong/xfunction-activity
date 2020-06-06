import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';

import { UserService, Result, User } from '../user.service';
import { baseConfig, urlDefine, regDefine, lsDefine } from '../../ts/base-config';

import { MatSnackBar, MatDialog } from '@angular/material';
import { SlideControlComponent } from 'src/app/define/slide-control/slide-control.component';
import { getAndSavePath, forbiddenRegValidator, isNumber, canvasDataURL, getBlobByBase64 } from 'src/app/ts/base-utils';
import { environment } from 'src/environments/environment';
import { ImageCropComponent } from 'src/app/define/image-crop/image-crop.component';
import { MasterHeadComponent } from 'src/app/define/master-head/master-head.component';
import { CommandService } from '../command.service';

@Component({
  selector: 'app-my-info',
  templateUrl: './my-info.component.html',
  styleUrls: ['./my-info.component.css']
})
export class MyInfoComponent implements OnInit {

  /*
  @ViewChild(MasterHeadComponent, { static: false }) 
  mh: MasterHeadComponent;
  */

  showProgress = false;

  // 密码显示控制
  hide = true;

  resumeForm =
    new FormGroup({
      name: new FormControl('', [
        forbiddenRegValidator(regDefine.resume)
      ]),
      sex: new FormControl('', []),
      birth: new FormControl('', [
        forbiddenRegValidator(regDefine.birth)
      ]),
      email: new FormControl('', [
        forbiddenRegValidator(regDefine.email)
      ]),
      mobile: new FormControl('', [
        forbiddenRegValidator(regDefine.mobile)
      ]),
      company: new FormControl('', [
        forbiddenRegValidator(regDefine.resume)
      ]),
      position: new FormControl('', [
        forbiddenRegValidator(regDefine.resume)
      ]),
      avatar: new FormControl('', []),
    });

  selectIndex = 0;
  userInfo: User;

  
  countDown = 0;
  countDownLabel = '获取';
  activeMobile = new FormControl('', [
    Validators.required, forbiddenRegValidator(regDefine.mobile)]);
  mobileCode = new FormControl('', [
    Validators.required, forbiddenRegValidator(regDefine.mobileCode)]);


  changePwd = new FormControl('', [Validators.required, forbiddenRegValidator(regDefine.password)]);
  changeCountDown = 0;
  changeCountDownLabel = '获取';
  changeCode = new FormControl('', [
    Validators.required, forbiddenRegValidator(regDefine.mobileCode)]);

  headPicSrc = 'assets/images/default-head.png';

  constructor(
    private userService: UserService,
    private commandService: CommandService,
    public snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    // getAndSavePath(this.activeRoute);

    // 重新获取用户基础信息
    setTimeout(() => {
      this.commandService.setMessage(3);
      this.showProgress = true;
      this.commandService.setMessage(1);
      this.userService.post(baseConfig.userGet, {}).subscribe(
        (data: Result) => {
          const result = { ...data };
          if (result.success) {
            this.userInfo = result.data;
            window.localStorage.setItem(lsDefine.userInfo, JSON.stringify(this.userInfo));
            this.activeMobile.setValue(this.userInfo.userMobile);
            this.resumeForm.patchValue(this.userInfo);
            this.headPicSrc = environment.media + '/activity/images' + this.userInfo.userAvatar;
          } else { // 基本信息不完整 ，转到首页去，
            this.userService.showError1(result, () => {this.ngOnInit(); } );
            this.router.navigateByUrl(urlDefine.indexUrl);
          }
          this.showProgress = false;
          this.commandService.setMessage(0);
        },
        (error: Result) => { // 基本信息不完整 ，转到首页去，
          this.userService.showError1(error, () => {this.ngOnInit(); });
          this.router.navigateByUrl(urlDefine.indexUrl);
          this.showProgress = false;
          this.commandService.setMessage(0);
        }
      );
    }, 100);

    // 有参数就切至1
    this.activeRoute.queryParamMap.subscribe((data: ParamMap) => {
      const w = data.get('w');
      if (isNumber(w)) {
        switch (parseInt(w, 10)) {
          case 1:
            this.selectIndex = 1;
            break;
          case 2:
            this.selectIndex = 2;
            break;
          default:
            break;
        }
      }

    });

  }

  get name() {
    return this.resumeForm.get('name');
  }
  get birth() {
    return this.resumeForm.get('birth');
  }
  get email() {
    return this.resumeForm.get('email');
  }
  get mobile() {
    return this.resumeForm.get('mobile');
  }
  get company() {
    return this.resumeForm.get('company');
  }
  get position() {
    return this.resumeForm.get('position');
  }

 

  sendSMS() {
    const formValue: any = { mobile: this.activeMobile.value };
    this.showProgress = true;
    this.userService.post(baseConfig.sendBindCode, formValue).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('验证码短信已经发送，请查收', '', { duration: 5000 });
        } else {
          this.userService.showError1(result, () => { this.sendSMS(); } );
        }
        this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.sendSMS(); });
        this.showProgress = false;
      }
    );

    // 开始倒计时
    this.start();
  }

  start() {
    if (this.countDown < 60) {
      this.countDown ++;
      this.countDownLabel = (60 - this.countDown) + '';
      setTimeout(() => {
        this.start();
      }, 1000);
    }else if( this.countDown === 100){
      this.countDownLabel = '成功';
      this.countDown = 0;
    } 
    else{
      this.countDownLabel = '重新获取';
      this.countDown = 0;
    }
  }

  active(){

    const formValue: any = { mobile: this.activeMobile.value , code: this.mobileCode.value};
    this.commandService.setMessage(1);
    this.showProgress = true;
    this.userService.post(baseConfig.activeMobile, formValue).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          if ( this.countDown > 0 && this.countDown < 60) {
            this.countDown = 100 ;
          } else {
            this.countDownLabel = '成功';
          }
          this.mobileCode.reset();
          this.snackBar.open('绑定成功', '', { duration: 5000 });
          // 为了 手机号 重新从服务端获取，也可以直接写到LS中
          this.ngOnInit();
        } else {
          this.userService.showError1(result, () => {this.active(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.active(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );
  }


  sendChangeSMS() {
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.sendChangeCode, '').subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('验证码短信已经发送，请查收', '', { duration: 5000 });
        } else {
          this.userService.showError1(result, () => { this.sendChangeSMS(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.sendChangeSMS(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );

    // 开始倒计时
    this.startChange();
  }

  startChange() {
    if (this.changeCountDown < 60) {
      this.changeCountDown ++;
      this.changeCountDownLabel = (60 - this.changeCountDown) + '';
      setTimeout(() => {
        this.startChange();
      }, 1000);
    } else if(this.changeCountDown === 100) {
        this.changeCountDownLabel = '成功';
        this.changeCountDown = 0; 
    } 
    else{
      this.changeCountDownLabel = '重新获取';
      this.changeCountDown = 0;
    }
  }

  change() {
    const formValue: any = { userAuth: this.changePwd.value , code: this.changeCode.value};
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.userChangeAuth, formValue).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          if ( this.changeCountDown > 0 &&  this.changeCountDown < 60 ){
            this.changeCountDown = 100;
          } else {
            this.changeCountDownLabel = '成功';
          }

          this.changeCode.reset();
          this.snackBar.open('密码修改成功', '', { duration: 3000 });
          this.changePwd.reset();
        } else {
          this.userService.showError1(result, () => {this.change(); });

        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.change(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );
  }





  updateResume() {

    console.log(this.resumeForm.value);
    this.commandService.setMessage(1);
    this.showProgress = true;
    this.userService.post(baseConfig.userUpdateResume, this.resumeForm.value).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('修改成功', '', { duration: 3000 });
          this.userInfo = result.data;
          window.localStorage.setItem(lsDefine.userInfo, JSON.stringify(this.userInfo));
          this.commandService.setMessage(4);
        } else {
          this.userService.showError1(result, () => { this.updateResume(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.updateResume(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );

  }

  selectImg(e: any ) {
    const dialogRef = this.dialog.open(ImageCropComponent, {
      // height: '400px',
      width: '300px',
      data: { target: e }
    });
    dialogRef.afterClosed().subscribe((resultData: any) => {
      // console.log(resultData);
      if (resultData) {
        this.uploadPic(getBlobByBase64(resultData));
      }
    });
  }

  uploadPic(bob: Blob) {
    const postData: FormData = new FormData();
    postData.append('file', bob, 'up.jpg');
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.postFormData(baseConfig.headPic, postData).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.resumeForm.patchValue({
            avatar: result.data
          });
          this.headPicSrc = environment.media + '/activity/images' + result.data;
        } else {
          this.userService.showError1(result, () => {this.uploadPic(bob); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.uploadPic(bob); });
        this.showProgress = false;
        this.commandService.setMessage(0);
     }
    );
  }
}
