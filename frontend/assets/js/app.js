(function () {
  const stateKey = 'yaatri.app.state.v1';
  const intentionMap = {
    c1: { id: 1, title: 'Ancestral rites', description: 'Pitru tarpan, shraddha, pind daan for departed family' },
    c2: { id: 2, title: 'Darshan & devotion', description: 'Temple visits, puja, abhishek' },
    c3: { id: 3, title: 'Mannat & fulfilment', description: 'Completion of a vow made to the divine' },
    c4: { id: 4, title: 'Spiritual seeking', description: 'Meditation retreats, satsang, inner pilgrimage' },
    c5: { id: 5, title: 'Festival & Kumbh', description: 'Maha Kumbh, Navratri, Karthik Purnima circuits' },
    c6: { id: 6, title: 'Char Dham Yatra', description: 'Badrinath, Kedarnath, Gangotri, Yamunotri' }
  };

  const flow = [
    'yaatri_splash_screen.html',
    'yaatri_welcome_intention_v2.html',
    'yaatri_profile_setup_screen.html',
    'yaatri_language_selection_screen.html',
    'yaatri_trip_planner_wizard.html'
  ];

  function defaultState() {
    return {
      selectedIntention: 'c2',
      language: 'bi',
      groupSize: 3,
      senior: true,
      mobility: ['mob-none'],
      diet: ['diet-satvik'],
      profile: {
        name: 'Rajiv Sharma',
        phone: '98765 43210'
      },
      duration: '5-7 days',
      budget: 'Rs15k-30k',
      userContext: '',
      selectedCircuit: 'Kashi-Prayagraj',
      selectedMuhurat: 'May 12-18, 2025',
      selectedSankalpId: 2,
      selectedCircuitId: null,
      selectedMuhuratId: null,
      selectedStartDate: null,
      selectedEndDate: null,
      backendBookingId: null
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(stateKey) || '{}');
      return Object.assign(defaultState(), parsed);
    } catch (err) {
      return defaultState();
    }
  }

  function saveState(patch) {
    const next = Object.assign(loadState(), patch || {});
    localStorage.setItem(stateKey, JSON.stringify(next));
    return next;
  }

  function trimSlash(url) {
    return String(url || '').trim().replace(/\/+$/, '');
  }

  function getApiBaseUrl() {
    const fromConfig =
      typeof window !== 'undefined' && window.YAATRI_CONFIG && window.YAATRI_CONFIG.API_BASE_URL
        ? window.YAATRI_CONFIG.API_BASE_URL
        : '';

    const fromStorage = localStorage.getItem('yaatri.api.base') || '';
    const configured = trimSlash(fromConfig || fromStorage);

    if (configured) {
      return configured;
    }

    if (location.protocol === 'http:' || location.protocol === 'https:') {
      return trimSlash(location.origin);
    }

    return 'http://localhost:3000';
  }

  async function apiRequest(path, options) {
    const response = await fetch(getApiBaseUrl() + path, Object.assign({
      headers: {
        'Content-Type': 'application/json'
      }
    }, options || {}));

    const text = await response.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch (err) {
      payload = null;
    }

    if (!response.ok) {
      const message = payload && payload.error ? payload.error : 'Request failed with status ' + response.status;
      throw new Error(message);
    }

    return payload;
  }

  const api = {
    getSankalps: function () {
      return apiRequest('/api/sankalps');
    },
    getCircuits: function (sankalpId) {
      const q = sankalpId ? '?sankalpId=' + encodeURIComponent(String(sankalpId)) : '';
      return apiRequest('/api/circuits' + q);
    },
    getMuhurats: function (circuitId) {
      return apiRequest('/api/circuits/' + encodeURIComponent(String(circuitId)) + '/muhurats');
    },
    createBooking: function (bookingData) {
      return apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
    },
    submitBooking: function (bookingId) {
      return apiRequest('/api/bookings/' + encodeURIComponent(String(bookingId)) + '/submit', {
        method: 'POST'
      });
    }
  };

  function getSankalpMetaByCode(code) {
    return intentionMap[code] || intentionMap.c2;
  }

  function currentFile() {
    const parts = location.pathname.split('/');
    return parts[parts.length - 1] || flow[0];
  }

  function gotoPage(fileName) {
    if (!fileName) {
      return;
    }
    location.href = fileName;
  }

  function gotoNextPage() {
    const curr = currentFile();
    const i = flow.indexOf(curr);
    if (i >= 0 && i < flow.length - 1) {
      gotoPage(flow[i + 1]);
    }
  }

  function gotoPrevPage() {
    const curr = currentFile();
    const i = flow.indexOf(curr);
    if (i > 0) {
      gotoPage(flow[i - 1]);
    }
  }

  function bindGlobalNav() {
    document.querySelectorAll('[data-nav="back"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        gotoPrevPage();
      });
    });

    document.querySelectorAll('[data-nav="next"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        gotoNextPage();
      });
    });

    document.querySelectorAll('[data-nav="skip"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        gotoNextPage();
      });
    });
  }

  function applyPageFade() {
    const frame = document.querySelector('.frame');
    if (frame) {
      frame.classList.add('page-fade');
    }
  }

  function updateStatusbarTime() {
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var value = hh + ':' + mm;
    document.querySelectorAll('.sbt').forEach(function (el) {
      el.textContent = value;
    });
  }

  window.YaatriApp = {
    flow: flow,
    api: api,
    getApiBaseUrl: getApiBaseUrl,
    getSankalpMetaByCode: getSankalpMetaByCode,
    loadState: loadState,
    saveState: saveState,
    gotoPage: gotoPage,
    gotoNextPage: gotoNextPage,
    gotoPrevPage: gotoPrevPage,
    bindGlobalNav: bindGlobalNav
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindGlobalNav();
    applyPageFade();
    updateStatusbarTime();
    window.setInterval(updateStatusbarTime, 30000);
  });
})();
