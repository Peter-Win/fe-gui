const {expect} = require('chai')
const {createComponentRows} = require('./Antd5')

describe('createComponentRows', () => {
    it('DatePicker, ts', () => {
        const rows = createComponentRows('DatePicker', true)
        expect(rows).to.eql([
`import type { Moment } from "moment";`,
`import momentGenerateConfig from "rc-picker/lib/generate/moment";`,
`import generatePicker from "antd/es/date-picker/generatePicker";`,
`export const DatePicker = generatePicker<Moment>(momentGenerateConfig);`
        ])
    })

    it('DatePicker, js', () => {
        const rows = createComponentRows('DatePicker', false)
        expect(rows).to.eql([
`import momentGenerateConfig from 'rc-picker/lib/generate/moment';`,
`import generatePicker from 'antd/es/date-picker/generatePicker';`,
`export const DatePicker = generatePicker(momentGenerateConfig);`
        ])
    })

    it('Calendar, ts', () => {
        const rows = createComponentRows('Calendar', true)
        expect(rows).to.eql([
`import type { Moment } from "moment";`,
`import momentGenerateConfig from "rc-picker/lib/generate/moment";`,
`import generateCalendar from "antd/es/calendar/generateCalendar";`,
`export const Calendar = generateCalendar<Moment>(momentGenerateConfig);`
        ])
    })

    it('Calendar, js', () => {
        const rows = createComponentRows('Calendar', false)
        expect(rows).to.eql([
`import momentGenerateConfig from 'rc-picker/lib/generate/moment';`,
`import generateCalendar from 'antd/es/calendar/generateCalendar';`,
`export const Calendar = generateCalendar(momentGenerateConfig);`
        ])
    })

    it('TimePicker, ts', () => {
        const rows = createComponentRows('TimePicker', true)
        const dst = [
`import * as React from "react";`,
`import type { Moment } from "moment";`,
`import type { PickerTimeProps } from "antd/es/date-picker/generatePicker";`,
`import { DatePicker } from "./DatePicker";`,
`export interface PropsTimePicker extends Omit<PickerTimeProps<Moment>, "picker"> {}`,
`export const TimePicker = React.forwardRef<any, PropsTimePicker>((props, ref) => (`,
`  <DatePicker {...props} picker="time" mode={undefined} ref={ref} />`,
`));`,
`TimePicker.displayName = "TimePicker";`,
        ]
        expect(rows).to.eql(dst)
    })

    it('TimePicker, js', () => {
        const rows = createComponentRows('TimePicker', false)
        expect(rows).to.eql([
`import * as React from 'react';`,
`import { DatePicker } from './DatePicker';`,
`export const TimePicker = React.forwardRef((props, ref) => (`,
`  <DatePicker {...props} picker="time" mode={undefined} ref={ref} />`,
`));`,
`TimePicker.displayName = 'TimePicker';`,
                    ])
    })
})