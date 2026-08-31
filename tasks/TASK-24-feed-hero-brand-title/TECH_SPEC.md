# TECH_SPEC.md — Техническая спецификация (TASK-24)

## 1. Архитектура компонента
- В `public/feed.html`:
  ```html
  <section class="feed-hero-strip" id="feedHeroStrip">
      <canvas id="feedCosmicCanvas" class="feed-cosmic-canvas" width="1400" height="160" aria-hidden="true"></canvas>
      <div class="feed-hero-container">
          <div class="feed-community-brand-wrap">
              <div class="brand-logo-icon-box" aria-hidden="true">
                  <svg class="smart-contract-logo-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                          <linearGradient id="scDocGradHero" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                              <stop stop-color="#38bdf8"></stop>
                              <stop offset="0.5" stop-color="#6188ff"></stop>
                              <stop offset="1" stop-color="#16c784"></stop>
                          </linearGradient>
                      </defs>
                      <path d="M7 3.5h11.5l7.5 7.5v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2z" fill="rgba(56, 189, 248, 0.06)" stroke="url(#scDocGradHero)" stroke-width="1.8" stroke-linejoin="round"></path>
                      <path d="M18.5 3.5v6a1.5 1.5 0 0 0 1.5 1.5h6" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                      <line x1="9.5" y1="12.5" x2="15.5" y2="12.5" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"></line>
                      <line x1="9.5" y1="17.5" x2="19.5" y2="17.5" stroke="#93c5fd" stroke-width="1.8" stroke-linecap="round"></line>
                      <line x1="9.5" y1="22.5" x2="16.5" y2="22.5" stroke="#60a5fa" stroke-width="1.8" stroke-linecap="round"></line>
                      <circle cx="23" cy="23" r="5" fill="#0b1426" stroke="#16c784" stroke-width="1.8"></circle>
                      <path d="M21 23l1.5 1.5 3-3" stroke="#16c784" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
              </div>
              <h1 class="feed-community-brand-title">
                  <span class="feed-community-title-text">Сообщество</span> <span class="logo-smart">Smart</span><span class="logo-contractum">Contractum</span>
              </h1>
          </div>
      </div>
  </section>
  ```
- В `public/forum_social.css`: стилизовать `.feed-community-brand-wrap`, `.brand-logo-icon-box` и `.feed-community-brand-title`.

## 2. Вердикт
`APPROVED`
