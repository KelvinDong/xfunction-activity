import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Random } from '../random';
import { UserService, Result } from 'src/app/user/user.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { RotateDialogComponent } from './rotate-dialog/rotate-dialog.component';
import { EventManager } from '@angular/platform-browser';
import { getAndSavePath, getUserToken} from '../../ts/base-utils';
import { ColorWrapperComponent } from 'src/app/define/color-wrapper/color-wrapper.component';

import { bounceInOnEnterAnimation, bounceOutOnLeaveAnimation } from 'angular-animations';
import { baseConfig, urlDefine } from 'src/app/ts/base-config';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { CommandService } from 'src/app/user/command.service';

/**
 * 仅建议奖品不超过12个，奖品名称不超过8个字
 */
@Component({
  selector: 'app-rotate',
  templateUrl: './rotate.component.html',
  styleUrls: ['./rotate.component.css'],
  animations: [
    bounceInOnEnterAnimation(),
    bounceOutOnLeaveAnimation()
  ]
})
export class RotateComponent implements OnInit {

  @ViewChild('canvas', { static: true })
  canvasRef: ElementRef; // 获取dom元素

  @ViewChild(ColorWrapperComponent, { static: false })
  cw: ColorWrapperComponent;

  faHome = faHome;
  urlDefine = urlDefine;

  contentWidth;
  backColor = '#4AD7E2';

  turnWheel = {
    rewardNames: [],				// 转盘奖品名称数组
    outsideRadius: 192,			// 转盘外圆的半径
    textRadius: 155,				// 转盘奖品位置距离圆心的距离
    insideRadius: 68,			// 转盘内圆的半径
    // startAngle: 0,				// 开始角度
    // bRotate: false				// false:停止;ture:旋转
  };

  settingJson = {
    names: ['无人机一台', '扫地机器人一台', '优惠券一张', '空调被一床', '全自动面条机一台',  '纸巾一包', '感谢参与'],
    weights: ['1', '2', '250', '20', '5', '250', '450']
  };

  index;
  indexAward = '';
  showResult = false;

  currentAngle = 0;
  targetAngle = 0;
  random;

  userName;

  done = new Audio(environment.media + '/activity/audio/6666.mp3');

  constructor(
    private userService: UserService,
    private commandService: CommandService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private activeRoute: ActivatedRoute,
    private eventManager: EventManager,
  ) { }


  ngOnInit(): void {

    getAndSavePath(this.activeRoute);

    this.eventManager.addGlobalEventListener('window', 'keydown.space', () => {
      this.start(null);
    });



    this.resetWindow();
    window.onresize = () => {
      this.resetWindow();
    };

    this.initData(); // 采用默认数据

    if (getUserToken()) {
      setTimeout(() => {
        this.getSetting();
        this.commandService.setMessage(2); // hide
      }, 100);
    }

  }

  getSetting(){
    this.userService.post(baseConfig.toolGet, {}).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          if (result.data.toolSettings) {
            const temp = JSON.parse(result.data.toolSettings);
            this.settingJson = temp;
            this.backColor = temp.backColor;
            this.initData();
          }
        } else {
          this.userService.showError1(result, () => { this.getSetting(); });
        }
        // this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.getSetting(); });
        // this.showProgress = false;
      }
    );
  }

  resetWindow() {
    if (window.innerHeight > window.innerWidth) {
      this.contentWidth = window.innerWidth;
    } else {
      this.contentWidth = window.innerHeight;
    }
    if (this.contentWidth > 800) {
      this.contentWidth = 800 + 'px';
    } else {
      this.contentWidth = this.contentWidth + 'px';
    }
    this.drawWheelCanvas();
  }

  initData() {
    const settingResutl = this.settingJson;
    const canvas = this.canvasRef.nativeElement; // 获取到具体元素
    canvas.style.transform = 'rotate(0deg)';
    this.turnWheel.rewardNames = [];
    const weightGroup = [];
    let weightTotal = 0;
    for (let i = 0; i < settingResutl.names.length; i++) {
      if (settingResutl.names[i] !== '') {
        this.turnWheel.rewardNames.push(settingResutl.names[i]);
        weightGroup.push(parseInt(settingResutl.weights[i], 10));
        weightTotal = weightTotal + parseInt(settingResutl.weights[i], 10);
      }
    }
    this.random = new Random(0, this.turnWheel.rewardNames.length);  // length本身不包括
    this.random.percentage = new Map();
    for (let i = 0; i < weightGroup.length; i++) {
      this.random.percentage.set(i, weightGroup[i] / weightTotal);
    }
    this.random.range();
    this.drawWheelCanvas();

  }



  drawWheelCanvas() {

    const canvas = this.canvasRef.nativeElement; // 获取到具体元素
    // 计算每块占的角度，弧度制
    const baseAngle = Math.PI * 2 / (this.turnWheel.rewardNames.length);
    // 获取上下文
    const ctx = canvas.getContext('2d');

    const canvasW = canvas.width; // 画板的高度
    const canvasH = canvas.height; // 画板的宽度
    // 在给定矩形内清空一个矩形
    ctx.clearRect(0, 0, canvasW, canvasH);

    // strokeStyle 绘制颜色
    ctx.strokeStyle = '#FFBE04'; // 红色
    // font 画布上文本内容的当前字体属性
    ctx.font = '16px Microsoft YaHei';

    // 注意，开始画的位置是从0°角的位置开始画的。也就是水平向右的方向。
    // 画具体内容
    for (let index = 0; index < this.turnWheel.rewardNames.length; index++) {
      // 当前的角度
      const angle = index * baseAngle;
      // 填充颜色
      ctx.fillStyle = index % 2 === 0 ? '#FFF4D7' : '#FFFFFF';

      // 开始画内容
      // ---------基本的背景颜色----------
      ctx.beginPath();
      /*
       * 画圆弧，和IOS的Quartz2D类似
       * context.arc(x,y,r,sAngle,eAngle,counterclockwise);
       * x :圆的中心点x
       * y :圆的中心点x
       * sAngle,eAngle :起始角度、结束角度
       * counterclockwise : 绘制方向,可选，False = 顺时针，true = 逆时针
       * */
      ctx.arc(canvasW * 0.5, canvasH * 0.5, this.turnWheel.outsideRadius, angle, angle + baseAngle, false);
      ctx.arc(canvasW * 0.5, canvasH * 0.5, this.turnWheel.insideRadius, angle + baseAngle, angle, true);
      ctx.stroke();
      ctx.fill();
      // 保存画布的状态，和图形上下文栈类似，后面可以Restore还原状态（坐标还原为当前的0，0），
      ctx.save();

      /*----绘制奖品内容----重点----*/
      // 红色字体
      ctx.fillStyle = '#E5302F';
      let rewardName = this.turnWheel.rewardNames[index];
      const lineHeight = 17;
      // translate方法重新映射画布上的 (0,0) 位置
      // context.translate(x,y);
      // 见PPT图片，
      const translateX = canvasW * 0.5 + Math.cos(angle + baseAngle / 2) * this.turnWheel.textRadius;
      const translateY = canvasH * 0.5 + Math.sin(angle + baseAngle / 2) * this.turnWheel.textRadius;
      ctx.translate(translateX, translateY);  // 移动

      // rotate方法旋转当前的绘图，因为文字适合当前扇形中心线垂直的！
      // angle，当前扇形自身旋转的角度 +  baseAngle / 2 中心线多旋转的角度  + 垂直的角度90°
      ctx.rotate(angle + baseAngle / 2 + Math.PI / 2);

      // 下面代码根据奖品类型、奖品名称长度渲染不同效果，如字体、颜色、图片效果。(具体根据实际情况改变)
      // canvas 的 measureText() 方法返回包含一个对象，该对象包含以像素计的指定字体宽度。
      // fillText() 方法在画布上绘制填色的文本。文本的默认颜色是黑色. fillStyle 属性以另一种颜色/渐变来渲染文本
      /*
       * context.fillText(text,x,y,maxWidth);
       * 注意！！！y是文字的最底部的值，并不是top的值！！！
       * */
      ctx.font = '16px Microsoft YaHei';
      if (rewardName.length > 4) {// 奖品名称长度超过一定范围
        rewardName = rewardName.substring(0, 4) + '||' + rewardName.substring(4);
        const rewardNames = rewardName.split('||');
        for (let j = 0; j < rewardNames.length; j++) {
          ctx.fillText(rewardNames[j], -ctx.measureText(rewardNames[j]).width / 2, j * lineHeight);
        }
      } else {
        // 在画布上绘制填色的文本。文本的默认颜色是黑色
        ctx.fillText(rewardName, -ctx.measureText(rewardName).width / 2, 0);
      }

      // 还原画板的状态到上一个save()状态之前
      ctx.restore();

      /*----绘制奖品结束----*/

    }
  }

  start(e: any) {
    if (e) {
      e.stopPropagation();
    }

    if (this.showResult){
      this.showResult = false;
      return;
    }

    this.done.play();

    // console.log(this.turnWheel);
    // console.log(this.random.percentage);

    this.dialog.closeAll();

    if ((this.targetAngle !== this.currentAngle)) {
      return;
    }
    const canvas = this.canvasRef.nativeElement; // 获取到具体元素
    // 归零
    canvas.style.transform = 'rotate(0deg)';
    this.currentAngle = 0;

    const total = this.turnWheel.rewardNames.length;
    const perAngle = 360 / total;


    this.index = this.random.create();
    this.indexAward = this.turnWheel.rewardNames[this.index];

    // 奖品
    // let index = Math.floor(Math.random() * total);

    // console.log(this.turnWheel.rewardNames[this.index]);

    const realAngle = 360 + 270 - perAngle / 2 - perAngle * this.index; // 实际要转的角度
    const shakeAngle = Math.round(Math.random()) > 0 ? Math.random() * perAngle : - Math.random() * perAngle;
    // 根据奖品获得效果角度
    this.targetAngle = realAngle + shakeAngle / 3 +
      // Math.floor(Math.random() * total) * 360 + 720; // 多转的圈数
      12 * 360;

    this.roate(canvas);
    // canvas.style.transform = 'rotate(' + this.angle + 'deg)';
  }

  muteDone(e: any) {
    if (e) {
      this.done.muted = e.target.checked;
      // this.done.play();
    }
  }

  roate(canvas) {
    if (this.targetAngle > this.currentAngle) {
      if (this.targetAngle - this.currentAngle < 45) {
        this.currentAngle = this.currentAngle + 1;
      } else if (this.targetAngle - this.currentAngle < 90) {
        this.currentAngle = this.currentAngle + 5;
      } else if (this.targetAngle - this.currentAngle < 180) {
        this.currentAngle = this.currentAngle + 10;
      } else if ( this.currentAngle < this.targetAngle / 2){
        this.currentAngle = this.currentAngle + 20;
      } else {
        this.currentAngle = this.currentAngle + 30;
      }
      canvas.style.transform = 'rotate(' + this.currentAngle + 'deg)';
      setTimeout(() => {
        this.roate(canvas);
      }, 10);
    } else {
      this.currentAngle = this.targetAngle;
      // 亮出结果
      this.showResult = true;
    }

  }

  setting(e: any) {

    if (e) {
      e.stopPropagation();
    }
    const dialogRef = this.dialog.open(RotateDialogComponent, {
      // height: '400px',
      // width: '90%',
      data: {setting: this.settingJson}
    });
    dialogRef.afterClosed().subscribe((settingResutl: any) => {
      // console.log(settingResutl);
      if (settingResutl){
        this.settingJson = settingResutl;
        settingResutl.backColor = this.backColor;
        this.initData();
        if (this.userName) {
          this.setSetting(settingResutl);
        }
      }
    });
  }
  
  setSetting(settingResutl){
    this.userService.post(baseConfig.toolSet, {toolSettings: JSON.stringify(settingResutl)}).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
        } else {
          this.userService.showError1(result, () => { this.setSetting(settingResutl); });
        }
        // this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.setSetting(settingResutl); });
        // this.showProgress = false;
      }
    );
  }
  /*
  clickBound(){
    console.log('click');
    this.cw.showColorPicker(null);
  }
  */


}
