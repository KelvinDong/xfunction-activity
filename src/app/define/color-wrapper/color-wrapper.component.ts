import { Component, OnInit, Input, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';
import { ColorPickerControl, Color } from '@iplab/ngx-color-picker';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-color-wrapper',
  templateUrl: './color-wrapper.component.html',
  styleUrls: ['./color-wrapper.component.css']
})
export class ColorWrapperComponent implements OnInit {

    public colorControl = new ColorPickerControl();

    public isVisible = false;

    public sizeControl = new FormControl('', [
      Validators.required]);

    @Input()
    public set size(size: string) {
      this.sizeControl.setValue(size);
    }

    @Input()
    public set color(color: string) {
        this.colorControl.setValueFrom(color);
    }

    @Output()
    public sizeChange: EventEmitter<string> = new EventEmitter();

    @Output()
    public colorChange: EventEmitter<string> = new EventEmitter();

    @HostBinding('style.background-color')
    public get background(): string {
        return this.colorControl.value.toRgbaString();
    }

    public ngOnInit() {
        this.colorControl.valueChanges.subscribe((value: Color) => {
          this.colorChange.emit(value.toRgbaString());
        });
    }

    selectChange(e: any) {
      // console.log(e);
      this.sizeChange.emit(e.target.value);
    }

    @HostListener('click', ['$event'])
    public showColorPicker(event: MouseEvent) {
        if (this.isVisible === true) {
            return;
        }

        this.isVisible = !this.isVisible;
    }

    public overlayClick(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isVisible = false;
    }

}
