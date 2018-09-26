/* =========================================================================
 *
 *  vector.ts
 *  T-D vector data
 *  T:type,default setting is number
 *  D:dimension
 * ========================================================================= */
/// <reference path="./math_utils.ts" />
module EcognitaMathLib {
    export class Vector {
        private _elements: Array<number>;
        private _dimension: number;

        //constructs vector with parameters or zero
        constructor(dimension: number, params?: Array<number>) {
            this._dimension = dimension;
            if (params == undefined) {
                //init n dimension vector data,setting all 0
                this._elements = new Array<number>(dimension);
                for (var _i = 0; _i < dimension; _i++) {
                    this._elements[_i] = 0;
                }
            } else {
                this._elements = new Array<number>(dimension);
                for (var _i = 0; _i < params.length; _i++) {
                    this._elements[_i] = params[_i];
                }
            }
        }

        set(params: Vector) {
            if (params.size() != this.size()) {
                console.log("dimension is not correct!");
                return undefined;
            }
            for (var _i = 0; _i < params.size(); _i++) {
                this._elements[_i] = params.data()[_i];
            }
        }

        setZero() {
            for (var _i = 0; _i < this._dimension; _i++) {
                this._elements[_i] = 0;
            }
        }

        data() { return this._elements }

        at(idx: number) {
            if (idx < 0 || idx >= this.size()) {
                console.log("index is not correct!");
                return undefined;
            }
            return this._elements[idx];
        }

        dot(others: Vector) {
            if (others.size() != this.size()) {
                console.log("dimension is not correct!");
                return undefined;
            }

            let ret = 0;
            for (var _i = 0; _i < this.size(); _i++) {
                ret += this._elements[_i] * others.data()[_i];
            }
            return ret;
        }

        lengthSquared() { return this.dot(this); }

        length() { return Math.sqrt(this.lengthSquared()); }

        normalize() { this.idiv(this.length()); }

        sum() {
            let ret = 0;
            for (var _i = 0; _i < this._dimension; _i++) {
                ret += this._elements[_i];
            }
            return ret;
        }

        size() { return this._dimension; }

        avg() { return this.sum() / this.size(); }

        min() {
            let minVal = this._elements[0];

            for (var _i = 1; _i < this._dimension; _i++) {
                minVal = Math.min(minVal, this._elements[_i]);
            }
            return minVal;
        }

        max() {
            let maxVal = this._elements[0];
            for (var _i = 1; _i < this._dimension; _i++) {
                maxVal = Math.max(maxVal, this._elements[_i]);
            }
            return maxVal;
        }

        absmax() {
            let absMaxVal = this._elements[0];
            for (var _i = 1; _i < this._dimension; _i++) {
                absMaxVal = EcognitaMathLib.absmax(absMaxVal, this._elements[_i]);
            }
            return absMaxVal;
        }

        absmin() {
            let absMinVal = this._elements[0];
            for (var _i = 1; _i < this._dimension; _i++) {
                absMinVal = EcognitaMathLib.absmin(absMinVal, this._elements[_i]);
            }
            return absMinVal;
        }

        distanceSquaredTo(others: Vector) {
            if (others.size() != this.size()) {
                console.log("dimension is not correct!");
                return undefined;
            }

            let ret = 0;
            for (var _i = 0; _i < this.size(); _i++) {
                let diff = this._elements[_i] - others.data()[_i];
                ret += diff * diff;
            }

            return ret;
        }

        distanceTo(others: Vector) {
            return Math.sqrt(this.distanceSquaredTo(others));
        }

        isEqual(others: Vector) {
            if (this.size() != others.size()) return false;

            for (var _i = 0; _i < this.size(); _i++) {
                if (this.at(_i) != others.at(_i)) return false;
            }

            return true;
        }

        isSimilar(others: Vector, epsilon: number) {
            if (this.size() != others.size()) return false;

            for (var _i = 0; _i < this.size(); _i++) {
                if (Math.abs(this.at(_i) - others.at(_i)) > epsilon) return false;
            }

            return true;
        }

        add(params?: any) {

            if (typeof (params) == 'object') {
                let v = params;
                if (v.size() != this.size()) return undefined;

                let newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] += v.data()[_i];
                }

                return newV;
            } else if (typeof (params) == 'number') {
                let s = params;
                let newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] += s;
                }

                return newV;
            }

            return undefined;

        }

        sub(params?: any) {

            if (typeof (params) == 'object') {
                let v = params;
                if (v.size() != this.size()) return undefined;

                let newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] -= v.data()[_i];
                }

                return newV;
            } else if (typeof (params) == 'number') {
                let s = params;
                let newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] -= s;
                }

                return newV;
            }

            return undefined;

        }

        mul(params?: any) {

            if (typeof (params) == 'object') {
                let v = params;
                if (v.size() != this.size()) return undefined;

                let newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] *= v.data()[_i];
                }

                return newV;
            } else if (typeof (params) == 'number') {
                let s = params;
                let newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] *= s;
                }

                return newV;
            }

            return undefined;

        }

        div(params?: any) {


            if (typeof (params) == 'object') {
                let v = params;
                if (v.size() != this.size()) return undefined;

                let newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] /= v.data()[_i];
                }

                return newV;
            } else if (typeof (params) == 'number') {

                let s = params;
                if (s == 0) return undefined;
                let newV = new Vector(this.size(), this.data());
                for (var _i = 0; _i < newV.size(); _i++) {
                    newV.data()[_i] /= s;
                }

                return newV;
            }

            return undefined;
        }

        idiv(params?: any) { this.set(this.div(params)); }

        iadd(params?: any) { this.set(this.add(params)); }

        isub(params?: any) { this.set(this.sub(params)); }

        imul(params?: any) { this.set(this.mul(params)); }

        setAt(idx: number, val: number) {
            if (idx < 0 || idx >= this.size()) {
                return undefined;
            }

            this._elements[idx] = val;
        }

    }
}

