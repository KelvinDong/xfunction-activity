import { Component, OnInit } from '@angular/core';


import * as THREE from 'three';
import * as Stats from 'stats.js';
import TWEEN from '@tweenjs/tween.js';
import { TrackballControls, CSS3DRenderer, CSS3DObject } from 'three-full';
import { canvasDataURL } from 'src/app/ts/base-utils';
import { FormControl } from '@angular/forms';
import { WebsocketService } from 'src/app/ts/websocket.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Params } from '@angular/router';
import { UserService, Result } from 'src/app/user/user.service';
import { baseConfig } from 'src/app/ts/base-config';


@Component({
  selector: 'app-checkin-deom',
  templateUrl: './checkin-deom.component.html',
  styleUrls: ['./checkin-deom.component.css']
})
export class CheckinDeomComponent implements OnInit {

  title = 'checkin';
  showProgress = false;

  componentRunning = true;

  masterColor = 'rgba(0,255,255,1)';
  fontColor = 'rgba(255,255,255,1)';
  backImg = 'url(/assets/images/para.jpg)';

  // table = [];

  entryTotal;
  entryIndex = -1;

  // reformat
  // ini = 0;
  currentTagets = 'table';


  // table 类型
  tableWidth = 20;

  // table 上下移动的步进距离
  yMove20 = 1;
  yMove10 = 1;
  // table 切换去 grid 已经移动的位置
  yMoveBefore = 0;
  yMoveBeforeInit10 = 5000;
  yMoveBeforeInit20 = 0;

  zMove = 2;

  tableCheck = 0;  // 检查是不是在区域中

  elements = [];
  objects = [];
  targets = { table: [], sphere: [], helix: [], grid: [] };


  camera;
  scene;
  renderer;
  //controls;
  stats;

  error: any;                         // 异常信息
  completed = false;                  // 发送完成

  constructor(
    private webSocketService: WebsocketService,
    private activeRoute: ActivatedRoute,
    private userService: UserService,
  ){

  }

  ngOnInit() {

    console.log(window.innerWidth + '  ' + window.innerHeight);

    

    window.addEventListener('resize', () => {
      this.onWindowResize();
    }, false);

    this.activeRoute.params.subscribe((para: Params) => {
      if ( para.id !== undefined) {
        this.showProgress = true;
        this.userService.post(baseConfig.activityMyWallSettingsGet, {
          activityId: para.id,
        }).subscribe(
          (data: Result) => {
            const result = { ...data };
            if (result.success) {
              console.log(result.data);
              this.initData(result.data.total);
              // has checkin
              result.data.names.forEach(name => {
                this.checkinFormat(name);
              });

              // this.initStats();
              this.animate();
              //checkin
              this.webSocketService.connect(environment.ws + `?id=` + para.id);
              this.webSocketService.messageSubject.subscribe(
                data => {
                    console.log(data);
                    if (this.entryIndex < this.entryTotal - 1){
                      this.checkinFormat(data.name);
                      this.gridFormat();
                    }
                },
                err => this.error = err,
                () => this.completed = true
              );
            } else {
              this.userService.showError(result);
            }
            this.showProgress = false;
          },
          (error: Result) => { this.userService.showError(error); this.showProgress = false; },
        );
      }else{
        this.initData(400);
        // this.initStats();
        this.animate();
        this.checkinDemo();
      }
    });
  }

  // 获取总的人数
  initData(total) {
    this.entryTotal = total;
    this.initView();
    /*
    this.yMoveBefore = this.yMoveBeforeInit10;
    this.tableFormat(10);
    */

    this.yMoveBefore = this.yMoveBeforeInit20;
    this.tableFormat(20);
    
  }
  // 模拟
  checkinDemo(){
    setTimeout(() => {
      const name = '马化腾' + (this.entryIndex + 2);
      // 再动画一下
      this.checkinFormat(name);
      this.gridFormat();
      if (this.entryIndex < this.elements.length - 1 ) {
        this.checkinDemo();
      } else {
      // this.gridFormat();
      }
    }, Math.random() * 20000);
  }
 
  // 签到
  checkinFormat(name) {
      this.entryIndex ++;
      // 显示出来
      const e = this.masterColor.substr(0, this.masterColor.lastIndexOf(','));
      const element: HTMLDivElement = this.elements[this.entryIndex];
      element.style.backgroundImage = null;
      element.style.boxShadow = '0px 0px 12px ' + e + ',0.5)';
      element.style.border = '1px solid ' + e + ',0.25)';
      const symbol = document.createElement('div');
      symbol.className = 'symbol';
      symbol.style.color = this.fontColor.substr(0, this.fontColor.lastIndexOf(',')) + ',0.75)';
      symbol.textContent = name.charAt(0);
      symbol.style.textShadow = '0 0 10px ' + e + ',0.95)';
      element.appendChild(symbol);
      const details = document.createElement('div');
      details.className = 'details';
      details.innerHTML = name.substr(1);
      details.style.color = e + ',0.75)';
      element.appendChild(details);

  }

  tableFormat(type) {
    // type 10 20 只有两种
    if (type) {
      this.tableWidth = type ;
      this.targets.table = [];
      for (let i = 0 ; i < this.objects.length; i++) {
        const object1 = new THREE.Object3D();
        object1.position.x = ((i % this.tableWidth + 1) * 140) - (this.tableWidth / 2 + 0.5) * 140;
        object1.position.y = - ((Math.floor(i / this.tableWidth) + 1) * 180) + 990;
        this.targets.table.push(object1);
      }
    }

    

    if (this.tableWidth === 10 ) {

      const top = this.camera.position.y + 180 * 3;
      const bottom = this.camera.position.y - 180 * 30;
      for (let i = 0; i < this.objects.length ; i++) {
        this.scene.remove(this.objects[i]);
        if (this.targets.table[i].position.y <= top && this.targets.table[i].position.y >= bottom ){
          this.scene.add(this.objects[i]);
        }
      }

      this.scene.rotation.y = 0;
      this.scene.rotation.x = 0;

      this.camera.rotation.x = - Math.PI * 1 / 3 ;
      this.camera.position.x = 0 ;
      this.camera.position.z = 1000 ;   // 对应Y应该是1732
      this.camera.position.y = this.yMoveBefore ; // 没有使用 yMoveBefore 这个动作都是重新开始的

      this.transform(this.targets.table, 1000);
      this.currentTagets = 'table';
      return;
    }

    // if (this.tableWidth === 20 ) 
    const top = this.camera.position.y + 180 * 9;
    const bottom = this.camera.position.y - 180 * 9;
    for (let i = 0; i < this.objects.length ; i++) {
      this.scene.remove(this.objects[i]);
      if (this.targets.table[i].position.y <= top && this.targets.table[i].position.y >= bottom ){
        this.scene.add(this.objects[i]);
      }
    }

    // 恢复原状态
    this.camera.position.x = 0;
    this.camera.position.y = this.yMoveBefore;
    this.camera.position.z = 3000;
    this.camera.target = { x: 0, y: this.yMoveBefore, z: 0 };
    this.camera.rotation.x = 0;

    this.transform(this.targets.table, 1000);
    this.currentTagets = 'table';
  }

  gridFormat() {
    // 场景旋转复位
    this.scene.rotation.y = 0;
    this.scene.rotation.x = 0;

    // 保存现场
    if (this.currentTagets === 'table') {
      this.yMoveBefore = this.camera.position.y;
    }

    for (let i = 0; i < this.objects.length ; i++) {
      this.scene.remove(this.objects[i]);
      if (i <= this.entryIndex  &&  i > this.entryIndex - 50 ){
        this.scene.add(this.objects[i]);
      }
    }

    // 指向当前签到的
    const target = this.targets.grid[this.entryIndex];
    this.camera.position.x = target.position.x;
    this.camera.position.y = target.position.y;
    this.camera.position.z = target.position.z + 10;
    this.camera.rotation.x = 0;
    this.camera.target = { x: target.position.x, y: target.position.y, z: target.position.z };

    this.transform(this.targets.grid, 500); // 第一排是看不到的，因为视角已经移过去了
    this.currentTagets = 'grid';

  }

   animate() {
    // requestAnimationFrame(this.animate); //循环调用函数
    // 以下的写法与上面的写法有明显的区别，以上在js中可以，但在typescript是不可行的。

    if (this.currentTagets === 'table') {

      if (this.tableWidth === 10) {

        
        const top = this.camera.position.y + 180 * 3;
        const bottom = this.camera.position.y - 180 * 30;
        for(let i = 0; i< 20;i++){
          this.scene.remove(this.objects[this.tableCheck]);
          if (this.targets.table[this.tableCheck].position.y <= top && this.targets.table[this.tableCheck].position.y >= bottom ){
            this.scene.add(this.objects[this.tableCheck]);
          }
          if (this.tableCheck === this.objects.length - 1){
            this.tableCheck = 0;
          } else {
            this.tableCheck++;
          }
        }
        this.camera.position.y = this.camera.position.y - this.yMove10;
        // this.camera.target = {x: 0, y: 0, z: this.camera.position.y};
        const row = this.objects.length / this.tableWidth;
        const moveDistince = row * 180 ;
        if ( this.camera.position.y < (1732 - moveDistince)) {
          this.camera.position.y = this.yMoveBeforeInit10 ;
        }
        
      }
      if (this.tableWidth === 20) {

        // 本来准备放在定时任务中对全量进行遍历，会产品不流畅的问题，所以改在requestAnimationFrame，每次只检查几个对像。
        const top = this.camera.position.y + 180 * 9;
        const bottom = this.camera.position.y - 180 * 9;
        for(let i = 0; i< 20;i++){
          this.scene.remove(this.objects[this.tableCheck]);
          if (this.targets.table[this.tableCheck].position.y <= top && this.targets.table[this.tableCheck].position.y >= bottom ){
            this.scene.add(this.objects[this.tableCheck]);
          }
          if (this.tableCheck === this.objects.length - 1){
            this.tableCheck = 0;
          } else {
            this.tableCheck++;
          }
        }

        const row = this.entryIndex / this.tableWidth;  // 从自到下，签到的移动，否则看没有签到的没有意思。
        if (row > 10) {
          const moveDistince = -(row - 10) * 180;
          this.camera.position.y = this.camera.position.y - this.yMove20;
          // this.camera.target = { x: 0, y: this.camera.position.y, z: 3000 }; 无需设置，会保持原有的视角。
          if (this.camera.position.y < moveDistince) {
            this.yMove20 = - this.yMove20;
          }
          if (this.camera.position.y > 0) {
            this.yMove20 = - this.yMove20;
          }
        }
      }
    }

    if (this.currentTagets === 'grid') {
      const target = this.targets.grid[this.entryIndex];
      if (this.camera.position.z - target.position.z > 600) {
        this.tableFormat(null);
      } else {
        this.camera.position.z = this.camera.position.z + this.zMove;
      }
    }


    // this.stats.update(); // 更新性能检测框
    requestAnimationFrame(() => {
      this.animate();
    });

    TWEEN.update();

    // this.controls.update();

    this.render();
  }

  initView() {
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
    this.camera.position.z = 3000;
    this.scene = new THREE.Scene();
    for (let i = 0; i < this.entryTotal; i++) {
      const element = document.createElement('div');
      element.className = 'element';
      // element.style.backgroundImage = 'url(/assets/images/trans-black-simple-logo.png)';
      element.style.backgroundColor = this.masterColor.substr(0, this.masterColor.lastIndexOf(','))
                                        + ',' + (Math.random() * 0.5 + 0.25) + ')';
      const number = document.createElement('div');
      number.className = 'number';
      number.textContent = i + 1 + '';
      number.style.color = this.masterColor.substr(0, this.masterColor.lastIndexOf(',')) + ',0.75)';
      element.appendChild(number);

      this.elements.push(element);
      const object = new CSS3DObject(element);
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      this.scene.add(object);
      this.objects.push(object);
      //
      const object1 = new THREE.Object3D();
      object1.position.x = ((i % this.tableWidth + 1) * 140) - (this.tableWidth / 2 + 0.5) * 140;;
      object1.position.y = - ((Math.floor(i / this.tableWidth) + 1) * 180) + 990;
      this.targets.table.push(object1);
    }

    // 参考原点
    // this.initXY();

    // sphere
    const vector = new THREE.Vector3();
    for (let i = 0, l = this.objects.length; i < l; i++) {
      const phi = Math.acos(- 1 + (2 * i) / l);
      const theta = Math.sqrt(l * Math.PI) * phi;
      const object = new THREE.Object3D();
      object.position.setFromSphericalCoords(800, phi, theta);
      vector.copy(object.position).multiplyScalar(2);
      object.lookAt(vector);
      this.targets.sphere.push(object);
    }

    // helix
    const vectorHelix = new THREE.Vector3();
    for (let i = 0, l = this.objects.length; i < l; i++) {
      const theta = i * 0.175 + Math.PI;
      const y = - (i * 8) + 450;
      const object = new THREE.Object3D();
      object.position.setFromCylindricalCoords(900, theta, y);
      vectorHelix.x = object.position.x * 2;
      vectorHelix.y = object.position.y;
      vectorHelix.z = object.position.z * 2;
      object.lookAt(vectorHelix);
      this.targets.helix.push(object);
    }
    // grid
    for (let i = 0; i < this.objects.length; i++) {
      const object = new THREE.Object3D();
      object.position.x = ((i % 5) * 400) - 800;
      object.position.y = (- (Math.floor(i / 5) % 5) * 400) + 800;
      object.position.z = (Math.floor(i / 25)) * 1000 - 2000;
      this.targets.grid.push(object);
    }

    this.renderer = new CSS3DRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector('.content').appendChild(this.renderer.domElement);

    /*
    this.controls = new TrackballControls(this.camera, this.renderer.domElement);
    // this.controls.rotateSpeed = 0.5;
    this.controls.minDistance = 500;
    this.controls.maxDistance = 8000;
    this.controls.addEventListener('change', () => {
      this.render();
    });
    */
  }

  initStats() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  transform(targets, duration) {
    TWEEN.removeAll();
    for (let i = 0; i < this.objects.length; i++) {
      const object = this.objects[i];
      const target = targets[i];
      new TWEEN.Tween(object.position)
        .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
      new TWEEN.Tween(object.rotation)
        .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
    }
    new TWEEN.Tween(this)
      .to({}, duration * 2)
      .onUpdate(() => {
        this.render();
      })
      .start();
  }


  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  fontColorChange(e: string) {
    // console.log(e);
    e = e.substr(0, e.lastIndexOf(','));
    this.fontColor = e + ',1)';
    this.elements.forEach((element: HTMLDivElement) => {
      const symbol: HTMLDivElement = element.querySelector('.symbol');
      if (symbol) { symbol.style.color =  e + ',0.75)'; }
    });
  }
  onCheck(e: any ) {
    if ( e === 10) {
      this.yMoveBefore = this.yMoveBeforeInit10;
    } else {
      this.yMoveBefore = this.yMoveBeforeInit20;
    }
    this.tableFormat(e);
  }

  masterColorChange(e: string) {
    // console.log(e);
    e = e.substr(0, e.lastIndexOf(','));
    this.masterColor = e + ',1)';
    // console.log(e);
    // return;
    /*
      element
        box-shadow: 0px 0px 12px rgba(0,255,255,0.5);
        border: 1px solid rgba(0,255,255,0.25);
      .element .number
        color: rgba(0,255,255,0.75);
      .element .symbol
        text-shadow: 0 0 10px rgba(0,255,255,0.95);
      .element .details
        color: rgba(0,255,255,0.75);
      */
    this.elements.forEach((element: HTMLDivElement) => {
      element.style.boxShadow = '0px 0px 12px ' + e + ',0.5)';
      element.style.border = '1px solid ' + e + ',0.25)';
      element.style.backgroundColor = e + ',' + (Math.random() * 0.5 + 0.25) + ')';
      const number: HTMLDivElement = element.querySelector('.number');
      if (number) { number.style.color = e + ',0.75)'; }
      const symbol: HTMLDivElement = element.querySelector('.symbol');
      if (symbol) { symbol.style.textShadow = '0 0 10px ' + e + ',0.95)'; }
      const details: HTMLDivElement = element.querySelector('.details');
      if (details) { details.style.color = e + ',0.75)'; }

    });

  }

  headPic(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const that = this;
    reader.onload = function(e) {
      that.backImg = 'url(' + this.result + ')';
    };
    reader.readAsDataURL(file);
  }

  initXY() {
    let element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(256,0,0,' + (Math.random() * 0.5 + 0.25) + ')';
    let object = new CSS3DObject(element);
    object.position.x = 0;
    object.position.y = 0;
    object.position.z = 0;
    this.scene.add(object);

    element = document.createElement('div');
    element.style.width = '10px';
    element.style.height = '10px';
    element.style.backgroundColor = 'rgba(256,256,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = 0;
    object.position.y = 0;
    object.position.z = 0;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(0,0,255' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = 0;
    object.position.y = 0;
    object.position.z = 3000;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(256,0,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = -2000;
    object.position.y = -2000;
    object.position.z = -2000;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(256,0,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = 2000;
    object.position.y = -2000;
    object.position.z = -2000;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(256,0,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = -2000;
    object.position.y = 2000;
    object.position.z = -2000;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(256,0,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = 2000;
    object.position.y = 2000;
    object.position.z = -2000;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(256,0,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = -2000;
    object.position.y = -2000;
    object.position.z = 2000;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(256,0,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = 2000;
    object.position.y = -2000;
    object.position.z = 2000;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(256,0,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = -2000;
    object.position.y = 2000;
    object.position.z = 2000;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(256,0,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = 2000;
    object.position.y = 2000;
    object.position.z = 2000;
    this.scene.add(object);


    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(0,255,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = -2000;
    object.position.y = 2000;
    object.position.z = 0;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(0,255,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = 2000;
    object.position.y = -2000;
    object.position.z = 0;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(0,255,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = -2000;
    object.position.y = -2000;
    object.position.z = 0;
    this.scene.add(object);

    element = document.createElement('div');
    element.className = 'element';
    element.style.backgroundColor = 'rgba(0,255,0,' + (Math.random() * 0.5 + 0.25) + ')';
    object = new CSS3DObject(element);
    object.position.x = 2000;
    object.position.y = 2000;
    object.position.z = 0;
    this.scene.add(object);

  }

}
