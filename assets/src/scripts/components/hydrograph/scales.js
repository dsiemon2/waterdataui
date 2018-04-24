const { scaleTime, scaleLinear } = require('d3-scale');
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { default: scaleSymlog } = require('../../lib/symlog');
const { getYDomain, SYMLOG_PARMS } = require('./domain');
const { layoutSelector } = require('./layout');
const { timeSeriesSelector, variablesSelector, currentVariableSelector, requestTimeRangeSelector } = require('./timeseries');
const { visiblePointsSelector, pointsByTsKeySelector } = require('./drawingData');

const {timeseriesRequestKeySelector } = require('../../selectors/timeseriesSelector');


/**
 * Create an x-scale oriented on the left
 * @param {Array} timeRange - Object containing the start and end times.
 * @param {Number} xSize - range of scale
 * @return {Object} d3 scale for time.
 */
function createXScale(timeRange, xSize) {
    const xExtent = timeRange ? [timeRange.start, timeRange.end] : [0, 1];

    // xScale is oriented on the left
    return scaleTime()
        .range([0, xSize])
        .domain(xExtent);
}

/**
 * Create the scale based on the parameter code
 *
 * @param {String} parmCd
 * @param {Array} extent
 * @param {Number} size
 */
function createYScale(parmCd, extent, size) {
    if (SYMLOG_PARMS.indexOf(parmCd) >= 0) {
        return scaleSymlog()
            .domain(extent)
            .range([size, 0]);
    } else {
        return scaleLinear()
            .domain(extent)
            .range([size, 0]);
    }
}


/**
 * Factory function creates a function that, for a given time series key:
 * Selector for x-scale
 * @param  {Object} state       Redux store
 * @return {Function}           D3 scale function
 */
const xScaleSelector = memoize(tsKey => createSelector(
    layoutSelector,
    timeseriesRequestKeySelector(tsKey)(null),
    requestTimeRangeSelector,
    (layout, tsRequestKey, requestTimeRanges) => {
        return createXScale(requestTimeRanges[tsRequestKey], layout.width - layout.margin.right);
    }
));


/**
 * Selector for y-scale
 * @param  {Object} state   Redux store
 * @return {Function}       D3 scale function
 */
const yScaleSelector = createSelector(
    layoutSelector,
    visiblePointsSelector,
    currentVariableSelector,
    (layout, pointArrays, currentVar) => {
        let currentVarParmCd = currentVar && currentVar.variableCode ? currentVar.variableCode.value : null;
        const yDomain = getYDomain(pointArrays, currentVar);
        return createYScale(currentVarParmCd, yDomain, layout.height - (layout.margin.top + layout.margin.bottom));
    }
);


/**
 * For a given tsKey, return a selector that:
 * Returns lists of time series keyed on parameter code.
 * @param  {String} tsKey             Time series key
 * @return {Object} - keys are parmCd and values are array of array of points
 */
const parmCdPointsSelector = memoize(tsKey => memoize(period => createSelector(
    pointsByTsKeySelector(tsKey)(period),
    timeSeriesSelector(tsKey)(period),
    variablesSelector,
    (tsPoints, timeSeries, variables) => {
        return Object.keys(tsPoints).reduce((byParmCd, tsID) => {
            const points = tsPoints[tsID];
            const parmCd = variables[timeSeries[tsID].variable].variableCode.value;
            byParmCd[parmCd] = byParmCd[parmCd] || [];
            byParmCd[parmCd].push(points);
            return byParmCd;
        }, {});
    }
)));


/**
 * Given a dimension with width/height attributes:
 * Returns x and y scales for all "current" time series.
 * @type {Object}   Mapping of parameter code to time series list.
 */
const timeSeriesScalesByParmCdSelector = memoize(tsKey => memoize(period => memoize(dimensions => createSelector(
    parmCdPointsSelector(tsKey)(period),
    requestTimeRangeSelector,
    (pointsByParmCd, requestTimeRanges) => {
        return Object.keys(pointsByParmCd).reduce((tsScales, parmCd) => {
            const tsPoints = pointsByParmCd[parmCd];
            const yDomain = getYDomain(tsPoints, SYMLOG_PARMS.indexOf(parmCd) >= 0);
            tsScales[parmCd] = {
                x: createXScale(requestTimeRanges[tsKey], dimensions.width),
                y: createYScale(parmCd, yDomain, dimensions.height)
            };
            return tsScales;
        }, {});
    }
))));


module.exports = {createXScale, createYScale, xScaleSelector, yScaleSelector, timeSeriesScalesByParmCdSelector};
