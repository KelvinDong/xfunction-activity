import { Component, OnInit, ViewChild } from '@angular/core';
import { SlideControlComponent } from 'src/app/define/slide-control/slide-control.component';
import { urlDefine, regDefine, baseConfig } from 'src/app/ts/base-config';
import { MatHorizontalStepper, MatSnackBar } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { forbiddenRegValidator } from 'src/app/ts/base-utils';
import { UserService, Result } from '../user.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {

  title = '找回密码';
  showProgress = false;

  @ViewChild(MatHorizontalStepper, { static: false })
  stepper: MatHorizontalStepper;
  isLinear = false;
  firstCompleted = false;

  @ViewChild(SlideControlComponent, { static: false })
  slide: SlideControlComponent;
  move: number;
  private action: number[];

  hide = true;
  urlDefine = urlDefine;

  userName = '';

  changeCountDown = 0;
  changeCountDownLabel = '获取短信验证码';
  bindMobile = new FormControl('', [
    Validators.required, forbiddenRegValidator(regDefine.mobile)]);
  changeCode = new FormControl('', [
    Validators.required, forbiddenRegValidator(regDefine.mobileCode)]);
  changePwd = new FormControl('', [Validators.required, forbiddenRegValidator(regDefine.password)]);

  constructor(
    private userService: UserService,
    public snackBar: MatSnackBar,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
  }

  sendSMS() {
    const formValue: any = { mobile: this.bindMobile.value, action: this.action, move: this.move};
    this.firstCompleted = true;
    this.showProgress = true;
    this.userService.post(baseConfig.sendResetCode, formValue).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.userName = result.data;
          this.stepper.next();
          this.snackBar.open('验证码短信已经发送，请查收', '', { duration: 5000 });
        } else {
          this.userService.showError(result);
          this.reset();
        }
        this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError(error);
        this.showProgress = false;
        this.reset();
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
    } else {
      this.changeCountDownLabel = '重新获取';
      this.changeCountDown = 0;
    }
  }

  change() {
    const formValue: any = { userMobile: this.bindMobile.value, userAuth: this.changePwd.value,
      code: this.changeCode.value, action: this.action, move: this.move};
    this.showProgress = true;
    this.userService.post(baseConfig.resetUser, formValue).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('修改成功', '', { duration: 5000 });
          this.router.navigateByUrl(urlDefine.loginUrl);
        } else {
          this.userService.showError(result);
          this.reset();
        }
        this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError(error);
        this.showProgress = false;
        this.reset();
      }
    );
  }

  private reset() {
    this.firstCompleted = false;
    this.stepper.reset();
    this.changeCode.reset();
    this.changePwd.reset();
    this.move = undefined;
    this.action = [];
    this.slide.reset();
  }

  successMatch({ move, action }) {
    this.move = move;
    this.action = action;
  }
}
