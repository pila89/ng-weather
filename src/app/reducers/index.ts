import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import {reducer as zipCodeReducer} from './zip-codes.reducer';
import {State as ZipCodeState} from './zip-codes.reducer';
import {currentConditionsReducer, CurrentConditionsState} from './current-conditions.reducer';

export interface State {
  zipcodes: ZipCodeState,
  currentConditions: CurrentConditionsState
}

export const reducers: ActionReducerMap<State> = {
  zipcodes: zipCodeReducer,
  currentConditions: currentConditionsReducer
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];

export const selectZipcodeState = (state: State) => state.zipcodes;

export const selectZipcodeList = createSelector(selectZipcodeState, (state: ZipCodeState) => state.zipcodes);

export const selectCurrentConditionsState = (state: State) => state.currentConditions;

export const selectCurrentConditionsMap = createSelector(selectCurrentConditionsState,
    (state: CurrentConditionsState) => state.currentConditions);

