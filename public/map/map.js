let mapData = [];
let selectedTile = '0';
let mapWidth = 10;
let mapHeight = 10;
let isMouseDown = false;
let isDragging = false;
let history = [];

let levels = [];
let currentlyEditing = 1;

// Initialize the map
function initializeMap(addOutline = false) {
  mapData = Array(mapHeight).fill().map(() => '0'.repeat(mapWidth));
  if (addOutline) {
    mapData.forEach((row, i) => {
      if (i === 0 || i === mapData.length - 1) {
        mapData[i] = mapData[i].replaceAll('0', '1');
      } else {
        let tmp = mapData[i].split('');
        tmp[0] = '1';
        tmp[row.length-1] = '1';
        mapData[i] = tmp.join('');
      }
    });
  }
  renderMap();
}

// Create a new map with specified dimensions
function createMap() {

  mapWidth = parseInt(document.getElementById('mapWidth').value) || 10;
  mapHeight = parseInt(document.getElementById('mapHeight').value) || 10;

  // Clamp values
  mapWidth = Math.max(1, Math.min(50, mapWidth));
  mapHeight = Math.max(1, Math.min(50, mapHeight));

  document.getElementById('mapWidth').value = mapWidth;
  document.getElementById('mapHeight').value = mapHeight;

  initializeMap(true);

  showStatus('Map created successfully!', 'success');

}

// Clear the map (set all tiles to empty)
function clearMap() {
  mapData = Array(mapHeight).fill().map(() => '0'.repeat(mapWidth));
  renderMap();
  showStatus('Map cleared!', 'success');
}

// Render the map grid
function renderMap() {
  const grid = document.getElementById('mapGrid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${mapWidth}, 1fr)`;

  document.getElementById('map-info').innerText = `Level ${currentlyEditing}: ${mapWidth} x ${mapHeight}`;

  for (let y = 0; y < mapHeight; y++) {
    const row = mapData[y];
    for (let x = 0; x < mapWidth; x++) {
      const tileValue = row[x];
      const tile = document.createElement('div');
      tile.className = `tile tile-${tileValue}`;
      tile.textContent = tileValue === '0' ? '·' : tileValue;
      tile.dataset.x = x;
      tile.dataset.y = y;

      // Mouse event handlers for painting
      tile.onmousedown = (e) => {
        e.preventDefault();
        isMouseDown = true;
        isDragging = false;
        placeTile(x, y);
      };

      tile.onmouseenter = () => {
        if (isMouseDown) {
          isDragging = true;
          placeTile(x, y);
        }
      };

      tile.onmouseup = () => {
        isMouseDown = false;
      };

      grid.appendChild(tile);
    }
  }
}

// Place a tile at the specified coordinates
function placeTile(x, y) {
  const row = mapData[y];
  if (row[x] === selectedTile) { return; }

  const uniqueTiles = 'PKE'.split('');
  if (uniqueTiles.includes(selectedTile) && [...mapData].join('').includes(selectedTile)) {
    showStatus(`Map already has a ${selectedTile}!`, 'error');
    return;
  }

  mapData[y] = row.substring(0, x) + selectedTile + row.substring(x + 1);
  // store in history for undo
  const prev = history[history.length - 1];
  if (prev && prev[0] === y && prev[1] === row) {
  } else {
    history.push([y, row]);
    if (history.length > 20) {
      history.shift();
    }
  }

  renderMap();
}

// Handle tile selection
document.querySelectorAll('.tile-option').forEach(option => {
  option.onclick = function() {
    document.querySelectorAll('.tile-option').forEach(opt => opt.classList.remove('selected'));
    this.classList.add('selected');
    selectedTile = this.dataset.tile;
  };
});

// Export map to array format
function exportMap() {
  const mapCopy = [...mapData];
  const el = document.getElementById('arrayData');
  const raw = mapCopy.reverse().join('-');
  const arrayString = JSON.stringify(raw, null, 2)+',';
  el.value = arrayString;
  el.select();
  el.setSelectionRange(0, 99999); // For mobile devices
  const link = window.location.href.replace(window.location.pathname.split('/').pop(), '') + '?i='+raw;
  navigator.clipboard.writeText(link);
  window.open(link);
  showStatus('Map exported to clipboard!', 'success');
}

// Import map from array format
function importMap() {
  let arrayData = prepInput('arrayData');

  if (!arrayData) {
    showStatus('Please paste array data first!', 'error');
    return;
  }

  try {
    const importedData = arrayData.split('-').reverse();

    // Validate the imported data
    if (!Array.isArray(importedData) || importedData.length === 0) {
      throw new Error('Invalid array format');
    }

    // Check if all rows are strings and have the same length
    const firstRowLength = importedData[0].length;
    if (!importedData.every(row => typeof row === 'string' && row.length === firstRowLength)) {
      throw new Error('All rows must be strings with the same length');
    }

    // Validate tile values
    const validTiles = ['0', '1', 'P', 'K', 'D', 'E', 'C', 'L', 'M', 'S'];
    const hasInvalidTiles = importedData.some(row => 
      [...row].some(tile => !validTiles.includes(tile))
    );

    if (hasInvalidTiles) {
      throw new Error('Invalid tile values found. Use only: 0, 1, P, K, B, E');
    }

    // Import successful
    mapData = importedData;
    mapHeight = mapData.length;
    mapWidth = mapData[0].length;

    document.getElementById('mapWidth').value = mapWidth;
    document.getElementById('mapHeight').value = mapHeight;

    renderMap();
    showStatus(`Map (${mapWidth}x${mapHeight}) imported successfully!`, 'success');

  } catch (error) {
    showStatus(`Import failed: ${error.message}`, 'error');
  }
}

function saveAll() {
  if (window.BUILD) {
    showStatus(`Saving only available in dev mode`, 'error');
    return;
  }

  let mapCopy = [...mapData];
  let mapArray = JSON.stringify(mapCopy.reverse().join('-'), null, 2)+',';
  levels[currentlyEditing] = mapArray;

  let levelsCopy = [...levels].join('+').replaceAll(',', '').replaceAll('"', '');

  const payload = {levels: levelsCopy}

  fetch('/api/data', {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then(response => response.json())
    .then((data) =>  {
      showStatus(`Levels saved`, 'success');
    })
    .catch((error) => {
      showStatus(`Error saving`, 'error');
      console.error('Error:', error);
    });

}

function saveMap() {
  console.log(levels);
  const mapCopy = [...mapData];
  const mapArray = JSON.stringify(mapCopy.reverse().join('-'), null, 2)+',';
  const payLoad = {mapArray};
  fetch('/api/data', {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payLoad),
  })
    .then(response => response.json())
    .then(data => console.log('D: ', data))
    .catch((error) => {
      console.error('Error:', error);
    });

  showStatus(`Map saved to testlevel.js`, 'success');
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type} show`;
  status.style.display = 'block';

  setTimeout(() => {
    status.classList.remove('show');
  }, 3000);
}

// Initialize the editor
createMap();

// Global mouse event handlers to handle mouse release outside of tiles
document.addEventListener('mouseup', () => {
  isMouseDown = false;
});

// Prevent context menu on right click for better user experience
document.addEventListener('contextmenu', (e) => {
  if (e.target.classList.contains('tile')) {
    e.preventDefault();
  }
});

// Prevent text selection while dragging
document.addEventListener('selectstart', (e) => {
  if (isMouseDown && e.target.classList.contains('tile')) {
    e.preventDefault();
  }
});

function prepInput(elementId) {
  let arrayData = document.getElementById('arrayData').value.trim();
  let cleaned = arrayData.replace(/\s/g, "");
  cleaned = cleaned.replaceAll(',', '');
  cleaned = cleaned.replaceAll('"', '');

  return cleaned;
}

let keys = '01PKDGLSEC'.split('')
keys.forEach((k, i) => {
  keys[i] = (k == '0' || k == '1') ? 'Digit'+k : 'Key'+k; 
});

const undo = () => {
    const lastAction = history.pop();
    if (lastAction) {
      mapData[lastAction[0]] = lastAction[1];
      renderMap();
    } else {
      showStatus('Already at last action', 'note');
    }
}
const redo = () => { }

document.querySelector('.scale input').addEventListener('input', (e) => {
  let scale = parseInt(e.target.value, 10) / 100;
  const mapContainer = document.querySelector('.map-container');
  mapContainer.style.transform = `scale(${scale})`
  mapContainer.setAttribute('data-scale', scale);
  console.log(scale);
})

addEventListener('keyup', (e) => {

  document.querySelectorAll('details').forEach((d => d.open = false))
  const modalOpen = document.documentElement.getAttribute('class') === 'modal-is-open';
  const mapContainer = document.querySelector('.map-container');
  let scale = mapContainer.getAttribute('data-scale') || 1;
  scale = parseFloat(scale);

  if (e.code === 'Equal' || e.code === 'Minus') {
    let factor = (e.code === 'Equal') ? 1.1 : 0.9;
    scale *= factor;
    mapContainer.style.transform = `scale(${scale})`
    mapContainer.setAttribute('data-scale', scale);
  }

  if (e.code === 'KeyZ' && e.ctrlKey) {
    undo();
  }
  if (e.code === 'KeyZ' && e.ctrlKey && e.shiftKey) {
    console.log('redo');
  }
  if (e.code === 'KeyS' && e.shiftKey) {
    saveAll();
  }
  if (e.code === 'KeyE' && e.shiftKey) {
    exportMap();
  }
  if (e.code === 'KeyH' && e.shiftKey) {
    document.getElementById('help-modal').showModal();
  }
  if (e.code === 'KeyN' && e.shiftKey) {
    document.getElementById('settings-modal').showModal();
  }
  if (e.code === 'KeyI' && e.shiftKey) {
    document.getElementById('import-modal').showModal();
  }

  if (!modalOpen && keys.includes(e.code) && !e.shiftKey) {
    let k = e.code.split('').pop();
    document.querySelector('.tile-option[data-tile="'+k+'"]').click();
  }
});

async function loadLevels() {
  if (window.BUILD) {
    try {
      const response = await fetch('levels.txt');
      let text = await response.text();
      text = text.split('+');
      return { levels: text }
    } catch (error) {
      console.error('Error:', error);
    }
  } else {
    try {
      const response = await fetch('/api/data');
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

loadLevels()
  .then((data) => {
    levels = data.levels;
    // levels.unshift(data.testlevel);
    document.querySelector('#arrayData').value = levels[0];
    importMap();
    let html = '';
    currentlyEditing = 0;
    levels.forEach((level, i) => {
      let title = `Level ${i+1}`;
      html += `<li><a ${i === 0 ? 'class="active"' : ''} href="#" data-level=${i}>${title}</a></li>`;
    });
    document.querySelector('ul.levels').innerHTML = html;
    document.querySelector('ul.levels').addEventListener('click', (e) => {
      e.preventDefault();
      let prev = currentlyEditing;
      let mapCopy = [...mapData];
      let mapArray = JSON.stringify(mapCopy.reverse().join('-'), null, 2)+',';
      history = [];

      levels[prev] = mapArray;
      currentlyEditing = e.target.dataset.level;
      document.querySelector(`[data-level="${prev}"]`).classList.remove('active');
      e.target.classList = 'active';
      console.log('editing', currentlyEditing, 'Prev', prev, e.target);
      document.querySelector('#arrayData').value = levels[currentlyEditing];
      importMap();
    }, false);
  });




const rows = 32/8;
const tiles = {
  player: 0,
  key: 3,
  spike: 5,
  wall: 9,
  dog: 13,
  loot: 11,
  camera: 12
}

const getCoords = (tile) => {
  let x = (tile%rows)*8;
  let y = Math.floor(tile/rows)*8;
  return {x, y};
}
const makeImage = (src, name, x, y) => {
  let size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled= false
  ctx.drawImage(src, x, y, 8, 8, 0, 0, size, size);
  const i = document.createElement('img');
  i.title = name;
  i.id = name;
  i.src = canvas.toDataURL('image/png');
  i.style.imageRendering = 'pixelated';
  i.style.display = 'none';
  document.body.appendChild(i);
};

let size = 64;
const canvas = document.createElement('canvas');
canvas.width = size;
canvas.height = size;
const ctx = canvas.getContext('2d');
const img = new Image();
img.onload = () => {
  for(let t in tiles) {
    let tileNumber = tiles[t];
    let {x, y} = getCoords(tileNumber);
    makeImage(img, t, x, y);
  }
};
img.src = 'map_t.gif';

window.setTimeout(() => {
  document.querySelector('.tile-option[data-tile="P"]')
    .style.backgroundImage = `url(${document.querySelector('img#player').src})`;

  document.querySelector('.tile-option[data-tile="S"]')
    .style.backgroundImage = `url(${document.querySelector('img#spike').src})`;

  document.querySelector('.tile-option[data-tile="K"]')
    .style.backgroundImage = `url(${document.querySelector('img#key').src})`;

  document.querySelector('.tile-option[data-tile="C"]')
    .style.backgroundImage = `url(${document.querySelector('img#camera').src})`;

  document.querySelector('.tile-option[data-tile="L"]')
    .style.backgroundImage = `url(${document.querySelector('img#loot').src})`;

  document.querySelector('.tile-option[data-tile="D"]')
    .style.backgroundImage = `url(${document.querySelector('img#dog').src})`;
}, 1000);

// menu
const menuButton = document.getElementById('menu-button');
const menu = document.getElementById('menu');
function closeMenu() { menuButton.checked = false; }
//
// modals
const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const scrollbarWidthCssVar = "--pico-scrollbar-width";
const animationDuration = 400; // ms
let visibleModal = null;


document.querySelectorAll('dialog .close').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    closeModal(document.querySelector('[open]'));
  });
});

document.querySelectorAll('.modal').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modal = document.getElementById(event.currentTarget.dataset.target);
    if (!modal) return;
    modal && (modal.open ? closeModal(modal) : openModal(modal));
  });

});

// Open modal
const openModal = (modal) => {
  const { documentElement: html } = document;
  const scrollbarWidth = getScrollbarWidth();
  if (scrollbarWidth) {
    html.style.setProperty(scrollbarWidthCssVar, `${scrollbarWidth}px`);
  }
  html.classList.add(isOpenClass, openingClass);
  setTimeout(() => {
    visibleModal = modal;
    html.classList.remove(openingClass);
  }, animationDuration);
  modal.showModal();
};

// Close modal
const closeModal = (modal) => {
  visibleModal = null;
  const { documentElement: html } = document;
  html.classList.add(closingClass);
  setTimeout(() => {
    html.classList.remove(closingClass, isOpenClass);
    html.style.removeProperty(scrollbarWidthCssVar);
    modal.close();
  }, animationDuration);
};

// Close with a click outside
document.addEventListener("click", (event) => {

  const isClickInsideMenu = menu.contains(event.target);
  const isClickOnMenuButton = menuButton.contains(event.target) 
    || document.querySelector('.menu-toggle-label').contains(event.target);

  if (!isClickInsideMenu && !isClickOnMenuButton && !visibleModal) {
    closeMenu();
  }

  if (visibleModal === null) return;
  const modalContent = visibleModal.querySelector("article");
  const isClickInside = modalContent.contains(event.target);
  !isClickInside && closeModal(visibleModal);
});


// Close with Esc key
document.addEventListener("keydown", (event) => {
  if (event.key === 'Escape' || event.keyCode === 27) {
    closeMenu();
  }
  if (event.key === "Escape" && visibleModal) {
    closeModal(visibleModal);
  }
});

// Get scrollbar width
const getScrollbarWidth = () => {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  return scrollbarWidth;
};

// Is scrollbar visible
const isScrollbarVisible = () => {
  return document.body.scrollHeight > screen.height;
};

document.querySelector('#settings-modal form')
  .addEventListener('submit', (e) => {
    e.preventDefault();
    createMap();

    document.querySelectorAll('dialog').forEach(m => closeModal(m));
    return false;
  }, false);



document.addEventListener('DOMContentLoaded', () => {
  const draggable = document.querySelector('.draggable');
  const dragHandle = draggable.querySelector('.drag-handle');

  let isDragging = false;
  let offsetX, offsetY;

  // Function to get event coordinates
  function getCoords(e) {
    if (e.touches) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  // Mouse/Touch down handler
  const startDrag = (e) => {
    isDragging = true;
    draggable.classList.add('is-dragging');
    draggable.setAttribute('aria-grabbed', 'true');

    // Calculate the initial offset from the pointer to the element's top-left corner
    const coords = getCoords(e);
    offsetX = coords.x - draggable.getBoundingClientRect().left;
    offsetY = coords.y - draggable.getBoundingClientRect().top;
  };

  // Mouse/Touch move handler
  const drag = (e) => {
    if (!isDragging) return;
    
    // Prevent default to avoid selection and scrolling issues on mobile
    e.preventDefault();

    const coords = getCoords(e);

    // Calculate new position relative to the viewport
    let newX = coords.x - offsetX;
    let newY = coords.y - offsetY;

    // Apply the new position
    draggable.style.left = `${newX}px`;
    draggable.style.top = `${newY}px`;
  };

  // Mouse/Touch up handler
  const endDrag = () => {
    isDragging = false;
    draggable.classList.remove('is-dragging');
    draggable.setAttribute('aria-grabbed', 'false');
  };

  // Add event listeners for both mouse and touch events
  dragHandle.addEventListener('mousedown', startDrag);
  dragHandle.addEventListener('touchstart', startDrag);

  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag, { passive: false });

  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  // Keyboard accessibility for dragging
  let isKeyboardDragging = false;
  draggable.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      isKeyboardDragging = !isKeyboardDragging;
      draggable.setAttribute('aria-grabbed', isKeyboardDragging);
      e.preventDefault();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!isKeyboardDragging) return;

    let { top, left } = draggable.getBoundingClientRect();
    const moveAmount = 10;

    switch (e.key) {
      case 'ArrowUp':
        top -= moveAmount;
        break;
      case 'ArrowDown':
        top += moveAmount;
        break;
      case 'ArrowLeft':
        left -= moveAmount;
        break;
      case 'ArrowRight':
        left += moveAmount;
        break;
      default:
        return;
    }

    draggable.style.left = `${left}px`;
    draggable.style.top = `${top}px`;
    e.preventDefault();
  });
});
