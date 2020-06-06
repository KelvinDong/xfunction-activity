import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { forbiddenRegValidator } from 'src/app/ts/base-utils';
import { regDefine, baseConfig, lsDefine } from 'src/app/ts/base-config';
import { Result } from 'src/app/user/user.service';
import { Observable, throwError } from 'rxjs';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { CommandService } from 'src/app/user/command.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent implements OnInit {

  countDown = 0;
  countDownLabel = '获取';
  mobile: FormControl;
  code = new FormControl('', [
    Validators.required, forbiddenRegValidator(regDefine.mobileCode)]);

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    private commandService: CommandService
  ) { }

  ngOnInit() {
    this.mobile = new FormControl(this.data.userMoble, [
      Validators.required, forbiddenRegValidator(regDefine.mobile)]);
  }

  sendSMS() {
    this.commandService.setMessage(1);
    const formValue: any = { mobile: this.mobile.value };
    this.post(baseConfig.sendLoginCode, formValue).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('验证码短信已经发送，请查收', '', { duration: 5000 });
          // 开始倒计时
          this.start();
        } else {
          this.showError(result);
        }
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.showError(error);
        this.commandService.setMessage(0);
      }
    );

  }

  start() {
    if (this.countDown < 60) {
      this.countDown ++;
      this.countDownLabel = (60 - this.countDown) + '';
      setTimeout(() => {
        this.start();
      }, 1000);
    } else {
      this.countDownLabel = '重新获取';
      this.countDown = 0;
    }
  }

  login(){
    const formValue: any = { userMobile: this.mobile.value, code: this.code.value};
    this.commandService.setMessage(1);
    this.post(baseConfig.userLogin, formValue).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          window.localStorage.setItem(lsDefine.userInfo, JSON.stringify(result.data));
          // 通知调起方，重新进行数据提交
          this.dialogRef.close(true);
          this.commandService.setMessage(4);
        } else {
          this.showError(result);
        }
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.showError(error);
        this.commandService.setMessage(0);
      }
    );
  }


  /*
   以下重复，避免代码循环
  */

  post(url: string, query: any): Observable<Result> {

    const thisHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }), withCredentials: true
    };

    // 这个地方有一个疑问，动态添加head中的内容，没有成功。
    return this.http.post<Result>(environment.api + url, query, thisHttpOptions)
    .pipe(
      tap( _ => console.log(`http://${url}`)), //  记录过程
      catchError(this.handleError)
    );
  }

  private showError(error: Result) {
    // console.log('showError');
    if (error.code === '4000' || error.code === '4001') {  // Token 问题
      this.snackBar.open(error.msg + ',' + (error.errorMsg  === undefined ? '' : error.errorMsg), '', { duration: 3000 });
    } else if (error.code === '400' || error.code === '500' || error.code === '501') { // exception
      alert(error.msg + ',' + (error.errorMsg  === undefined ? '' : error.errorMsg) );
    } else {
      this.snackBar.open(error.msg + ',' + (error.errorMsg  === undefined ? '' : error.errorMsg), '', { duration: 3000 });
    }
  }

  private handleError(error: HttpErrorResponse) {

    let result: Result;
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      result = {success: false, code: '0', msg: 'A client-side or network error occurred.', data: undefined, errorMsg: ''};
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`, error.error);
      if ( error.error.success !== undefined ) {  // 应用错误 返回 Result 格式,BUG需要用户反馈，特别提示；； 另外token失效，也是抛出。
        result = error.error;
      } else { // 服务不正常 如服务器不能连接,不再弹出，常规提示即可。
        result = {success: false, code: '0', msg: 'Server busy, try later.', data: undefined, errorMsg: ''};
        // alert(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
      }
    }
    return throwError(result);
  }
}
