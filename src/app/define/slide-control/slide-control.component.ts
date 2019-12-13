import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { UserService, Result } from '../../user/user.service';



@Component({
  selector: 'app-slide-control',
  templateUrl: './slide-control.component.html',
  styleUrls: ['./slide-control.component.css']
})
export class SlideControlComponent implements OnInit {

  /**
   * 获取dom的几种方法
   * 0、addeventlistener，测试不行，对像的属性不能修改。
   * 1、直接在dom 元素上进行绑定
   * 2、@hostListener
   * 3、Renderer2
   * 4、Rxjs .fromEvent
   * 5、ViewChild
   */

  /**
   * 1、<div [class.change_color]="changecolor" > 获取class中的change_color样式，是否使用该样式，取决于后台changecolor的值（true或者false）
   * 2、<div ngClass="{'class1': showFlag,'class2': !showFlag}"
   * 3、<div [className]=""
   */
  @Input() showOnce = false;   // 直接显示
  @Output() successMatch: EventEmitter<any> = new EventEmitter();

  private slider: any;
  private puzzleBefore: any;
  private sliderContainer: any;
  private sliderMask: any;
  private sliderText: any;
  private puzzleBox: any;
  private puzzleBase: any;
  private puzzleMask: any;

  // private puzzleBoxFlag = false; 原打算 用ngIf来控制显示，但会导致其中的元素得不到。
  isMouseDown = false;
  private trail: number[] = []; // 特别要注意此处要初始化
  private originX: any;
  private originY: any;
  private w: any = 310; // bsePuzzle的宽度
  private h: any = 155; // basePuzzle的高度
  private L: any = 62; // puzzle的边长

  private pngBase64 = 'data:image/png;base64,';
  private jpgBase64 = 'data:image/jpeg;base64,';

  result: Result;

  constructor(
    private el: ElementRef,
    private userService: UserService
  ) { }


  ngOnInit() {
    this.slider = this.el.nativeElement.querySelector('.slider');
    this.puzzleBefore = this.el.nativeElement.querySelector('.puzzleBefore');
    this.sliderContainer = this.el.nativeElement.querySelector('.sliderContainer');
    this.sliderMask = this.el.nativeElement.querySelector('.sliderMask');
    this.sliderText = this.el.nativeElement.querySelector('.sliderText');
    this.puzzleBox = this.el.nativeElement.querySelector('.puzzleBox');
    this.puzzleBase = this.el.nativeElement.querySelector('.puzzleBase');
    this.puzzleMask = this.el.nativeElement.querySelector('.puzzleMask');
    this.draw();
    if (this.showOnce){
      this.puzzleBox.style.display = 'block';
    }
  }

  touchStart(e: any) {

    this.originX = e.clientX || e.touches[0].clientX;
    this.originY = e.clientY || e.touches[0].clientY;
    this.isMouseDown = true;
    this.puzzleBox.style.display = 'block';
    this.puzzleMask.style.display = 'block';

  }


  touchMove(e: any) {

    // console.log(this.isMouseDown);

    if (!this.isMouseDown) {
      return false;
    }

    const eventX = e.clientX || e.touches[0].clientX;
    const eventY = e.clientY || e.touches[0].clientY;

    const moveX = eventX - this.originX;
    const moveY = eventY - this.originY;
    if (moveX < 0 || moveX + 38 >= this.w) {
      return false;
    }
    this.slider.style.left = moveX + 'px';
    // console.log('slide move' + moveX);
    const blockLeft = (this.w - this.L) / (this.w - 40) * moveX;
    this.puzzleBefore.style.left = blockLeft + 'px';
    // console.log('puzzleBefore move' + blockLeft);
    this.sliderContainer.classList.add('sliderContainer_active');
    this.sliderMask.style.width = moveX + 'px';
    this.trail.push(moveY);

  }

  touchEnd(e: any) {

    // console.log('touchend');
    if (!this.isMouseDown) {
      return false;
    }
    this.isMouseDown = false;

    this.sliderContainer.classList.remove('sliderContainer_active');
    this.puzzleMask.style.display = 'none';

    const eventX = e.clientX || e.changedTouches[0].clientX;
    if (eventX === this.originX) {
      return false;
    }

    // 以下为向服务调用，验证和获取图
    // 即时向服务端发起验证，验证通过，该组件返回给父组件，由父组件结合其它参数二次提交服务端。
    // session 作为参数
    // let sum: number = 1;  let 直接赋值，可以不需要定义类型。
    this.userService.vertifyAuthImage({ move: parseInt(this.puzzleBefore.style.left, 10), action: undefined }).subscribe( // 简单验证，最小化数据量
      (data: Result) => {
        this.result = { ...data };
        if (this.result.success) {
          // 可以？应该？返回一个匿名对象， 直接赋值的地方都可以忽略类型定义
          this.successMatch.emit({ move: parseInt(this.puzzleBefore.style.left, 10), action: this.trail });
          this.sliderContainer.classList.add('sliderContainer_success');
          this.puzzleBox.style.display = 'none';
        } else {
          this.userService.showError(this.result);

          this.sliderContainer.classList.add('sliderContainer_fail');
          this.sliderText.innerHTML = '再试一次';
          setTimeout(() => {
            this.reset();
          }, 1000);
        }
      },
      (error: Result) => this.userService.showError(error)
    );

  }


  reset() {
    this.slider.style.left = 0;
    this.puzzleBefore.style.left = 0;
    this.sliderMask.style.width = 0;
    this.sliderContainer.className = 'sliderContainer';
    this.trail = [];
    // 重新调用
    this.draw();
  }

  draw() {
    // console.log('draw()');
    this.userService.getAuthImage().subscribe((data: Result) => {
      this.result = { ...data };
      if (this.result.success) {
        // debugger;
        this.puzzleBase.querySelector('img').src = this.jpgBase64 + this.result.data.bigImage;
        this.puzzleBefore.querySelector('img').src = this.pngBase64 + this.result.data.smallImage;
        this.puzzleBefore.style.top = this.result.data.yheight + 'px';
      } else {
        this.userService.showError(this.result);
      }
    },
      (error: Result) => this.userService.showError(error)
    );
  }

}
