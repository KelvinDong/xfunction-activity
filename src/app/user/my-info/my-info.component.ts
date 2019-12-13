import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';

import { UserService, Result, User } from '../user.service';
import { baseConfig, urlDefine, regDefine, lsDefine } from '../../ts/base-config';

import { MatSnackBar } from '@angular/material';
import { SlideControlComponent } from 'src/app/define/slide-control/slide-control.component';
import { getAndSavePath, forbiddenRegValidator, isNumber } from 'src/app/ts/base-utils';

@Component({
  selector: 'app-my-info',
  templateUrl: './my-info.component.html',
  styleUrls: ['./my-info.component.css']
})
export class MyInfoComponent implements OnInit {


  title = '用户信息';
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


  constructor(
    private userService: UserService,
    public snackBar: MatSnackBar,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {

    getAndSavePath(this.activeRoute);

    // 重新获取用户基础信息,也达到更新token的目的
    this.showProgress = true;
    this.userService.post(baseConfig.userGet, {}).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.userInfo = result.data;
          window.localStorage.setItem(lsDefine.userInfo, JSON.stringify(this.userInfo));
          this.activeMobile.setValue(this.userInfo.userMobile);
          this.resumeForm.patchValue(this.userInfo);
        } else { // 基本信息不完整 ，转到首页去，
          this.userService.showError(result);
          this.router.navigateByUrl(urlDefine.indexUrl);
        }
        this.showProgress = false;
      },
      (error: Result) => { // 基本信息不完整 ，转到首页去，
        this.userService.showError(error);
        this.router.navigateByUrl(urlDefine.indexUrl);
        this.showProgress = false;
      }
    );

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
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError(error);
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
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError(error);
        this.showProgress = false;
      }
    );
  }


  sendChangeSMS() {
    this.showProgress = true;
    this.userService.post(baseConfig.sendChangeCode, '').subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('验证码短信已经发送，请查收', '', { duration: 5000 });
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError(error);
        this.showProgress = false;
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
          this.userService.showError(result);

        }
        this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError(error);
        this.showProgress = false;
      }
    );
  }





  updateResume() {

    console.log(this.resumeForm.value);

    this.showProgress = true;
    this.userService.post(baseConfig.userUpdateResume, this.resumeForm.value).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('修改成功', '', { duration: 3000 });
          this.userInfo = result.data;
          window.localStorage.setItem(lsDefine.userInfo, JSON.stringify(this.userInfo));
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError(error);
        this.showProgress = false;
      }
    );

  }
}
