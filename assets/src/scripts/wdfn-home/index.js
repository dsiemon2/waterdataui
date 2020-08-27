import '../polyfills';

import wdfnviz from 'wdfn-viz';

// Load misc Javascript helpers for general page interactivity.
import {register} from '../helpers';
register();

import {configureStore} from './store/wdfn-store';

import {attachToNode as USMapComponent} from './usmap';
import {attachToNode as WDFNParamFilters} from './wdfn-param-filters';
import {attachToNode as SiteSummaries} from './site-summary';

const COMPONENTS = {
    'site-summaries': SiteSummaries,
    'us-map': USMapComponent,
    'wdfn-param-filters': WDFNParamFilters
};

const load = function () {
    let nodes = document.getElementsByClassName('wdfn-component');
    let store = configureStore();
    for (let node of nodes) {
        // If options is specified on the node, expect it to be a JSON string.
        // Otherwise, use the dataset attributes as the component options.
        const options = node.dataset.options ? JSON.parse(node.dataset.options) : node.dataset;
        COMPONENTS[node.dataset.component](store, node, Object.assign({}, options));
    }


};

wdfnviz.main(load);

// Leaflet expects an exports global to exist - so although we don't use this,
// just set it to something so it's not undefined.
export var dummy = true;
