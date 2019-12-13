import IconAlignLeft from '!!raw-loader?!quill/assets/icons/align-left.svg';
import IconAlignCenter from '!!raw-loader?!quill/assets/icons/align-center.svg';
import IconAlignRight from '!!raw-loader?!quill/assets/icons/align-right.svg';
import IconAlignJustify from '!!raw-loader?!quill/assets/icons/align-justify.svg';
import Quill from 'quill';

const Parchment = Quill.imports.parchment;
const FloatStyle = new Parchment.Attributor.Style('float', 'float');
const MarginStyle = new Parchment.Attributor.Style('margin', 'margin');
const DisplayStyle = new Parchment.Attributor.Style('display', 'display');
const WidthStyle = new Parchment.Attributor.Attribute('width', 'width');
Parchment.register(FloatStyle);
Parchment.register(MarginStyle);
Parchment.register(DisplayStyle);


export class Toolbar {
    requestUpdate: any;
    toolbar: any;
    options: any;
    overlay: any;
    alignments: any;
    img: any;

    fullAlign;
    fullButton;

    constructor(resizer) {
      this.overlay = resizer.overlay;
      this.img = resizer.img;
      this.options = resizer.options;
      this.requestUpdate = resizer.onUpdate;
    }
    onCreate = () => {
    // Setup Toolbar
        this.toolbar = document.createElement('div');
        Object.assign(this.toolbar.style, this.options.toolbarStyles);
        this.overlay.appendChild(this.toolbar);
  
        // Setup Buttons
        this.defineAlignments();
        this.addToolbarButtons();
    };
  
  // The toolbar and its children will be destroyed when the overlay is removed
    onDestroy = () => {};
  
  // Nothing to update on drag because we are are positioned relative to the overlay
    onUpdate = () => {
        if(!this.fullAlign.isApplied()){
            this.fullButton.style.filter = '';
        }
    }
  
    defineAlignments = () => {
        this.alignments = [
            {
                icon: IconAlignLeft,
                apply: () => {
                    // WidthStyle.remove(this.img);
                    DisplayStyle.add(this.img, 'inline');
                    FloatStyle.add(this.img, 'left');
                    MarginStyle.add(this.img, '0 1em 1em 0');
                    // console.log(this.img.outerHTML);
                },
                isApplied: () => FloatStyle.value(this.img) === 'left',
            },
            {
                icon: IconAlignCenter,
                apply: () => {
                    // WidthStyle.remove(this.img);
                    DisplayStyle.add(this.img, 'block');
                    FloatStyle.remove(this.img);
                    MarginStyle.add(this.img, 'auto');
                    console.log(IconAlignCenter);
                    // console.log(this.img.outerHTML);
                },
                isApplied: () => MarginStyle.value(this.img) === 'auto',
            },
            {
                icon: IconAlignRight,
                apply: () => {
                    // WidthStyle.remove(this.img);
                    DisplayStyle.add(this.img, 'inline');
                    FloatStyle.add(this.img, 'right');
                    MarginStyle.add(this.img, '0 0 1em 1em');

                    // console.log(this.img.outerHTML);
                },
                isApplied: () => FloatStyle.value(this.img) === 'right',
            },
            {
              icon: IconAlignJustify,
              apply: () => {
                  DisplayStyle.remove(this.img, 'inline');
                  FloatStyle.remove(this.img, 'right');
                  MarginStyle.remove(this.img, '0 0 1em 1em');
                  WidthStyle.add(this.img, '100%');
                  // console.log(this.img.outerHTML);
              },
              isApplied: () => WidthStyle.value(this.img) === '100%',
          },
        ];
    }
  
    addToolbarButtons = () => {
      const buttons = [];
      this.alignments.forEach((alignment, idx) => {
        const button = document.createElement('span');
        buttons.push(button);
        button.innerHTML = alignment.icon;

        if (alignment.icon === IconAlignJustify){
            this.fullAlign = alignment;
            this.fullButton = button;
        }

        button.addEventListener('click', () => {
  
          // console.log('click');
            // deselect all buttons
          buttons.forEach(button => button.style.filter = '');
          if (alignment.isApplied()) {
              // If applied, unapply
            FloatStyle.remove(this.img);
            MarginStyle.remove(this.img);
            DisplayStyle.remove(this.img);
            WidthStyle.remove(this.img);
          }	else {
              // otherwise, select button and apply
            this.selectButton(button);
            alignment.apply();
          }
            // image may change position; redraw drag handles
          this.requestUpdate();
        });
        Object.assign(button.style, this.options.toolbarButtonStyles);
        if (idx > 0) {
          button.style.borderLeftWidth = '0';
        }
        // console.log(button.children[0]);
        // Object.assign(button.children[0].style, this.options.toolbarButtonSvgStyles);
        if (alignment.isApplied()) {
          this.selectButton(button);
        }
        this.toolbar.appendChild(button);
      });
    }
  
    selectButton = (button) => {
      button.style.filter = 'invert(20%)';
    }
  
  }