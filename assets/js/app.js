(function () {
  const stateKey = 'yaatri.app.state.v1';
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
      selectedCircuit: 'Kashi-Prayagraj',
      selectedMuhurat: 'May 12-18, 2025'
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
