const {expect} = require('chai')
const { compareText } = require('../../sysUtils/compareText')
const {createMobxStore, constructorParams, fieldCode, instanceParams} = require('./createMobxStore')

describe('constructorParams', () => {
    it('TS', () => {
        expect(constructorParams({isTS: true, fields: [
            {fieldName: 'noParam', isParam: false, type: 'string'},
            {fieldName: 'par1', isParam: true, type: 'string'},
            {fieldName: 'par2', isParam: true, type: 'number'},
            {fieldName: 'par3', isParam: true, type: 'boolean', initValue: 'true'},
            {fieldName: 'par4', isParam: true, type: 'string'},
        ]}).join(', ')).to.equal('par1: string, par2: number, par3: boolean = true, par4: string = ""')
    })
    it('JS', () => {
        expect(constructorParams({isTS: false, fields: [
            {fieldName: 'noParam', isParam: false, type: 'string'},
            {fieldName: 'par1', isParam: true, type: 'string'},
            {fieldName: 'par2', isParam: true, type: 'number'},
            {fieldName: 'par3', isParam: true, type: 'boolean', initValue: 'true'},
            {fieldName: 'par4', isParam: true, type: 'string'},
        ]}).join(', ')).to.equal('par1, par2, par3 = true, par4 = ""')
    })
})

describe('instanceParams', () => {
    it('default', () => {
        expect(instanceParams([
            // Field is not contains in parameters list
            {fieldName: 'field1', isParam: false, type: 'string'},
            // Parameter without an initial value and with a test value - use test value
            {fieldName: 'par1', isParam: true, type: 'string', testValue: '"first"'},
            // Parameter without an initial value and without a test value - use default value for type
            {fieldName: 'par2', isParam: true, type: 'number'},
            // Parameter with an initial value but without test value - can't be skipped because next param have a test value
            {fieldName: 'par3', isParam: true, type: 'boolean', initValue: 'true'},
            // this shadow parameter have a test value, so it included in params list
            {fieldName: 'par4', isParam: true, type: 'string', testValue: '"second"'},
            // this shadow parameter is not included into params list
            {fieldName: 'par5', isParam: true, type: 'any'},
        ]).join(', ')).to.equal('"first", 0, false, "second"')
    })
    it('without test values', () => {
        expect(instanceParams([
            // Field is not contains in parameters list
            {fieldName: 'field1', isParam: false, type: 'string'},
            // Parameter without an initial value - required
            {fieldName: 'par1', isParam: true, type: 'string' },
            // second required parameter
            {fieldName: 'par2', isParam: true, type: 'number'},
            // shadow parameter
            {fieldName: 'par3', isParam: true, type: 'boolean', initValue: 'true'},
            // this shadow parameter with default value
            {fieldName: 'par4', isParam: true, type: 'string'},
        ]).join(', ')).to.equal('"", 0')
    })
})

describe('fieldCode', () => {
    it('TS field + initial value', () => {
        expect(fieldCode({
            isTS: true, fieldName: 'field', isParam: false, type: 'string', initValue: '"Hello!"',
            mobx: { exportStore: false, fields: [] }
        })).to.deep.equal([
            `field: string = "Hello!";`,
            `setField(field: string) {`,
            `  this.field = field;`,
            `}`
        ])
    })
    it('JS field + initial value', () => {
        expect(fieldCode({
            isTS: false, fieldName: 'field', isParam: false, type: 'string', initValue: '"Hello!"'
        })).to.deep.equal([
            `field = "Hello!";`,
            `setField(field) {`,
            `  this.field = field;`,
            `}`
        ])
    })
    it('TS param', () => {
        expect(fieldCode({
            isTS: true, fieldName: 'param', isParam: true, type: 'string', initValue: '"Hello!"'
        })).to.deep.equal([
            `param: string;`,
            `setParam(param: string) {`,
            `  this.param = param;`,
            `}`
        ])
    })
    it('JS param', () => {
        expect(fieldCode({
            isTS: false, fieldName: 'param', isParam: true, type: 'string', initValue: '"Hello!"'
        })).to.deep.equal([
            `param = "";`,
            `setParam(param) {`,
            `  this.param = param;`,
            `}`
        ])
    })
})

describe('createMobxStore', () => {
    it('Not use MobX', () => {
        const {mobxClassName, mobxStoreName, mobxFileName, mobxCode} = createMobxStore({
            name: 'MyComp',
            useMobX: false,
        })
        expect(mobxFileName).to.equal('')
        expect(mobxClassName).to.equal('')
        expect(mobxStoreName).to.equal('')
    })
    it('different fields with TS', () => {
        const {mobxClassName, mobxStoreName, mobxFileName, mobxCode} = createMobxStore({
            name: 'MyComp',
            useMobX: true,
            isTS: true,
            mobx: {
                exportStore: true,
                fields: [
                    {fieldName: "sFieldVal", isParam: false, type: "string", initValue: '"first"'},
                    {fieldName: "nField", isParam: false, type: 'number', initValue: ''},
                    {fieldName: "sParReq", isParam: true, type: "string", initValue: '', testValue: '"second"'},
                    {fieldName: "bParReq", isParam: true, type: "boolean", initValue: ''},
                    {fieldName: 'nPar', isParam: true, type: 'number', initValue: '123'},
                ],
            }
        })
        expect(mobxFileName).to.equal('MyCompStore.ts')
        expect(mobxClassName).to.equal('MyCompStore')
        expect(mobxStoreName).to.equal('myCompStore')
        compareText(mobxCode,
`import { makeAutoObservable } from "mobx";

export class MyCompStore {
  constructor(sParReq: string, bParReq: boolean, nPar: number = 123) {
    this.sParReq = sParReq;
    this.bParReq = bParReq;
    this.nPar = nPar;
    makeAutoObservable(this);
  }
  sFieldVal: string = "first";
  setSFieldVal(sFieldVal: string) {
    this.sFieldVal = sFieldVal;
  }
  nField: number = 0;
  setNField(nField: number) {
    this.nField = nField;
  }
  sParReq: string;
  setSParReq(sParReq: string) {
    this.sParReq = sParReq;
  }
  bParReq: boolean;
  setBParReq(bParReq: boolean) {
    this.bParReq = bParReq;
  }
  nPar: number;
  setNPar(nPar: number) {
    this.nPar = nPar;
  }
}

export const myCompStore = new MyCompStore("second", false);
`
        )
    })
    it('different fields with JS', () => {
        const {mobxClassName, mobxStoreName, mobxFileName, mobxCode} = createMobxStore({
            name: 'MyComp',
            useMobX: true,
            isTS: false,
            mobx: {
                exportStore: true,
                fields: [
                    {fieldName: "sFieldVal", isParam: false, type: "string", initValue: '"first"'},
                    {fieldName: "nField", isParam: false, type: 'number', initValue: ''},
                    {fieldName: "sParReq", isParam: true, type: "string", initValue: '', testValue: '"second"'},
                    {fieldName: "bParReq", isParam: true, type: "boolean", initValue: ''},
                    {fieldName: 'nPar', isParam: true, type: 'number', initValue: '123'},
                ],
            }
        })
        expect(mobxFileName).to.equal('MyCompStore.js')
        expect(mobxClassName).to.equal('MyCompStore')
        expect(mobxStoreName).to.equal('myCompStore')
        compareText(mobxCode,
`import { makeAutoObservable } from "mobx";

export class MyCompStore {
  constructor(sParReq, bParReq, nPar = 123) {
    this.sParReq = sParReq;
    this.bParReq = bParReq;
    this.nPar = nPar;
    makeAutoObservable(this);
  }
  sFieldVal = "first";
  setSFieldVal(sFieldVal) {
    this.sFieldVal = sFieldVal;
  }
  nField = 0;
  setNField(nField) {
    this.nField = nField;
  }
  sParReq = "";
  setSParReq(sParReq) {
    this.sParReq = sParReq;
  }
  bParReq = false;
  setBParReq(bParReq) {
    this.bParReq = bParReq;
  }
  nPar = 0;
  setNPar(nPar) {
    this.nPar = nPar;
  }
}

export const myCompStore = new MyCompStore("second", false);
`
        )
    })
})
