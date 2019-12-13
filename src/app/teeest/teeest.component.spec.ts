import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeeestComponent } from './teeest.component';

describe('TeeestComponent', () => {
  let component: TeeestComponent;
  let fixture: ComponentFixture<TeeestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeeestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeeestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
