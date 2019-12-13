import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myTiming'
})
export class MyTimingPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {

    const mi =  Math.floor(value / 60);

    let se =  '00' + value % 60;
    se = se.substr(se.length - 2, se.length);

    const result = mi + ':' + se;
    return result;
  }

}
