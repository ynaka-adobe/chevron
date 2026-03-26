/**
 * Nav Flyout Block
 *
 * Full-screen flyout navigation with two-level drill-down,
 * modeled after Chevron's mobile navigation pattern.
 *
 * Content model (block table):
 *   Each row = one navigation item
 *   Column 1 = parent link (e.g. "Who we are" linking to /who-we-are)
 *   Column 2 = child links as a <ul> list (optional — items without children show as flat links)
 *
 * The block renders hidden by default. It exposes a global toggle method
 * that the header block can call to open/close the flyout.
 */

function buildLevel1(navItems) {
  const panel = document.createElement('div');
  panel.className = 'nav-flyout-panel nav-flyout-level1';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Navigation menu');

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'nav-flyout-close';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.innerHTML = '<span class="nav-flyout-icon nav-flyout-icon-close"></span>';
  panel.append(closeBtn);

  // Primary nav (items with children — shown with chevron arrow)
  const primaryList = document.createElement('ul');
  primaryList.className = 'nav-flyout-list nav-flyout-primary';

  // Secondary nav (items without children — shown as flat links)
  const secondaryList = document.createElement('ul');
  secondaryList.className = 'nav-flyout-list nav-flyout-secondary';

  navItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'nav-flyout-item';

    if (item.children.length > 0) {
      // Item with sub-menu: render as a button that opens level 2
      const btn = document.createElement('button');
      btn.className = 'nav-flyout-trigger';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('data-index', index);
      btn.textContent = item.label;
      const chevron = document.createElement('span');
      chevron.className = 'nav-flyout-icon nav-flyout-icon-chevron';
      btn.append(chevron);
      li.append(btn);
      primaryList.append(li);
    } else {
      // Flat link — no sub-menu
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      a.className = 'nav-flyout-link';
      li.append(a);
      secondaryList.append(li);
    }
  });

  panel.append(primaryList);
  if (secondaryList.children.length) panel.append(secondaryList);
  return panel;
}

function buildLevel2(navItems) {
  const container = document.createElement('div');
  container.className = 'nav-flyout-level2-container';

  navItems.forEach((item, index) => {
    if (item.children.length === 0) return;

    const panel = document.createElement('div');
    panel.className = 'nav-flyout-panel nav-flyout-level2';
    panel.setAttribute('data-index', index);
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', `${item.label} submenu`);

    // Header row: back | title | close
    const header = document.createElement('div');
    header.className = 'nav-flyout-level2-header';

    const backBtn = document.createElement('button');
    backBtn.className = 'nav-flyout-back';
    backBtn.setAttribute('aria-label', 'Back to main menu');
    backBtn.innerHTML = '<span class="nav-flyout-icon nav-flyout-icon-back"></span>';

    const title = document.createElement('span');
    title.className = 'nav-flyout-level2-title';
    title.textContent = item.label;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'nav-flyout-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '<span class="nav-flyout-icon nav-flyout-icon-close"></span>';

    header.append(backBtn, title, closeBtn);
    panel.append(header);

    // Child links
    const list = document.createElement('ul');
    list.className = 'nav-flyout-list nav-flyout-sublist';

    item.children.forEach((child, childIndex) => {
      const li = document.createElement('li');
      li.className = 'nav-flyout-subitem';
      if (childIndex === 0) li.classList.add('nav-flyout-overview');
      const a = document.createElement('a');
      a.href = child.href;
      a.textContent = child.label;
      a.className = 'nav-flyout-link';
      li.append(a);
      list.append(li);
    });

    panel.append(list);
    container.append(panel);
  });

  return container;
}

function parseNavItems(block) {
  const items = [];
  [...block.children].forEach((row) => {
    const cols = [...row.children];
    const parentCol = cols[0];
    const childCol = cols[1];

    const parentLink = parentCol?.querySelector('a');
    if (!parentLink) return;

    const item = {
      label: parentLink.textContent.trim(),
      href: parentLink.href,
      children: [],
    };

    if (childCol) {
      const childLinks = childCol.querySelectorAll('a');
      childLinks.forEach((a) => {
        item.children.push({
          label: a.textContent.trim(),
          href: a.href,
        });
      });
    }

    items.push(item);
  });
  return items;
}

export default function decorate(block) {
  const navItems = parseNavItems(block);

  // Clear block content and build flyout structure
  block.textContent = '';

  // Backdrop overlay
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-flyout-backdrop';
  block.append(backdrop);

  // Build panels
  const level1 = buildLevel1(navItems);
  const level2Container = buildLevel2(navItems);
  block.append(level1, level2Container);

  // --- Interaction Logic ---

  function open() {
    block.classList.add('is-open');
    document.body.classList.add('nav-flyout-active');
    // Focus trap: focus the close button
    const closeBtn = level1.querySelector('.nav-flyout-close');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    block.classList.remove('is-open');
    document.body.classList.remove('nav-flyout-active');
    // Reset any open level 2 panels
    level2Container.querySelectorAll('.is-open').forEach((p) => p.classList.remove('is-open'));
    block.classList.remove('level2-active');
  }

  function openLevel2(index) {
    const panel = level2Container.querySelector(`.nav-flyout-level2[data-index="${index}"]`);
    if (!panel) return;
    // Close any other open level 2 panels
    level2Container.querySelectorAll('.is-open').forEach((p) => p.classList.remove('is-open'));
    panel.classList.add('is-open');
    block.classList.add('level2-active');
    // Focus the back button
    const backBtn = panel.querySelector('.nav-flyout-back');
    if (backBtn) backBtn.focus();
  }

  function closeLevel2() {
    level2Container.querySelectorAll('.is-open').forEach((p) => p.classList.remove('is-open'));
    block.classList.remove('level2-active');
  }

  // Close buttons
  block.querySelectorAll('.nav-flyout-close').forEach((btn) => {
    btn.addEventListener('click', close);
  });

  // Back buttons
  block.querySelectorAll('.nav-flyout-back').forEach((btn) => {
    btn.addEventListener('click', closeLevel2);
  });

  // Level 1 triggers → open level 2
  level1.querySelectorAll('.nav-flyout-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = btn.getAttribute('data-index');
      openLevel2(index);
    });
  });

  // Backdrop click → close
  backdrop.addEventListener('click', close);

  // Escape key → close
  block.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (block.classList.contains('level2-active')) {
        closeLevel2();
      } else {
        close();
      }
    }
  });

  // Expose open/close on the block element so the header can call it
  block.dataset.navFlyoutReady = 'true';
  block.open = open;
  block.close = close;

  // Also expose a global toggle for easy integration
  window.toggleNavFlyout = () => {
    if (block.classList.contains('is-open')) {
      close();
    } else {
      open();
    }
  };
}
