import createStore from '@/common/core/state/create-store';
import getInitialState from './get-initial-state';

const state = getInitialState();
const store = createStore(state);

export default store;
