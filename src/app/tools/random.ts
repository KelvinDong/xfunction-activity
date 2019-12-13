
export class Random {
    min: number;
    max: number;
    MATH_RANGE: number;
    _percentage: Map<any, any>;

    constructor(min: number, max: number, percentage = new Map()) {
        this.min = Math.trunc(min);
        this.max = Math.trunc(max);
        this.MATH_RANGE = 1000;  // 分成1000份
        this.percentage = percentage;
    }

    get percentage() {
        if (!this._percentage) {
            this._percentage = new Map();
        }
        return this._percentage;
    }


    set percentage(map) {
        const result: any = Array.from(map.values()).reduce((p: any, v: any, a) => {
            return p - v;
        }, 1);
        // console.log(result);
        // console.log(map);
        for (let i = this.min; i < this.max; i++) {
            if (map.has(i)) {
                this.percentage.set(i, map.get(i));
            } else {
                this.percentage.set(i, result / (this.max - this.min - map.size));
            }
        }
    }


    range() {
        let [start, random, keys] = [0, this.MATH_RANGE, Array.from(this.percentage.keys())];
        for (let i = 0; i < keys.length; i++) {
            let temp = this.percentage.get(keys[i]);
            this.percentage.set(keys[i], [start, start += temp * random]);
        }
    }

    /**
     * 生成随机数
     */
    create() {
        let num = Math.random() * this.MATH_RANGE;
        // console.log('create random-------');
        // console.log(num);
        // console.log(this.percentage);
        for (let data of this.percentage.entries()) {
            if (num >= data[1][0] && num < data[1][1]) {
                return data[0];
            }
        }
        return null;
    }
}