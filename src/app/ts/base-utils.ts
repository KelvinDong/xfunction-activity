import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { lsDefine } from './base-config';

export function forbiddenRegValidator(RegRe: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = RegRe.test(control.value || ''); // 解决服务送过来null值
    return forbidden ? null : { forbiddenReg: { value: control.value } };
  };
}

// String
export function isEmpty(str: any) {
  if (str === '' || str === undefined || str == null) {
    return true;
  } else {
    return false;
  }
}


export function getUserAvatar() {
  const userInfo: string = window.localStorage.getItem(lsDefine.userInfo);
  if (isEmpty(userInfo)) {
    return null;
  } else {
    return JSON.parse(userInfo).userAvatar;
  }

}


export function getUserMobile() {
  const userInfo: string = window.localStorage.getItem(lsDefine.userInfo);
  if (isEmpty(userInfo)) {
    return null;
  } else {
    return JSON.parse(userInfo).userMobile;
  }

}

export function getUserToken() {
  const userInfo: string = window.localStorage.getItem(lsDefine.userInfo);
  if (isEmpty(userInfo)) {
    return undefined;
  } else {
    // console.log(JSON.parse(userInfo).accessToken);
    return JSON.parse(userInfo).accessToken;
  }

}

export function getAndSavePath(activeRoute: ActivatedRoute) {

  window.localStorage.setItem(lsDefine.redirectUrl, window.location.href);

}

export function isNumber(val: string) {
  const regPos = /^\d+(\.\d+)?$/; // 非负浮点数
  const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; // 负浮点数
  if (regPos.test(val) || regNeg.test(val)) {
    return true;
  } else {
    return false;
  }
}

export function convertDateFromString(dateString: string) {
  if (dateString) {
    dateString = dateString.replace(/-/g, '/');
    const date = new Date(dateString);
    return date;
  }
}


// 获得当前时间 2019-02-02 14:06:08
export function getNowTime() {
  // 加0
  function add_10(num: any) {
    if (num < 10) {
      num = '0' + num;
    }
    return num;
  }
  const myDate = new Date();
  // myDate.getYear(); // 获取当前年份(2位)
  // myDate.getFullYear(); // 获取完整的年份(4位,1970-????)
  // myDate.getMonth(); // 获取当前月份(0-11,0代表1月)
  // myDate.getDate(); // 获取当前日(1-31)
  // myDate.getDay(); // 获取当前星期X(0-6,0代表星期天)
  // myDate.getTime(); // 获取当前时间(从1970.1.1开始的毫秒数)
  // myDate.getHours(); // 获取当前小时数(0-23)
  // myDate.getMinutes(); // 获取当前分钟数(0-59)
  // myDate.getSeconds(); // 获取当前秒数(0-59)
  // myDate.getMilliseconds(); // 获取当前毫秒数(0-999)
  // myDate.toLocaleDateString(); // 获取当前日期
  const nowTime = myDate.getFullYear() + '-' + add_10(myDate.getMonth())
    + '-' + myDate.getDate() + ' ' + add_10(myDate.getHours()) + ':' + add_10(myDate.getMinutes()) + ':' + add_10(myDate.getSeconds());
  return nowTime;
}

export function getBlobByBase64(base64String) {
  const arr = base64String.split(',');
  const mine = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type: mine});
}

export function canvasDataURL(base64, reWidth: number, that, callback) {
  const img = new Image();
  img.src = base64;
  img.onload = (): any => {
    const canvas = document.createElement('canvas'); // 创建一个canvas元素
    const context = canvas.getContext('2d'); // context相当于画笔，里面有各种可以进行绘图的API
    let w = img.width;
    let h = img.height;
    if (w > reWidth) {
      w = reWidth;
      h = (img.height / img.width) * w;
    }
    const quality = 1;  // 默认图片质量为0.7
    canvas.width = w;
    canvas.height = h;
    context.drawImage(img, 0, 0, w, h);
    const result = canvas.toDataURL('image/jpeg', quality);
    const bob = getBlobByBase64(result);
    callback(bob, that);
  };

}

// 识别设备
export function isExplorer(name) {
  const u = navigator.userAgent.toLocaleLowerCase();
  console.log(u);
  const system = {};
  ['mobile', 'iphone', 'android', 'micromessenger', 'chrome'].forEach(function(name) {
      system[name] = new RegExp(name, 'g').test(u);
  });
  return name === undefined ? system : system[name];
}

export class BaseUtils {

}

