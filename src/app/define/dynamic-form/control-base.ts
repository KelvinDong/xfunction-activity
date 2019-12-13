export class ControlBase<T> {
    value: T;
    key: string;
    label: string;
    required: boolean;
    controlType: string;
    order: number;
    multiple: boolean;
    intro: string;
    options: {key: number, value: string}[] = [];

    constructor(options: {
        value?: T,
        key?: string,
        label?: string,
        required?: boolean,
        controlType?: string,
        order?: number,
        intro?: string,
        multiple?: boolean,
        options?: {key: number, value: string}[]
      } = {}) {
      this.value = options.value;
      this.key = options.key || '0';
      this.label = options.label || '';
      this.required = !!options.required;
      this.controlType = options.controlType || '';
      this.order = options.order || 0;
      this.multiple = options.multiple || false;
      this.options = options.options || [];
      this.intro = options.intro || '';
    }
  }
