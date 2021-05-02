/**
 *
 * @flow
 */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { t } from 'ttag';

import copy from '../utils/clipboard';
import { notify } from '../actions';


function renderCoordinates(cell): string {
  return `(${cell.join(', ')})`;
}


const CoordinatesBox = () => {
  const view = useSelector((state) => state.canvas.view);
  const hover = useSelector((state) => state.gui.hover);
  const dispatch = useDispatch();

  return (
    <div
      className="coorbox"
      onClick={() => {
        copy(window.location.hash);
        dispatch(notify(t`Copied!`));
      }}
      role="button"
      title={t`Copy to Clipboard`}
      tabIndex="0"
    >{
      renderCoordinates(hover
      || view.map(Math.round))
    }</div>
  );
};

export default React.memo(CoordinatesBox);
