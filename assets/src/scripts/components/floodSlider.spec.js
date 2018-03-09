const { select } = require('d3-selection');

const { attachToNode } = require('./floodSlider');
const { configureStore } = require('../store');


describe('floodSlider', () => {

    let sliderNode;
    let store;

    beforeEach(() => {
        select('body')
            .append('div')
                .attr('id', 'slider-container');
        sliderNode = document.getElementById('slider-container');
    });

    afterEach(() => {
        select('#slider-container').remove();
    });

    describe('creating slider when their are no stages', () => {
        beforeEach(() => {
            store = configureStore();
            attachToNode(store, sliderNode);
        });

        it('The slider is hidden', () => {
            expect(select(sliderNode).select('.slider-wrapper').property('hidden')).toBeTruthy();
        });

        it('The slider is created', () => {
            expect(select(sliderNode).selectAll('input[type="range"]').size()).toBe(1);
        });
    });

    describe('creating slider when there is flood data and gage height', () => {
        beforeEach(() => {
            store = configureStore({
                floodStages: [9, 10, 11, 12],
                gageHeight: 10
            });
            attachToNode(store, sliderNode);
        });

        it('The slider is not hidden', () => {
            expect(select(sliderNode).select('.slider-wrapper').property('hidden')).toBeFalsy();
        });

        it('Expects the slider\'s min, max, step, and value set appropriately', () => {
            let slider = select(sliderNode).select('input[type="range"]');
            expect(slider.attr('min')).toBe('0');
            expect(slider.attr('max')).toBe('3');
            expect(slider.attr('step')).toBe('1');
            expect(slider.attr('value')).toBe('1');
        });

        it('Expect the slider]\'s label to contain the gage height', () => {
            expect(select(sliderNode).select('label').html()).toContain('10');
        });
    });
});