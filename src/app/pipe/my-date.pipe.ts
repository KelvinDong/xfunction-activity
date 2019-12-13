import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myDate'
})
export class MyDatePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {

    let fmt = args[0];
    const o = {
      'M+': value.getMonth() + 1,
      'd+': value.getDate(),
      'H+': value.getHours(),
      'm+': value.getMinutes(),
      's+': value.getSeconds(),
      'S+': value.getMilliseconds()
    };

    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (value.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    if (/(D+)/.test(fmt)) {
      switch (value.getDay()) {
        case 0:
          fmt = fmt.replace(RegExp.$1, '周一');
          break;
        case 1:
          fmt = fmt.replace(RegExp.$1, '周二');
          break;
        case 2:
          fmt = fmt.replace(RegExp.$1, '周三');
          break;
        case 3:
          fmt = fmt.replace(RegExp.$1, '周四');
          break;
        case 4:
          fmt = fmt.replace(RegExp.$1, '周五');
          break;
        case 5:
          fmt = fmt.replace(RegExp.$1, '周六');
          break;
        default:
          fmt = fmt.replace(RegExp.$1, '周日');
          break;
      }
    }

    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(String(o[k]).length)));
        // console.log(fmt);
      }
    }

    return fmt;
  }

}
