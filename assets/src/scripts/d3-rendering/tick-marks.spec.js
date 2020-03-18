import {DateTime} from 'luxon';

import {generateTimeTicks} from './tick-marks';

describe('generateTimeTicks', () => {
    const startTime = 1520538281000;
    const timeZone = 'America/Chicago';

    it('Generates 4 ticks when the hours length is less than 4', () => {
        const endTime = DateTime.fromMillis(startTime).plus({hours: 3}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(4);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 08 14:20', 'Mar 08 14:56', 'Mar 08 15:32', 'Mar 08 16:08']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).second).toBe(0);
    });

    it('Generates 4 ticks when the hours length is greater than 4', () => {
        const endTime = DateTime.fromMillis(startTime).plus({hours: 5}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(4);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 08 14:00', 'Mar 08 15:00', 'Mar 08 16:00', 'Mar 08 17:00']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).minute).toBe(0);
    });

    it('Generates 4 ticks with format MMM dd HH:mm when the day length is 2', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 2}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(4);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 08 23:00', 'Mar 09 08:00', 'Mar 09 18:00', 'Mar 10 04:00']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).second).toBe(0);
    });

    it('Generates day length tick marks with format MMM dd when length is 7 days', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 7}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 09', 'Mar 10', 'Mar 11', 'Mar 12', 'Mar 13', 'Mar 14', 'Mar 15']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).hour).toBe(0);
    });

    it('Generates day length tick marks with format MMM dd when length is 4 days', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 3}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(3);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 09', 'Mar 10', 'Mar 11']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).hour).toBe(0);
    });

    it('Generates every other day tick marks with format MMM dd when length is 8 days', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 8}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(4);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 09', 'Mar 11', 'Mar 13', 'Mar 15']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).hour).toBe(0);
    });

    it('Generates every other day tick marks with format MMM dd when length is 14', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 14}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 09', 'Mar 11', 'Mar 13', 'Mar 15', 'Mar 17', 'Mar 19', 'Mar 21']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).hour).toBe(0);
    });

    it('Generates every fourth day tick marks with format MMM dd when length is 15', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 15}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(4);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 09', 'Mar 13', 'Mar 17', 'Mar 21']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).hour).toBe(0);
    });

    it('Generates every fourth day tick marks with format MMM dd when length is 28', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 28}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 09', 'Mar 13', 'Mar 17', 'Mar 21', 'Mar 25', 'Mar 29', 'Apr 02']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).hour).toBe(0);
    });

    it('Generates every week tick marks with format MM dd when day count is 29', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 29}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(4);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 11', 'Mar 18', 'Mar 25', 'Apr 01']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).hour).toBe(0);
    });

    it('Generates every week tick marks with format MM dd when week count is 8', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 50}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 11', 'Mar 18', 'Mar 25', 'Apr 01', 'Apr 08', 'Apr 15', 'Apr 22']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).hour).toBe(0);
    });

    it('Generates every two week tick marks with format MM dd when week count is 9', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 53}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(4);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 15', 'Mar 29', 'Apr 12', 'Apr 26']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).hour).toBe(0);
    });

    it('Generates every two week tick marks with format MM dd when week count is 16', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 98}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['Mar 15', 'Mar 29', 'Apr 12', 'Apr 26', 'May 10', 'May 24', 'Jun 07']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).hour).toBe(0);
    });

    it('Generates every month tick marks with format MM YYYY when week count is 17', () => {
        const endTime = DateTime.fromMillis(startTime).plus({days: 126}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(4);
        expect(result.dates.map(result.format)).toEqual(
            ['Apr 2018', 'May 2018', 'Jun 2018', 'Jul 2018']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);
    });

    it('Generates every month tick marks with format MM YYYY when month count is 7', () => {
        const endTime = DateTime.fromMillis(startTime).plus({month: 7, days: 1}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['Apr 2018', 'May 2018', 'Jun 2018', 'Jul 2018', 'Aug 2018', 'Sep 2018', 'Oct 2018']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);
    });

    it('Generates every other month tick marks with format MM YYYY when month count is 8', () => {
        const endTime = DateTime.fromMillis(startTime).plus({month: 8, days: 18}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(4);
        expect(result.dates.map(result.format)).toEqual(
            ['Apr 2018', 'Jun 2018', 'Aug 2018', 'Oct 2018']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);
    });

    it('Generates every other month tick marks with format MM YYYY when month count is 14', () => {
        const endTime = DateTime.fromMillis(startTime).plus({month: 14, days: 18}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['Apr 2018', 'Jun 2018', 'Aug 2018', 'Oct 2018', 'Dec 2018', 'Feb 2019', 'Apr 2019']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);
    });

    it('Generates every four month tick marks with format MM YYYY when month count is 15', () => {
        const endTime = DateTime.fromMillis(startTime).plus({month: 15, days: 18}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(4);
        expect(result.dates.map(result.format)).toEqual(
            ['May 2018', 'Sep 2018', 'Jan 2019', 'May 2019']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);
    });

    it('Generates every four month tick marks with format MM YYYY when month count is 28', () => {
        const endTime = DateTime.fromMillis(startTime).plus({month: 28, days: 18}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['May 2018', 'Sep 2018', 'Jan 2019', 'May 2019', 'Sep 2019', 'Jan 2020', 'May 2020']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);
    });

    it('Generates every six month tick marks with format MM YYYY when month count is 29', () => {
        const endTime = DateTime.fromMillis(startTime).plus({month: 29, days: 18}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(5);
        expect(result.dates.map(result.format)).toEqual(
            ['Jun 2018', 'Dec 2018', 'Jun 2019', 'Dec 2019', 'Jun 2020']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);
    });

    it('Generates every six month tick marks with format MM YYYY when month count is 43', () => {
        const endTime = DateTime.fromMillis(startTime).plus({month: 42, days: 18}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['Jun 2018', 'Dec 2018', 'Jun 2019', 'Dec 2019', 'Jun 2020', 'Dec 2020', 'Jun 2021']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);
    });

    it('Generates every year tick marks with format YYYY when month count is 44', () => {
        const endTime = DateTime.fromMillis(startTime).plus({month: 44, days: 18}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(3);
        expect(result.dates.map(result.format)).toEqual(
            ['2019', '2020', '2021']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).month).toBe(1);
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);

    });

    it('Generates every year tick marks with format MM YYYY when year count is 8', () => {
        const endTime = DateTime.fromMillis(startTime).plus({year: 7}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['2019', '2020', '2021', '2022', '2023', '2024', '2025']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).month).toBe(1);
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);
    });

    it('Generates 7 tick marks with format YYYY when year count is 9', () => {
        const endTime = DateTime.fromMillis(startTime).plus({year: 9}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['2019', '2020', '2021', '2022', '2023', '2024', '2026']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).month).toBe(1);
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);
    });

    it('Generates 7 tick marks with format YYYY when year count is large', () => {
        const endTime = DateTime.fromMillis(startTime).plus({year: 20}).toMillis();
        const result = generateTimeTicks(startTime, endTime, timeZone);

        expect(result.dates.length).toBe(7);
        expect(result.dates.map(result.format)).toEqual(
            ['2020', '2023', '2025', '2028', '2030', '2033', '2035']
        );
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).month).toBe(1);
        expect(DateTime.fromMillis(result.dates[0], {zone: timeZone}).day).toBe(1);
    });
});