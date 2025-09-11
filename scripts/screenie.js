/**
 * @fileoverview
 * A small utility for the littlejs game engine that adds custom
 * screenshot and GIF recording capabilities.
 * * This script provides two primary functions:
 * 1.  ** Single Screenshot **: Pressing `Alt + P` triggers a single PNG
 * screenshot of the game canvas.
 * 2.  **Animated GIF Recording**: Pressing `Alt + G` records a GIF of the
 * game canvas for a fixed duration.
 * * ** Dependencies: **
 * - This script relies on the global `littlejs` engine and its
 * `debugTakeScreenshot` and `debugSaveCanvas` functions.
 * - It requires the `gif.js` library for GIF encoding.
 * - It assumes the existence of a `mainCanvas` and a `downloadLink` element,
 * which are part of the littlejs debug UI.
 * * ** How it Works: **
 * The script monkey-patches the `debugSaveCanvas` function to intercept
 * canvas data when a screenshot or GIF is being recorded. It uses
 * `setInterval` and `setTimeout` to control the recording duration and frame
 * rate. The captured frames (as Data URLs) are then processed by the
 * `gif.js` library to create and download the final GIF.
 * * ** Global Configuration: **
 * The `GIF_LENGTH` and `GIF_FPS` variables are exposed on the `window`
 * object, allowing them to be configured at runtime via the browser's console.
 * @author [Eoin McGrath]
 * @version 1.0.0
 */

(() => {

  // expose globally so can be updated via console
  window.GIF_LENGTH = 10; // length of gif in seconds
  window.GIF_FRAME_DELAY = 1000 / 30; // frames per second for gif. higher = better quality, but larger file size

  const getSaveAs = () => slugify(document.title) || 'screenie';

  let recorderState = {
    captureMode: 'none', // can be 'none', 'screenshot', or 'gif'
    gif: {
      frames: [],
      intervalId: null,
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    if (!window.debugSaveCanvas || !window.GIF) {
      console.error('screenie.js - Required dependencies (LittleJS or gif.js) are missing.');
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'p' && recorderState.captureMode === 'none') {
      // trigger littlejs debug screenshot
      debugTakeScreenshot = true;
      recorderState.captureMode = 'screenshot';
    }
    if (e.altKey && e.key === 'g') {
      gifStartRecording();
    }
  });


  // a very naughty piece of monkey patching
  // we need to do it like this in order to capture the WebGL canvas
  const originalDebugSaveCanvas = debugSaveCanvas;
  debugSaveCanvas = function() {
    if (recorderState.captureMode === 'gif') {
      recorderState.gif.frames.push(arguments[0].toDataURL('image/png'));
    } else if (recorderState.captureMode === 'screenshot') {
      // recorderState.screenie = false;
      recorderState.captureMode = 'none';
      downloadScreenie(arguments[0]);
    } else {
      originalDebugSaveCanvas.apply(this, arguments);
    }
  }

  const downloadScreenie = (canvas) => {
    // note: downloadLink is created by littlejs
    downloadLink.download = `${getSaveAs()}-${formatDate()}.png`;
    let data = canvas.toDataURL('image/png');
    downloadLink.href = data;
    downloadLink.click();
  }

  const gifStartRecording = () => {
    if (recorderState.captureMode === 'gif') return;
    recorderState.captureMode = 'gif';
    recorderState.gif.frames = [];
    showAlert('🔴 recording GIF');
    recorderState.gif.intervalId = setInterval(() => {
      // trigger littlejs debug screenshot
      // this will allow us to save the canvas at the point
      // when the webgl canvas is in synch
      debugTakeScreenshot = true;
    }, window.GIF_FRAME_DELAY);
    setTimeout(() => {
      gifStopRecording();
    }, window.GIF_LENGTH * 1000);
  }

  function gifStopRecording() {
    recorderState.captureMode = 'none';
    debugTakeScreenshot = false;
    if (recorderState.gif.intervalId) {
      clearInterval(recorderState.gif.intervalId);
      recorderState.gif.intervalId = null;
    }
    showAlert('GIF recording finished. Frames:' + recorderState.gif.frames.length, true);
    if (recorderState.gif.frames.length > 0) {
      gifCreateAnimation(recorderState.gif.frames, `${getSaveAs()}-${formatDate()}.gif`);
      showAlert('Encoding GIF. 0%');
    }
  }


  async function gifCreateAnimation(frames, fileName = 'anim.gif') {
    // Create GIF encoder (using gif.js library)
    const gifEncoder = new GIF({
      workers: 2,
      quality: 10,
      width: mainCanvas.width,
      height: mainCanvas.height
    });

    let loaded = 0;
    await Promise.all(frames.map(frameDataURL => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loaded++;
          const percentage = Math.round((loaded / frames.length) * 100);
          const message = percentage === 100 ? 'Almost done...' : `Encoding GIF. ${percentage}%`;
          showAlert(message);
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = mainCanvas.width;
          tempCanvas.height = mainCanvas.height;
          tempCtx.drawImage(img, 0, 0);
          gifEncoder.addFrame(tempCanvas, { delay: window.GIF_FRAME_DELAY });
          tempCanvas.remove();
          resolve();
        };
        img.onerror = (e) => {
          console.error(`Failed to load frame: ${frameDataURL}`, e);
          reject(e);
        };
        img.src = frameDataURL;
      });
    }));

    gifEncoder.render();
    recorderState.gif.frames = [];

    // When GIF is finished rendering
    gifEncoder.on('finished', (blob) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('GIF ready!');
    });
  }

  /**
  * Returns a slugified version of the input string.
  * @param {string} 
  * @return {string}
  */
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /**
  * Returns a formatted date string in the format "yy-mm-dd-hh-mm-ss".
  * @param {Date} [date=new Date()] - The date to format.
  * @return {string}
  */
  function formatDate(date = new Date()) {
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
  }

const alertDiv = document.createElement('div');
alertDiv.id = 'alerter';
alertDiv.style = 'position: absolute; z-index: 2147483647; top: 0; right: 0; padding: 10px; background: rgba(0, 0, 0, 0.7); color: white; text-align: center; font-family: sans-serif; display: none; transition: opacity 0.5s;';

document.body.appendChild(alertDiv);

function showAlert(message, removeAfter = false) {
  alertDiv.style.display = 'block';
  alertDiv.style.opacity = '1';
  alertDiv.innerText = message;

  if (removeAfter) {
    window.setTimeout(() => {
      alertDiv.style.opacity = '0';
      window.setTimeout(() => {
        alertDiv.style.display = 'none';
      }, 500);
    }, 4000);
  }
}

})();
