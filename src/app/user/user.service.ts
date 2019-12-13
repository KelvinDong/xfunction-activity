import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, pipe, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router, ActivatedRoute} from '@angular/router';

// 引入自定久久
import { baseConfig, urlDefine} from '../ts/base-config';
import { getUserToken } from '../ts/base-utils';
import { environment } from '../../environments/environment';
import wx from 'weixin-jsapi';
// 引入组件
import { MatSnackBar } from '@angular/material';


/**
 * 原则本service 处理 与http 相关的
 */

export interface WXMessage {
  title: string; // 分享标题
  desc: string; // 分享描述
  link: string; // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
  imgUrl: string;
}

export interface Result {
  success: boolean;
  code: string;
  msg: string;
  errorMsg: string;
  data: any;
}

export interface VertifyQuery{
  move: number;
  action: number[];
}

export interface User{
  userName: string;
  userMobile: string;
  userMail: string;
  accessToken: string;
}

export interface PageQuery {
  offset: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService   {

  getHttpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    }),
    withCredentials: true   // cookies中的session 带上
  };

  constructor(
    private http: HttpClient,
    public snackBar: MatSnackBar,
  ) {
    // console.log('UserService constructor Ed.');
  }

  getAuthImage(): Observable<Result> {
    // console.log('getAuthImage()' + baseConfig.api + baseConfig.getAuthImage);
    return this.http.get<Result>(environment.api + baseConfig.getAuthImage, this.getHttpOptions)
      .pipe(
        tap( _ => console.log('http://getAuthImage')), //  记录过程
        catchError(this.handleError)
      );
  }

  vertifyAuthImage(query: VertifyQuery): Observable<Result> {
    return this.http.post<Result>(environment.api + baseConfig.vertifyAuthImage, query, this.getHttpOptions)
    .pipe(
      tap( _ => console.log('http://vertifyAuthImage')), //  记录过程
      catchError(this.handleError)
    );
  }


  // 以上是历史，以下统一使用以下了
  post(url: string, query: any): Observable<Result> {

    const userToken = getUserToken();

    const thisHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json', 'token': userToken === undefined ? '' : userToken
      }), withCredentials: true
    };

    // 这个地方有一个疑问，动态添加head中的内容，没有成功。

    return this.http.post<Result>(environment.api + url, query, thisHttpOptions)
    .pipe(
      tap( _ => console.log(`http://${url}`)), //  记录过程
      catchError(this.handleError)
    );
  }

  postFormData(url: string, query: any): Observable<Result> {

    const userToken = getUserToken();

    const thisHttpOptions = {
      headers: new HttpHeaders({
        'token': userToken === undefined ? '' : userToken
      }), withCredentials: true
    };

    // 这个地方有一个疑问，动态添加head中的内容，没有成功。

    return this.http.post<Result>(environment.api + url, query, thisHttpOptions)
    .pipe(
      tap( _ => console.log(`http://${url}`)), //  记录过程
      catchError(this.handleError)
    );
  }

  showMe() {
    // console.log('this class name is UserService.');
  }

  showError(error: Result) {
    // console.log('showError');    
    if (error.code === '4000' || error.code === '4001') {  // Token 问题
      this.snackBar.open(error.msg + ',' + (error.errorMsg  === undefined ? '' : error.errorMsg), '', { duration: 3000 });
      window.localStorage.clear();
      window.location.href = urlDefine.loginUrl;
    } else if (error.code === '400' || error.code === '500' || error.code === '501') { // exception
      alert(error.msg + ',' + (error.errorMsg  === undefined ? '' : error.errorMsg) );
    } else {
      this.snackBar.open(error.msg + ',' + (error.errorMsg  === undefined ? '' : error.errorMsg), '', { duration: 3000 });
    }
  }

  
  // 以下为private
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

  weixinShare(object: WXMessage) {
    // const url = window.location.href;
    // console.log(url);
    this.post(baseConfig.getWx2Param, { url: object.link }).subscribe(
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
            jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline']
          });
          wx.ready(() => {
            wx.onMenuShareAppMessage({
              title: object.title, // 分享标题
              desc: object.desc, // 分享描述
              link: object.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
              imgUrl: object.imgUrl, // 分享图标
              type: '', // 分享类型,music、video或link，不填默认为link
              dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
              success:  () => {
                // 用户点击了分享后执行的回调函数
                console.log('share friend success');
              },
              cancel: () => {
                console.log('share friend failed');
              }
            });
            wx.onMenuShareTimeline({
              title: object.title, // 分享标题
              link: object.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
              imgUrl: object.imgUrl, // 分享图标
              success:  () => {
                // 用户点击了分享后执行的回调函数
                console.log('share friend group success');
              },
              cancel: () => {
                console.log('share friend group failed');
              }
            });
          });
          wx.error((res) => {
            console.log(res);
          });
        }
      },
      (error: Result) => { this.showError(error); }
    );
  }
}
