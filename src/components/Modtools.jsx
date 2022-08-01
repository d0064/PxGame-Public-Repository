/*
 * Modtools
 */

import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { t } from 'ttag';

import useInterval from './hooks/interval';
import { getToday, dateToString } from '../core/utils';

const keptState = {
  coords: '',
  tlcoords: '',
  brcoords: '',
  tlrcoords: '',
  brrcoords: '',
  tlccoords: '',
  brccoords: '',
};

async function submitImageAction(
  action,
  canvas,
  coords,
  callback,
) {
  const data = new FormData();
  const fileSel = document.getElementById('imgfile');
  const file = (!fileSel.files || !fileSel.files[0])
    ? null : fileSel.files[0];
  data.append('imageaction', action);
  data.append('image', file);
  data.append('canvasid', canvas);
  data.append('coords', coords);
  const resp = await fetch('./api/modtools', {
    credentials: 'include',
    method: 'POST',
    body: data,
  });
  callback(await resp.text());
}

async function submitProtAction(
  action,
  canvas,
  tlcoords,
  brcoords,
  callback,
) {
  const data = new FormData();
  data.append('protaction', action);
  data.append('canvasid', canvas);
  data.append('ulcoor', tlcoords);
  data.append('brcoor', brcoords);
  const resp = await fetch('./api/modtools', {
    credentials: 'include',
    method: 'POST',
    body: data,
  });
  callback(await resp.text());
}

async function submitRollback(
  date,
  canvas,
  tlcoords,
  brcoords,
  callback,
) {
  const data = new FormData();
  const timeString = dateToString(date);
  data.append('rollback', timeString);
  data.append('canvasid', canvas);
  data.append('ulcoor', tlcoords);
  data.append('brcoor', brcoords);
  const resp = await fetch('./api/modtools', {
    credentials: 'include',
    method: 'POST',
    body: data,
  });
  callback(await resp.text());
}

async function submitCanvasCleaner(
  action,
  canvas,
  tlcoords,
  brcoords,
  callback,
) {
  const data = new FormData();
  data.append('cleaneraction', action);
  data.append('canvasid', canvas);
  data.append('ulcoor', tlcoords);
  data.append('brcoor', brcoords);
  const resp = await fetch('./api/modtools', {
    credentials: 'include',
    method: 'POST',
    body: data,
  });
  callback(await resp.text());
}

async function submitIPAction(
  action,
  callback,
) {
  const data = new FormData();
  const iplist = document.getElementById('iparea').value;
  data.append('ip', iplist);
  data.append('ipaction', action);
  const resp = await fetch('./api/modtools', {
    credentials: 'include',
    method: 'POST',
    body: data,
  });
  callback(await resp.text());
}

async function getModList(
  callback,
) {
  const data = new FormData();
  data.append('modlist', true);
  const resp = await fetch('./api/modtools', {
    credentials: 'include',
    method: 'POST',
    body: data,
  });
  if (resp.ok) {
    callback(await resp.json());
  } else {
    callback([]);
  }
}

async function getCleanerStats(
  callback,
) {
  const data = new FormData();
  data.append('cleanerstat', true);
  const resp = await fetch('./api/modtools', {
    credentials: 'include',
    method: 'POST',
    body: data,
  });
  if (resp.ok) {
    callback(await resp.json());
  } else {
    callback({
    });
  }
}

async function getCleanerCancel(
  callback,
) {
  const data = new FormData();
  data.append('cleanercancel', true);
  const resp = await fetch('./api/modtools', {
    credentials: 'include',
    method: 'POST',
    body: data,
  });
  if (resp.ok) {
    callback(await resp.text());
  } else {
    callback('');
  }
}

async function submitRemMod(
  userId,
  callback,
) {
  const data = new FormData();
  data.append('remmod', userId);
  const resp = await fetch('./api/modtools', {
    credentials: 'include',
    method: 'POST',
    body: data,
  });
  callback(resp.ok, await resp.text());
}

async function submitMakeMod(
  userName,
  callback,
) {
  const data = new FormData();
  data.append('makemod', userName);
  const resp = await fetch('./api/modtools', {
    credentials: 'include',
    method: 'POST',
    body: data,
  });
  if (resp.ok) {
    callback(await resp.json());
  } else {
    callback(await resp.text());
  }
}


function Modtools() {
  const maxDate = getToday();

  const [selectedCanvas, selectCanvas] = useState(0);
  const [imageAction, selectImageAction] = useState('build');
  const [cleanAction, selectCleanAction] = useState('spare');
  const [iPAction, selectIPAction] = useState('ban');
  const [protAction, selectProtAction] = useState('protect');
  const [date, selectDate] = useState(maxDate);
  const [coords, selectCoords] = useState(keptState.coords);
  const [tlcoords, selectTLCoords] = useState(keptState.tlcoords);
  const [brcoords, selectBRCoords] = useState(keptState.brcoords);
  const [tlrcoords, selectTLRCoords] = useState(keptState.tlrcoords);
  const [brrcoords, selectBRRCoords] = useState(keptState.brrcoords);
  const [tlccoords, selectTLCCoords] = useState(keptState.tlrcoords);
  const [brccoords, selectBRCCoords] = useState(keptState.brrcoords);
  const [modName, selectModName] = useState('');
  const [resp, setResp] = useState(null);
  const [modlist, setModList] = useState([]);
  const [cleanerstats, setCleanerStats] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [
    canvasId,
    canvases,
    userlvl,
  ] = useSelector((state) => [
    state.canvas.canvasId,
    state.canvas.canvases,
    state.user.userlvl,
  ], shallowEqual);

  useEffect(() => {
    selectCanvas(canvasId);
  }, [canvasId]);

  let descAction;
  switch (imageAction) {
    case 'build':
      descAction = t`Build image on canvas.`;
      break;
    case 'protect':
      descAction = t`Build image and set it to protected.`;
      break;
    case 'wipe':
      descAction = t`Build image, but reset cooldown to unset-pixel cd.`;
      break;
    default:
      // nothing
  }

  let descCleanAction;
  switch (cleanAction) {
    case 'spare':
      // eslint-disable-next-line max-len
      descCleanAction = t`Clean spare pixels that are surrounded by unset pixels`;
      break;
    case 'spareext':
      // eslint-disable-next-line max-len
      descCleanAction = t`Clean spare pixels that are surrounded by unset pixels and up to 1 other set pixels`;
      break;
    case 'spareextu':
      // eslint-disable-next-line max-len
      descCleanAction = t`Clean spare pixels that are surrounded by a single other color or unset pixels (VERY AGGRESSIVE ON CANVASES THAT ALLOW UNSET PIXELS (where there are two cooldowns)!)`;
      break;
    default:
      // nothing
  }

  useEffect(() => {
    if (userlvl === 1) {
      getModList((mods) => setModList(mods));
    }
    if (userlvl > 0) {
      getCleanerStats((stats) => setCleanerStats(stats));
    }
  }, []);

  useInterval(() => {
    if (userlvl > 0) {
      getCleanerStats((stats) => setCleanerStats(stats));
    }
  }, 10000);

  const cleanerStatusString = (!cleanerstats.running)
    ? t`Status: Not running`
  // eslint-disable-next-line max-len
    : `Status: ${cleanerstats.method} from ${cleanerstats.tl} to ${cleanerstats.br} on canvas ${canvases[cleanerstats.canvasId].ident} to ${cleanerstats.percent} done`;

  return (
    <div style={{ textAlign: 'center', paddingLeft: '5%', paddingRight: '5%' }}>
      {resp && (
        <div style={{
          borderStyle: 'solid',
          borderColor: '#D4D4D4',
          borderWidth: 2,
          padding: 5,
          display: 'inline-block',
        }}
        >
          {resp.split('\n').map((line) => (
            <p className="modaltext">
              {line}
            </p>
          ))}
          <span
            role="button"
            tabIndex={-1}
            className="modallink"
            onClick={() => setResp(null)}
          >
            {t`Close`}
          </span>
        </div>
      )}
      <p className="modalcotext">Choose Canvas:&nbsp;
        <select
          value={selectedCanvas}
          onChange={(e) => {
            const sel = e.target;
            selectCanvas(sel.options[sel.selectedIndex].value);
          }}
        >
          {
          Object.keys(canvases).map((canvas) => ((canvases[canvas].v)
            ? null
            : (
              <option
                value={canvas}
              >
                {
              canvases[canvas].title
            }
              </option>
            )))
        }
        </select>
      </p>
      <br />
      <div className="modaldivider" />
      <h3 className="modaltitle">{t`Image Upload`}</h3>
      <p className="modalcotext">{t`Upload images to canvas`}</p>
      <p className="modalcotext">
        {t`File`}:&nbsp;
        <input type="file" name="image" id="imgfile" />
      </p>
      <select
        value={imageAction}
        onChange={(e) => {
          const sel = e.target;
          selectImageAction(sel.options[sel.selectedIndex].value);
        }}
      >
        {['build', 'protect', 'wipe'].map((opt) => (
          <option
            value={opt}
          >
            {opt}
          </option>
        ))}
      </select>
      <p className="modalcotext">{descAction}</p>
      <p className="modalcotext">
        {t`Coordinates in X_Y format:`}&nbsp;
        <input
          value={coords}
          style={{
            display: 'inline-block',
            width: '100%',
            maxWidth: '15em',
          }}
          type="text"
          placeholder="X_Y"
          onChange={(evt) => {
            const co = evt.target.value.trim();
            selectCoords(co);
            keptState.coords = co;
          }}
        />
      </p>
      <button
        type="button"
        onClick={() => {
          if (submitting) {
            return;
          }
          setSubmitting(true);
          submitImageAction(
            imageAction,
            selectedCanvas,
            coords,
            (ret) => {
              setSubmitting(false);
              setResp(ret);
            },
          );
        }}
      >
        {(submitting) ? '...' : t`Submit`}
      </button>

      <br />
      <div className="modaldivider" />
      <h3 className="modaltitle">{t`Pixel Protection`}</h3>
      <p className="modalcotext">
        {t`Set protection of areas \
        (if you need finer grained control, \
        use protect with image upload and alpha layers)`}
      </p>
      <select
        value={protAction}
        onChange={(e) => {
          const sel = e.target;
          selectProtAction(sel.options[sel.selectedIndex].value);
        }}
      >
        {['protect', 'unprotect'].map((opt) => (
          <option
            value={opt}
          >
            {opt}
          </option>
        ))}
      </select>
      <p className="modalcotext">
        {t`Top-left corner`} (X_Y):&nbsp;
        <input
          value={tlcoords}
          style={{
            display: 'inline-block',
            width: '100%',
            maxWidth: '15em',
          }}
          type="text"
          placeholder="X_Y"
          onChange={(evt) => {
            const co = evt.target.value.trim();
            selectTLCoords(co);
            keptState.tlcoords = co;
          }}
        />
      </p>
      <p className="modalcotext">
        {t`Bottom-right corner`} (X_Y):&nbsp;
        <input
          value={brcoords}
          style={{
            display: 'inline-block',
            width: '100%',
            maxWidth: '15em',
          }}
          type="text"
          placeholder="X_Y"
          onChange={(evt) => {
            const co = evt.target.value.trim();
            selectBRCoords(co);
            keptState.brcoords = co;
          }}
        />
      </p>
      <button
        type="button"
        onClick={() => {
          if (submitting) {
            return;
          }
          setSubmitting(true);
          submitProtAction(
            protAction,
            selectedCanvas,
            tlcoords,
            brcoords,
            (ret) => {
              setSubmitting(false);
              setResp(ret);
            },
          );
        }}
      >
        {(submitting) ? '...' : t`Submit`}
      </button>
      {(window.ssv && window.ssv.backupurl) && (
        <div>
          <br />
          <div className="modaldivider" />
          <h3 className="modaltitle">{t`Rollback to Date`}</h3>
          <p className="modalcotext">
            {t`Rollback an area of the canvas to a set date (00:00 UTC)`}
          </p>
          <input
            type="date"
            value={date}
            pattern="\d{4}-\d{2}-\d{2}"
            min={canvases[selectedCanvas].sd}
            max={maxDate}
            onChange={(evt) => {
              selectDate(evt.target.value);
            }}
          />
          <p className="modalcotext">
            {t`Top-left corner`} (X_Y):&nbsp;
            <input
              value={tlrcoords}
              style={{
                display: 'inline-block',
                width: '100%',
                maxWidth: '15em',
              }}
              type="text"
              placeholder="X_Y"
              onChange={(evt) => {
                const co = evt.target.value.trim();
                selectTLRCoords(co);
                keptState.tlrcoords = co;
              }}
            />
          </p>
          <p className="modalcotext">
            {t`Bottom-right corner`} (X_Y):&nbsp;
            <input
              value={brrcoords}
              style={{
                display: 'inline-block',
                width: '100%',
                maxWidth: '15em',
              }}
              type="text"
              placeholder="X_Y"
              onChange={(evt) => {
                const co = evt.target.value.trim();
                selectBRRCoords(co);
                keptState.brrcoords = co;
              }}
            />
          </p>
          <button
            type="button"
            onClick={() => {
              if (submitting) {
                return;
              }
              setSubmitting(true);
              submitRollback(
                date,
                selectedCanvas,
                tlrcoords,
                brrcoords,
                (ret) => {
                  setSubmitting(false);
                  setResp(ret);
                },
              );
            }}
          >
            {(submitting) ? '...' : t`Submit`}
          </button>
        </div>
      )}
      <br />
      <div className="modaldivider" />
      <h3 className="modaltitle">{t`Canvas Cleaner`}</h3>
      <p className="modalcotext">
        {t`Apply a filter to clean trash in large canvas areas.`}
      </p>
      <select
        value={cleanAction}
        onChange={(e) => {
          const sel = e.target;
          selectCleanAction(sel.options[sel.selectedIndex].value);
        }}
      >
        {['spare', 'spareext', 'spareextu'].map((opt) => (
          <option
            value={opt}
          >
            {opt}
          </option>
        ))}
      </select>
      <p className="modalcotext">{descCleanAction}</p>
      <p className="modalcotext" style={{ fontWeight: 'bold' }}>
        {cleanerStatusString}
      </p>
      <p className="modalcotext">
        {t`Top-left corner`} (X_Y):&nbsp;
        <input
          value={tlccoords}
          style={{
            display: 'inline-block',
            width: '100%',
            maxWidth: '15em',
          }}
          type="text"
          placeholder="X_Y"
          onChange={(evt) => {
            const co = evt.target.value.trim();
            selectTLCCoords(co);
            keptState.tlccoords = co;
          }}
        />
      </p>
      <p className="modalcotext">
        {t`Bottom-right corner`} (X_Y):&nbsp;
        <input
          value={brccoords}
          style={{
            display: 'inline-block',
            width: '100%',
            maxWidth: '15em',
          }}
          type="text"
          placeholder="X_Y"
          onChange={(evt) => {
            const co = evt.target.value.trim();
            selectBRCCoords(co);
            keptState.brccoords = co;
          }}
        />
      </p>
      <button
        type="button"
        onClick={() => {
          if (submitting) {
            return;
          }
          setSubmitting(true);
          submitCanvasCleaner(
            cleanAction,
            selectedCanvas,
            tlccoords,
            brccoords,
            (ret) => {
              setCleanerStats({
                running: true,
                percent: 'N/A',
                method: cleanAction,
                tl: tlccoords,
                br: brccoords,
                canvasId: selectedCanvas,
              });
              setSubmitting(false);
              setResp(ret);
            },
          );
        }}
      >
        {(submitting) ? '...' : t`Submit`}
      </button>
      <button
        type="button"
        onClick={() => {
          if (submitting) {
            return;
          }
          setSubmitting(true);
          getCleanerCancel(
            (ret) => {
              setCleanerStats({});
              setSubmitting(false);
              setResp(ret);
            },
          );
        }}
      >
        {(submitting) ? '...' : t`Stop Cleaner`}
      </button>

      {(userlvl === 1) && (
        <div>
          <br />
          <div className="modaldivider" />
          <h3 className="modaltitle">{t`IP Actions`}</h3>
          <p className="modalcotext">
            {t`Do stuff with IPs (one IP per line)`}
          </p>
          <select
            value={iPAction}
            onChange={(e) => {
              const sel = e.target;
              selectIPAction(sel.options[sel.selectedIndex].value);
            }}
          >
            {['ban', 'unban', 'whitelist', 'unwhitelist'].map((opt) => (
              <option
                value={opt}
              >
                {opt}
              </option>
            ))}
          </select>
          <br />
          <textarea rows="10" cols="17" id="iparea" /><br />
          <button
            type="button"
            onClick={() => {
              if (submitting) {
                return;
              }
              setSubmitting(true);
              submitIPAction(
                iPAction,
                (ret) => {
                  setSubmitting(false);
                  setResp(ret);
                },
              );
            }}
          >
            {(submitting) ? '...' : t`Submit`}
          </button>
          <br />
          <div className="modaldivider" />
          <h3 className="modaltitle">{t`Manage Moderators`}</h3>
          <p className="modalcotext">
            {t`Remove Moderator`}
          </p>
          {(modlist.length) ? (
            <span
              className="unblocklist"
            >
              {modlist.map((mod) => (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (submitting) {
                      return;
                    }
                    setSubmitting(true);
                    submitRemMod(mod[0], (success, ret) => {
                      if (success) {
                        setModList(
                          modlist.filter((modl) => (modl[0] !== mod[0])),
                        );
                      }
                      setSubmitting(false);
                      setResp(ret);
                    });
                  }}
                >
                  {`⦸ ${mod[0]} ${mod[1]}`}
                </div>
              ))}
            </span>
          )
            : (
              <p className="modaltext">{t`There are no mods`}</p>
            )}
          <br />

          <p className="modalcotext">
            {t`Assign new Mod`}
          </p>
          <p className="modalcotext">
            {t`Enter UserName of new Mod`}:&nbsp;
            <input
              value={modName}
              style={{
                display: 'inline-block',
                width: '100%',
                maxWidth: '20em',
              }}
              type="text"
              placeholder={t`User Name`}
              onChange={(evt) => {
                const co = evt.target.value.trim();
                selectModName(co);
              }}
            />
          </p>
          <button
            type="button"
            onClick={() => {
              if (submitting) {
                return;
              }
              setSubmitting(true);
              submitMakeMod(
                modName,
                (ret) => {
                  if (typeof ret === 'string') {
                    setResp(ret);
                  } else {
                    setResp(`Made ${ret[1]} mod successfully.`);
                    setModList([...modlist, ret]);
                  }
                  setSubmitting(false);
                },
              );
            }}
          >
            {(submitting) ? '...' : t`Submit`}
          </button>
          <br />
          <div className="modaldivider" />
          <br />
        </div>
      )}
    </div>
  );
}

export default React.memo(Modtools);
