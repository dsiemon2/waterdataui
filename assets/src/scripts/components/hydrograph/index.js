/**
 * Hydrograph charting module.
 */
const { select } = require('d3-selection');
const { extent } = require('d3-array');
const { line } = require('d3-shape');
const { createSelector, createStructuredSelector } = require('reselect');

const { addSVGAccessibility, addSROnlyTable } = require('../../accessibility');
const { dispatch, link, provide } = require('../../lib/redux');

const { appendAxes, axesSelector } = require('./axes');
const { ASPECT_RATIO_PERCENT, MARGIN, CIRCLE_RADIUS, layoutSelector } = require('./layout');
const { drawSimpleLegend, legendDisplaySelector, createLegendMarkers } = require('./legend');
const { pointsSelector, lineSegmentsSelector, isVisibleSelector, MASK_DESC } = require('./points');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { Actions, configureStore } = require('./store');
const { createTooltipFocus, createTooltipText } = require('./tooltip');


// identifiers for svg patterns used in the plot
const HASH_45 = 'hash-45';
const HASH_135 = 'hash-135';


const drawMessage = function (elem, message) {
    // Set up parent element and SVG
    elem.innerHTML = '';
    const alertBox = elem
        .append('div')
            .attr('class', 'usa-alert usa-alert-warning')
            .append('div')
                .attr('class', 'usa-alert-body');
    alertBox
        .append('h3')
            .attr('class', 'usa-alert-heading')
            .html('Hydrograph Alert');
    alertBox
        .append('p')
            .html(message);
};


const plotDataLine = function (elem, {visible, lines, tsDataKey, xScale, yScale}) {
    const elemId = 'ts-' + tsDataKey;
    elem.selectAll(`#${elemId}`).remove();
    elem.selectAll(`.${tsDataKey}-mask-group`).remove();

    if (!visible) {
        return;
    }

    const tsLine = line()
        .x(d => xScale(new Date(d.time)))
        .y(d => yScale(d.value));

    for (let line of lines) {
        if (line.classes.dataMask === null) {
            elem.append('path')
                .datum(line.points)
                .classed('line', true)
                .classed('approved', line.classes.approved)
                .classed('estimated', line.classes.estimated)
                .attr('data-title', tsDataKey)
                .attr('id', `ts-${tsDataKey}`)
                .attr('d', tsLine);
        }
        else {
            const maskCode = line.classes.dataMask.toLowerCase();
            const maskDisplayName = MASK_DESC[maskCode].replace(' ', '-').toLowerCase();
            const [xDomainStart, xDomainEnd] = extent(line.points, d => d.time);
            const [yRangeStart, yRangeEnd] = yScale.domain();
            let maskGroup = elem.append('g')
                .attr('class', `${tsDataKey}-mask-group`);
            const xSpan = xScale(xDomainEnd) - xScale(xDomainStart);
            const rectWidth = xSpan > 0 ? xSpan : 1;

            maskGroup.append('rect')
                .attr('x', xScale(xDomainStart))
                .attr('y', yScale(yRangeEnd))
                .attr('width', rectWidth)
                .attr('height', Math.abs(yScale(yRangeEnd)- yScale(yRangeStart)))
                .attr('class', `mask ${maskDisplayName}-mask`);

            const patternId = tsDataKey === 'compare' ? `url(#${HASH_135})` : `url(#${HASH_45})`;

            maskGroup.append('rect')
                .attr('x', xScale(xDomainStart))
                .attr('y', yScale(yRangeEnd))
                .attr('width', rectWidth)
                .attr('height', Math.abs(yScale(yRangeEnd) - yScale(yRangeStart)))
                .attr('fill', patternId);
        }
    }
};


const plotSvgDefs = function(elem) {

    let defs = elem.append('defs');

    defs.append('mask')
        .attr('id', 'display-mask')
        .attr('maskUnits', 'userSpaceOnUse')
        .append('rect')
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#0000ff');

    defs.append('pattern')
        .attr('id', HASH_45)
        .attr('width', '8')
        .attr('height', '8')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('patternTransform', 'rotate(45)')
        .append('rect')
            .attr('width', '4')
            .attr('height', '8')
            .attr('transform', 'translate(0, 0)')
            .attr('mask', 'url(#display-mask)');

    defs.append('pattern')
        .attr('id', HASH_135)
        .attr('width', '8')
        .attr('height', '8')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('patternTransform', 'rotate(135)')
        .append('rect')
            .attr('width', '4')
            .attr('height', '8')
            .attr('transform', 'translate(0, 0)')
            .attr('mask', 'url(#display-mask)');
};


const plotLegend = function(elem, {displayItems, width, currentSegments, compareSegments}) {
    elem.select('.legend').remove();
    let plotMarkers = createLegendMarkers(displayItems, currentSegments.concat(compareSegments));
    drawSimpleLegend(elem, plotMarkers, width);
};


const plotMedianPoints = function (elem, {visible, xscale, yscale, medianStatsData, showLabel}) {
    elem.select('#median-points').remove();

    if (!visible) {
        return;
    }

    const container = elem
        .append('g')
            .attr('id', 'median-points');

    container.selectAll('medianPoint')
        .data(medianStatsData)
        .enter()
        .append('circle')
            .attr('class', 'median-data-series')
            .attr('r', CIRCLE_RADIUS)
            .attr('cx', function(d) {
                return xscale(d.time);
            })
            .attr('cy', function(d) {
                return yscale(d.value);
            })
            .on('click', dispatch(function() {
                return Actions.showMedianStatsLabel(!showLabel);
            }));

    if (showLabel) {
        container.selectAll('medianPointText')
            .data(medianStatsData)
            .enter()
            .append('text')
                .text(function(d) {
                    return d.label;
                })
                .attr('x', function(d) {
                    return xscale(d.time) + 5;
                })
                .attr('y', function(d) {
                    return yscale(d.value);
                });
    }
};

const timeSeriesGraph = function (elem) {
    elem.append('div')
        .attr('class', 'hydrograph-container')
        .style('padding-bottom', ASPECT_RATIO_PERCENT)
        .append('svg')
            .call(link((elem, layout) => elem.attr('viewBox', `0 0 ${layout.width} ${layout.height}`), layoutSelector))
            .call(link(addSVGAccessibility, createStructuredSelector({
                title: state => state.title,
                description: state => state.desc,
                isInteractive: () => true
            })))
            .call(createTooltipText)
            .call(plotSvgDefs)
            .call(link(plotLegend, createStructuredSelector({
                displayItems: legendDisplaySelector,
                currentSegments: lineSegmentsSelector('current'),
                compareSegments: lineSegmentsSelector('compare'),
                width: state => state.width
            })))
            .append('g')
                .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)
                .call(link(appendAxes, axesSelector))
                .call(link(plotDataLine, createStructuredSelector({
                    visible: isVisibleSelector('current'),
                    lines: lineSegmentsSelector('current'),
                    xScale: xScaleSelector('current'),
                    yScale: yScaleSelector,
                    tsDataKey: () => 'current'
                })))
                .call(link(plotDataLine, createStructuredSelector({
                    visible: isVisibleSelector('compare'),
                    lines: lineSegmentsSelector('compare'),
                    xScale: xScaleSelector('compare'),
                    yScale: yScaleSelector,
                    tsDataKey: () => 'compare'
                })))
                .call(link(createTooltipFocus, createStructuredSelector({
                    xScale: xScaleSelector('current'),
                    yScale: yScaleSelector,
                    compareXScale: xScaleSelector('compare'),
                    currentTsData: pointsSelector('current'),
                    compareTsData: pointsSelector('compare'),
                    isCompareVisible: isVisibleSelector('compare')
                })))
                .call(link(plotMedianPoints, createStructuredSelector({
                    visible: isVisibleSelector('medianStatistics'),
                    xscale: xScaleSelector('current'),
                    yscale: yScaleSelector,
                    medianStatsData: pointsSelector('medianStatistics'),
                    showLabel: (state) => state.showMedianStatsLabel

                })));

    elem.append('div')
        .call(link(addSROnlyTable, createStructuredSelector({
            columnNames: createSelector(
                (state) => state.title,
                (title) => [title, 'Time']
            ),
            data: createSelector(
                pointsSelector('current'),
                points => points.map((value) => {
                    return [value.value, value.time];
                })
            ),
            describeById: () => 'time-series-sr-desc',
            describeByText: () => 'current time series data in tabular format'
    })));

    elem.append('div')
        .call(link(addSROnlyTable, createStructuredSelector({
            columnNames: createSelector(
                (state) => state.title,
                (title) => [`Median ${title}`, 'Time']
            ),
            data: createSelector(
                pointsSelector('medianStatistics'),
                points => points.map((value) => {
                    return [value.value, value.time];
                })
            ),
            describeById: () => 'median-statistics-sr-desc',
            describeByText: () => 'median statistical data in tabular format'
    })));
};


const attachToNode = function (node, {siteno} = {}) {
    if (!siteno) {
        select(node).call(drawMessage, 'No data is available.');
        return;
    }

    let store = configureStore({
        width: node.offsetWidth
    });

    select(node)
        .call(provide(store))
        .call(timeSeriesGraph)
        .select('.hydrograph-last-year-input')
            .on('change', dispatch(function () {
                return Actions.toggleTimeseries('compare', this.checked);
            }));

    window.onresize = function() {
        store.dispatch(Actions.resizeTimeseriesPlot(node.offsetWidth));
    };
    store.dispatch(Actions.retrieveTimeseries(siteno));
};


module.exports = {attachToNode, timeSeriesGraph};