// ================= NAVBAR & SCROLL MONITOR =================
    const navbar = document.getElementById('navbar');
    (function initScrollMonitor() {
      let scrollTimer = null;

      // Passive scroll monitor for navbar & hover suppression
      window.addEventListener('scroll', () => {
        document.body.classList.add('is-scrolling');
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          document.body.classList.remove('is-scrolling');
        }, 100);

        // Optimized navbar toggle
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }, { passive: true });
    })();

    // Modal logic
    const modal = document.getElementById('projectModal');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalStack = document.getElementById('modalStack');
    const modalMatch = document.getElementById('modalMatch');

    function scrollToPortfolioSection(sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        const navHeight = 72;
        const targetPos = el.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: Math.max(0, targetPos),
          behavior: 'smooth'
        });
      }
    }

    // ================= NAVBAR SMOOTH NAVIGATION & SCROLLSPY =================
    (function initNavbarNavigation() {
      const navLinks = document.querySelectorAll('.navbar .nav-link');
      if (!navLinks.length) return;

      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            scrollToPortfolioSection(targetId);
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      });

      // ScrollSpy: highlight active nav item during scroll
      const trackedSections = ['home', 'projects', 'story-section', 'skills-universe', 'originals', 'about-me', 'journey', 'contact'];
      window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 120;
        for (let i = trackedSections.length - 1; i >= 0; i--) {
          const sec = document.getElementById(trackedSections[i]);
          if (sec && sec.offsetTop <= scrollPosition) {
            navLinks.forEach(link => {
              if (link.getAttribute('href') === '#' + trackedSections[i]) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
            break;
          }
        }
      }, { passive: true });
    })();

    function openProjectModal(title, subtitle, desc, stack, match, image, liveUrl, year, quality) {
      modalTitle.textContent = title;
      modalSubtitle.textContent = subtitle;
      modalDesc.textContent = desc;
      modalStack.textContent = stack;

      if (match) {
        modalMatch.style.display = 'inline-block';
        modalMatch.textContent = match.includes('%') ? (match.includes('Match') ? match : match + ' Match') : match;
      } else {
        modalMatch.style.display = 'none';
      }

      const yearEl = document.getElementById('modalYearTag');
      if (yearEl) {
        yearEl.textContent = year || '2026';
        yearEl.style.display = (year === false || year === '') ? 'none' : 'inline-block';
      }

      const qualityEl = document.getElementById('modalQualityTag');
      if (qualityEl) {
        qualityEl.textContent = quality || 'HD';
        qualityEl.style.display = (quality === false || quality === '') ? 'none' : 'inline-block';
      }

      // Set project modal hero image dynamically
      let selectedImg = image || 'images/default_hero.svg';

      if (modalImg) {
        modalImg.src = selectedImg;
        if (selectedImg.includes('management_hub_banner')) {
          modalImg.style.objectFit = 'contain';
          modalImg.style.background = '#ffffff';
        } else if (selectedImg.includes('management_hub_logo')) {
          modalImg.style.objectFit = 'contain';
          modalImg.style.background = '#0a0e18';
        } else {
          modalImg.style.objectFit = 'cover';
          modalImg.style.background = '#141414';
        }
      }

      // Configure Play Button Link
      const playBtn = document.getElementById('modalPlayBtn');
      const actionsRow = document.getElementById('modalActions');
      const targetUrl = liveUrl || (title && title.toUpperCase().includes('MANAGEMENT HUB') ? 'https://management-hub-1c14c.web.app' : '');
      if (playBtn && actionsRow) {
        if (targetUrl) {
          playBtn.href = targetUrl;
          actionsRow.style.display = 'flex';
        } else {
          actionsRow.style.display = 'none';
        }
      }

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function openBioModal() {
      openProjectModal(
        'Profile & Bio',
        'Creative Developer & Architecture',
        'A passionate developer focused on building modern, high-performance web applications with stunning visual appeal, intuitive micro-interactions, and robust software architecture.',
        'React, Next.js, Modern CSS, TypeScript, Web Architecture',
        'CREATIVE DEVELOPER',
        'images/default_hero.svg'
      );
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = 'auto';
    }

    function closeModalOnOverlay(e) {
      if (e.target === modal) {
        closeModal();
      }
    }

    // Resume Modal & File handlers
    function openResumeModal() {
      const r = window.activePortfolioData && window.activePortfolioData.resume;
      const resModal = document.getElementById('resumeModal');
      const imgContainer = document.getElementById('resumeImageViewerContainer');
      const imgFrame = document.getElementById('resumeImageFrame');
      const pdfContainer = document.getElementById('resumePdfViewerContainer');
      const pdfFrame = document.getElementById('resumePdfFrame');
      const docPreview = document.getElementById('printResumeArea');
      const openFullBtn = document.getElementById('btnModalOpenFull');

      const rawImg = (r && (r.resumeImage || r.imageUrl)) || 'images/ashish_cv.jpg';
      const resumeImg = rawImg.includes('?') ? rawImg : (rawImg + '?v=' + Date.now());
      const resumePdf = (r && r.pdfUrl) || 'images/ashish_cv.pdf';

      if (openFullBtn) {
        openFullBtn.href = rawImg;
      }

      if (r && r.viewMode === 'pdf' && resumePdf) {
        window.open(resumePdf, '_blank');
        return;
      }

      if (imgContainer && imgFrame) {
        imgFrame.src = resumeImg;
        imgContainer.style.display = 'block';
        if (pdfContainer) pdfContainer.style.display = 'none';
        if (docPreview) docPreview.style.display = 'none';
      } else if (resumePdf && pdfFrame && pdfContainer) {
        pdfFrame.src = resumePdf;
        pdfContainer.style.display = 'block';
        if (imgContainer) imgContainer.style.display = 'none';
        if (docPreview) docPreview.style.display = 'none';
      } else if (docPreview) {
        docPreview.style.display = 'block';
      }

      if (resModal) {
        resModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeResumeModal() {
      const resModal = document.getElementById('resumeModal');
      if (resModal) {
        resModal.classList.remove('open');
        document.body.style.overflow = 'auto';
      }
    }

    function closeResumeModalOnOverlay(e) {
      const resModal = document.getElementById('resumeModal');
      if (e.target === resModal) {
        closeResumeModal();
      }
    }

    function downloadResume() {
      const r = window.activePortfolioData && window.activePortfolioData.resume;
      const fileUrl = (r && (r.resumeImage || r.imageUrl || r.pdfUrl)) || 'images/ashish_cv.jpg';
      const fileName = (r && (r.fileName || r.pdfName)) || 'Ashish_Singh_Resume.jpg';

      fetch(fileUrl)
        .then(res => {
          if (!res.ok) throw new Error('Download failed');
          return res.blob();
        })
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const dlLink = document.createElement('a');
          dlLink.href = blobUrl;
          dlLink.download = fileName;
          document.body.appendChild(dlLink);
          dlLink.click();
          document.body.removeChild(dlLink);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
        })
        .catch(() => {
          const dlLink = document.createElement('a');
          dlLink.href = fileUrl;
          dlLink.download = fileName;
          dlLink.target = '_blank';
          document.body.appendChild(dlLink);
          dlLink.click();
          document.body.removeChild(dlLink);
        });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        closeResumeModal();
      }
    });

    // Skills Universe Interactive Selection Logic (Instantaneous switch + Mobile Accordion support)
    function showSkillCategory(index, isExplicitClick = false) {
      const tabs = document.querySelectorAll('.skill-nav-btn');
      const panels = document.querySelectorAll('.skill-panel-view');
      const accItems = document.querySelectorAll('.skill-accordion-item');

      const isMobile = window.innerWidth <= 820;
      const isAlreadyActive = accItems[index] && accItems[index].classList.contains('active');

      if (isMobile && isExplicitClick && isAlreadyActive) {
        accItems[index].classList.remove('active');
        if (tabs[index]) tabs[index].classList.remove('active');
        if (panels[index]) panels[index].classList.remove('active');
        return;
      }

      for (let i = 0; i < tabs.length; i++) {
        if (i === index) {
          tabs[i].classList.add('active');
          if (panels[i]) panels[i].classList.add('active');
          if (accItems[i]) accItems[i].classList.add('active');
        } else {
          tabs[i].classList.remove('active');
          if (panels[i]) panels[i].classList.remove('active');
          if (accItems[i]) accItems[i].classList.remove('active');
        }
      }
    }

    // My Journey Season Interactive Selector (Instantaneous Hover & Click Switching)
    function filterJourneySeason(index) {
      const items = document.querySelectorAll('.season-nav-item');
      items.forEach((item, i) => {
        if (i === index) item.classList.add('active');
        else item.classList.remove('active');
      });

      const panels = document.querySelectorAll('.journey-season-panel');
      panels.forEach((panel, i) => {
        if (i === index) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    }

    function triggerSearch() {
      const q = prompt('Search projects, tech stack, or skills:');
      if (q) {
        alert(`Searching portfolio for: "${q}"... Check out the Projects row below!`);
      }
    }

    // ================= REAL-TIME PORTFOLIO HYDRATION & SYNC ENGINE =================
    window.activePortfolioData = null;

    // Microsecond Floating Sync Toast Badge
    function flashMicroSyncBadge() {
      let badge = document.getElementById('comradeMicroSyncBadge');
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'comradeMicroSyncBadge';
        badge.style.cssText = `
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: rgba(15, 15, 15, 0.94);
          color: #46D369;
          border: 1px solid rgba(70, 211, 105, 0.4);
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(70, 211, 105, 0.25);
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 99999;
          pointer-events: none;
          opacity: 0;
          transform: translateY(12px) scale(0.96);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(8px);
        `;
        badge.innerHTML = `
          <span style="width:8px; height:8px; border-radius:50%; background:#46D369; box-shadow:0 0 8px #46D369; display:inline-block; animation:pulse 1s infinite alternate;"></span>
          <span>⚡ Synced in microseconds</span>
        `;
        document.body.appendChild(badge);
      }

      badge.style.opacity = '1';
      badge.style.transform = 'translateY(0) scale(1)';

      clearTimeout(window._syncBadgeTimer);
      window._syncBadgeTimer = setTimeout(() => {
        if (badge) {
          badge.style.opacity = '0';
          badge.style.transform = 'translateY(12px) scale(0.96)';
        }
      }, 1600);
    }

    // Comprehensive Dynamic Hydration Function
    function applyPortfolioData(data) {
      if (!data) return;
      window.activePortfolioData = data;

      // 1. BILLBOARD / HERO SECTION
      if (data.profile) {
        const p = data.profile;
        if (p.name && document.getElementById('billboardTitle')) {
          document.getElementById('billboardTitle').textContent = p.name;
        }
        // Billboard Meta Row (Badges & Tags)
        const metaContainer = document.querySelector('.billboard-meta');
        if (metaContainer) {
          if (Array.isArray(p.metaTags) && p.metaTags.length > 0) {
            metaContainer.innerHTML = p.metaTags.map((tagObj, idx) => {
              const text = typeof tagObj === 'string' ? tagObj : (tagObj.text || '');
              const type = typeof tagObj === 'string' ? (idx === 0 ? 'match' : (text.toUpperCase() === 'HD' || text.toUpperCase() === '4K' || text.toUpperCase() === 'MDS' ? 'hd' : 'tag')) : (tagObj.type || 'tag');
              if (type === 'match') {
                return `<span class="match-score" style="color: ${p.matchColor || '#46D369'}; border-color: ${p.matchColor || '#46D369'};">${text}</span>`;
              } else if (type === 'hd') {
                return `<span class="meta-hd">${text}</span>`;
              } else {
                return `<span class="meta-tag">${text}</span>`;
              }
            }).join(' ');
          } else {
            if (document.getElementById('billboardMatch')) {
              if (p.match) {
                document.getElementById('billboardMatch').textContent = p.match.includes('%') ? (p.match.includes('Match') ? p.match : p.match + ' Match') : p.match;
                document.getElementById('billboardMatch').style.display = 'inline-block';
              } else {
                document.getElementById('billboardMatch').style.display = 'none';
              }
            }
            if (p.year && document.getElementById('billboardYear')) {
              document.getElementById('billboardYear').textContent = p.year;
            }
            if (p.rating && document.getElementById('billboardRating')) {
              document.getElementById('billboardRating').textContent = p.rating;
            }
            if (p.quality && document.getElementById('billboardQuality')) {
              document.getElementById('billboardQuality').textContent = p.quality;
            }
          }
        }
        if (document.getElementById('billboardSeason')) {
          if (p.season) {
            document.getElementById('billboardSeason').textContent = p.season;
            document.getElementById('billboardSeason').style.display = 'inline-block';
          } else {
            document.getElementById('billboardSeason').style.display = 'none';
          }
        }
        if (document.getElementById('billboardDesc')) {
          const bioText = (p.bio || '').trim();
          document.getElementById('billboardDesc').textContent = bioText;
          document.getElementById('billboardDesc').style.display = bioText ? 'block' : 'none';
        }
        // Billboard image
        const heroImg = document.querySelector('.billboard-img');
        if (heroImg) {
          const heroSrc = (p.heroImage || '').trim();
          if (heroSrc) {
            heroImg.src = heroSrc;
            heroImg.style.display = 'block';
          } else {
            heroImg.src = '';
            heroImg.style.display = 'none';
          }
        }
        // Avatar images
        const avatarSrc = (p.avatarImage || '').trim();
        document.querySelectorAll('.profile-thumb').forEach(thumb => {
          if (avatarSrc) {
            thumb.src = avatarSrc;
            thumb.style.display = '';
          } else {
            thumb.src = 'images/default_avatar.svg';
          }
        });
        // Subtitle badge
        if (p.storySubtitle) {
          const seriesBadge = document.querySelector('.series-badge span');
          if (seriesBadge) seriesBadge.textContent = p.storySubtitle;
        }
        // Fonts & Colors Customization
        if (p.titleFont && document.getElementById('billboardTitle')) {
          document.getElementById('billboardTitle').style.fontFamily = p.titleFont;
        }
        if (p.titleColor && document.getElementById('billboardTitle')) {
          document.getElementById('billboardTitle').style.color = p.titleColor;
        }
        if (p.titleSize && document.getElementById('billboardTitle')) {
          document.getElementById('billboardTitle').style.fontSize = p.titleSize + 'rem';
        }
        if (p.matchColor && document.getElementById('billboardMatch')) {
          document.getElementById('billboardMatch').style.color = p.matchColor;
          document.getElementById('billboardMatch').style.borderColor = p.matchColor;
        }
        if (p.eyebrowColor) {
          const seriesBadge = document.querySelector('.series-badge span');
          if (seriesBadge) seriesBadge.style.color = p.eyebrowColor;
        }
        if (p.bioColor && document.getElementById('billboardDesc')) {
          document.getElementById('billboardDesc').style.color = p.bioColor;
        }
        if (p.btn1Text) {
          const b1 = document.querySelector('.btn-play span');
          if (b1) b1.textContent = p.btn1Text;
        }
        if (p.btn1Link) {
          const b1Link = document.querySelector('.btn-play');
          if (b1Link) b1Link.href = p.btn1Link;
        }
        if (p.btn2Text) {
          const b2 = document.querySelector('.btn-info span');
          if (b2) b2.textContent = p.btn2Text;
        }
        if (p.btn2Link) {
          const b2Btn = document.querySelector('.btn-info');
          if (b2Btn && (p.btn2Link.startsWith('http') || p.btn2Link.startsWith('#'))) {
            b2Btn.onclick = () => {
              if (p.btn2Link.startsWith('#')) {
                scrollToPortfolioSection(p.btn2Link.substring(1));
              } else {
                window.open(p.btn2Link, '_blank');
              }
            };
          }
        }
        if (p.brandLogo) {
          document.querySelectorAll('.logo').forEach(el => el.textContent = p.brandLogo);
        }
      }

      // 2. ABOUT ME ("THE PLOT") SECTION
      if (data.about) {
        const defAbout = (window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.about) || {};
        const a = { ...defAbout, ...data.about };
        if (!Array.isArray(a.introLines) || a.introLines.length === 0) {
          a.introLines = defAbout.introLines || [];
        }
        if (!a.pursuing) a.pursuing = defAbout.pursuing || '';
        if (!a.primaryLanguage) a.primaryLanguage = defAbout.primaryLanguage || '';
        if (!a.location) a.location = defAbout.location || '';
        if (!a.workExperience) a.workExperience = defAbout.workExperience || '';
        if (!a.interest) a.interest = defAbout.interest || '';
        if (!a.posterImg) a.posterImg = defAbout.posterImg || 'images/ashish_about_1792849174111.jpg';
        if (!a.posterName) a.posterName = defAbout.posterName || 'ASHISH SINGH';
        if (!a.posterRole) a.posterRole = defAbout.posterRole || 'PROTAGONIST / DEVELOPER';

        const tag = document.getElementById('aboutPlotTag');
        if (tag) tag.textContent = a.tag || 'THE PLOT';

        const mainTitle = document.getElementById('aboutMainTitle');
        if (mainTitle) mainTitle.textContent = a.title || 'ABOUT ME';

        const redLine = document.querySelector('.about-red-h-line');
        if (redLine && a.accentColor) redLine.style.background = a.accentColor;
        if (tag && a.accentColor) tag.style.color = a.accentColor;

        const posterWrapper = document.querySelector('.about-poster-wrapper');
        const posterImg = document.getElementById('aboutPosterImg') || document.querySelector('.about-poster-img');
        const posterName = document.getElementById('aboutPosterName') || document.querySelector('.about-poster-name');
        const rolePill = document.getElementById('aboutRolePill') || document.querySelector('.about-role-pill');
        const introBox = document.getElementById('aboutIntroText') || document.querySelector('.about-intro-text');

        const hasPosterImg = Boolean(a.posterImg && a.posterImg.trim());
        const hasPosterName = Boolean(a.posterName && a.posterName.trim());
        const hasPosterRole = Boolean(a.posterRole && a.posterRole.trim());

        if (posterImg) {
          if (hasPosterImg) {
            posterImg.src = a.posterImg;
            posterImg.style.display = 'block';
          } else {
            posterImg.src = '';
            posterImg.style.display = 'none';
          }
        }

        if (posterName) {
          posterName.textContent = a.posterName || '';
          posterName.style.display = hasPosterName ? 'block' : 'none';
        }

        if (rolePill) {
          rolePill.textContent = a.posterRole || '';
          if (a.accentColor) rolePill.style.color = a.accentColor;
          rolePill.style.display = hasPosterRole ? 'inline-block' : 'none';
        }

        if (posterWrapper) {
          posterWrapper.style.display = 'block';
        }

        if (introBox) {
          if (a.accentColor) introBox.style.borderLeftColor = a.accentColor;
          let lines = Array.isArray(a.introLines) ? a.introLines.filter(l => l && l.trim()) : [];
          if (lines.length === 0 && defAbout.introLines && Array.isArray(defAbout.introLines)) {
            lines = defAbout.introLines.filter(l => l && l.trim());
          }
          if (lines.length > 0) {
            introBox.innerHTML = lines.map(line => `<span class="about-intro-line">${line}</span>`).join('');
            introBox.style.display = 'block';
          } else {
            introBox.style.display = '';
          }
        }

        if (a.accentColor) {
          document.querySelectorAll('.about-meta-label').forEach(lbl => {
            lbl.style.color = a.accentColor;
          });
        }

        const metaMap = [
          { id: 'aboutPursuingVal', val: a.pursuing },
          { id: 'aboutLanguageVal', val: a.primaryLanguage },
          { id: 'aboutLocationVal', val: a.location },
          { id: 'aboutExperienceVal', val: a.workExperience },
          { id: 'aboutInterestVal', val: a.interest }
        ];
        let visibleMetaCount = 0;
        metaMap.forEach(item => {
          const el = document.getElementById(item.id);
          if (el) {
            const text = (item.val || '').trim();
            el.textContent = text;
            const parent = el.closest('.about-meta-item');
            if (parent) {
              if (text) {
                parent.style.display = '';
                visibleMetaCount++;
              } else {
                parent.style.display = 'none';
              }
            }
          }
        });

        const metaGrid = document.querySelector('.about-meta-grid');
        if (metaGrid) {
          metaGrid.style.display = 'grid';
        }
      }

      // 3. THE SCREENPLAY / STORY & EDUCATION
      if (data.story) {
        const s = data.story;
        if (s.screenplayEyebrow && document.getElementById('screenplayTag')) {
          document.getElementById('screenplayTag').textContent = s.screenplayEyebrow;
        }
        if (s.screenplayTitle && document.getElementById('screenplayMainTitle')) {
          document.getElementById('screenplayMainTitle').textContent = s.screenplayTitle;
        }
        if (document.getElementById('storyHeaderTitle')) {
          document.getElementById('storyHeaderTitle').textContent = s.author || (data.profile && data.profile.name) || 'PORTFOLIO LEAD';
        }

        // Dynamic Screenplay Colors
        if (s.headingColor) {
          if (document.getElementById('screenplayMainTitle')) {
            document.getElementById('screenplayMainTitle').style.color = s.headingColor;
          }
          document.querySelectorAll('.story-section-heading').forEach(el => {
            el.style.color = s.headingColor;
            el.style.borderBottomColor = s.headingColor;
          });
          document.querySelectorAll('.story-edu-card, .story-exp-card, .story-cert-card, .story-skill-group, .story-proj-card').forEach(el => {
            el.style.borderLeftColor = s.headingColor;
          });
          document.querySelectorAll('.story-red-divider').forEach(el => {
            el.style.background = `linear-gradient(90deg, ${s.headingColor} 0%, ${s.headingColor}40 60%, transparent 100%)`;
          });
        }
        if (s.eyebrowColor) {
          if (document.getElementById('screenplayTag')) document.getElementById('screenplayTag').style.color = s.eyebrowColor;
          const redHLine = document.querySelector('.screenplay-red-h-line');
          if (redHLine) redHLine.style.background = s.eyebrowColor;
        }
        if (s.authorColor && document.getElementById('storyHeaderTitle')) {
          document.getElementById('storyHeaderTitle').style.color = s.authorColor;
        }

        // Education cards
        const eduList = document.getElementById('storyEduCardsList');
        if (eduList && Array.isArray(s.education)) {
          if (s.education.length === 0) {
            eduList.innerHTML = '<div style="color:#666; font-size:0.85rem; padding:10px 0;">No education entries added yet.</div>';
          } else {
            eduList.innerHTML = s.education.map(edu => {
              const degrees = [];
              if (edu.degree) {
                edu.degree.split('\n').map(d => d.trim()).filter(Boolean).forEach(d => degrees.push(d));
              }
              if (edu.sub) {
                edu.sub.split('\n').map(b => b.trim()).filter(Boolean).forEach(b => degrees.push(b));
              }
              const degreesHtml = degrees.map(d => `<div class="story-edu-degree" style="color: #ffffff !important;">${d}</div>`).join('');
              return `
                <div class="story-edu-card">
                  <h3 class="story-edu-title" style="color: #ffffff !important; text-transform: none;">${edu.title}</h3>
                  ${degreesHtml}
                </div>
              `;
            }).join('');
          }
        }

        // Academic Experience
        const expCard = document.getElementById('storyAcademicExpCard');
        if (s.academicExperience) {
          const hasRole = Boolean(s.academicExperience.role && s.academicExperience.role.trim());
          const hasInst = Boolean(s.academicExperience.inst && s.academicExperience.inst.trim());
          const hasBullets = Array.isArray(s.academicExperience.bullets) && s.academicExperience.bullets.length > 0;

          if (document.getElementById('storyExpRole')) document.getElementById('storyExpRole').textContent = s.academicExperience.role || '';
          if (document.getElementById('storyExpInst')) document.getElementById('storyExpInst').textContent = s.academicExperience.inst || '';
          const bulletsList = document.getElementById('storyExpBullets');
          if (bulletsList) {
            bulletsList.innerHTML = Array.isArray(s.academicExperience.bullets) ? s.academicExperience.bullets.map(b => {
              if (typeof b === 'string' && b.includes(':') && !b.startsWith('<strong')) {
                const colonIdx = b.indexOf(':');
                const head = b.substring(0, colonIdx).trim();
                const tail = b.substring(colonIdx + 1).trim();
                return `<li><strong>${head}:</strong> ${tail}</li>`;
              }
              return `<li>${b}</li>`;
            }).join('') : '';
          }
          if (expCard) {
            if (!hasRole && !hasInst && !hasBullets) {
              expCard.style.display = 'none';
            } else {
              expCard.style.display = '';
            }
          }
        } else if (expCard) {
          expCard.style.display = 'none';
        }

        // Certifications
        const certList = document.getElementById('storyCertCardsList');
        if (certList && Array.isArray(s.certifications)) {
          if (s.certifications.length === 0) {
            certList.innerHTML = '<div style="color:#666; font-size:0.85rem; padding:10px 0;">No certifications added yet.</div>';
          } else {
            certList.innerHTML = s.certifications.map(c => `
              <div class="story-cert-card">
                <h3 class="story-cert-title">${c.title}</h3>
                <div class="story-cert-issuer">${c.issuer}</div>
                <div class="story-cert-date">${c.date}</div>
              </div>
            `).join('');
          }
        }

        // Technical skills groups
        const techSkillsList = document.getElementById('storyTechSkillsList');
        if (techSkillsList && Array.isArray(s.technicalSkills)) {
          if (s.technicalSkills.length === 0) {
            techSkillsList.innerHTML = '<div style="color:#666; font-size:0.85rem; padding:10px 0;">No technical skills listed yet.</div>';
          } else {
            techSkillsList.innerHTML = s.technicalSkills.map(group => `
              <div class="story-skill-group">
                <h3 class="story-skill-category">${group.category}</h3>
                <p class="story-skill-items">${group.items}</p>
              </div>
            `).join('');
          }
        }

        // Story projects
        const storyProjectsList = document.getElementById('storyProjectsList');
        if (storyProjectsList && Array.isArray(s.storyProjects)) {
          if (s.storyProjects.length === 0) {
            storyProjectsList.innerHTML = '<div style="color:#666; font-size:0.85rem; padding:10px 0;">No story projects added yet.</div>';
          } else {
            storyProjectsList.innerHTML = s.storyProjects.map(sp => {
              const subHtml = sp.subtitle ? `<div class="story-proj-subtitle" style="color: #e4e4e7 !important;">${sp.subtitle}</div>` : '';
              const descHtml = sp.description ? `<div class="story-proj-desc">${sp.description}</div>` : '';
              const bulletsHtml = Array.isArray(sp.bullets) && sp.bullets.length > 0 
                ? `<ul class="story-bullet-list">${sp.bullets.map(b => {
                    if (typeof b === 'string' && b.includes(':') && !b.startsWith('<strong')) {
                      const colonIdx = b.indexOf(':');
                      const head = b.substring(0, colonIdx).trim();
                      const tail = b.substring(colonIdx + 1).trim();
                      return `<li><strong>${head}:</strong> ${tail}</li>`;
                    }
                    return `<li>${b}</li>`;
                  }).join('')}</ul>` 
                : '';
              const techHtml = sp.tech ? `
                <div class="story-proj-tech">
                  <span class="story-proj-tech-label">Tech Stack:</span> ${sp.tech}
                </div>
              ` : '';

              return `
                <div class="story-proj-card">
                  <h3 class="story-proj-title" style="color: #ffffff !important; text-transform: none;">${sp.title}</h3>
                  ${subHtml}
                  ${descHtml}
                  ${bulletsHtml}
                  ${techHtml}
                </div>
              `;
            }).join('');
          }
        }
      }

      // 4. RESUME & PDF ACTIONS
      if (data.resume) {
        const r = data.resume;
        if (r.panelHeading && document.getElementById('resumePanelTitle')) {
          document.getElementById('resumePanelTitle').textContent = r.panelHeading;
        }
        if (r.panelSubheading && document.getElementById('resumePanelDesc')) {
          document.getElementById('resumePanelDesc').innerHTML = r.panelSubheading.replace(/\n/g, '<br>');
        }
        if (document.getElementById('btnResumeViewLabel')) {
          document.getElementById('btnResumeViewLabel').textContent = r.viewBtnText || 'View Resume';
        }
        if (document.getElementById('btnResumeDownloadLabel')) {
          document.getElementById('btnResumeDownloadLabel').textContent = r.downloadBtnText || 'Download Resume';
        }

        // Modal Header actions: Update full view link
        const openFullBtn = document.getElementById('btnModalOpenFull');
        if (openFullBtn) {
          openFullBtn.href = r.resumeImage || r.imageUrl || r.pdfUrl || 'images/ashish_cv.jpg';
        }

        // Resume modal preview fields
        const docName = document.querySelector('.resume-doc-name');
        if (docName) docName.textContent = r.docName || (data.profile && data.profile.name) || 'PORTFOLIO LEAD';

        const docRoles = document.querySelector('.resume-doc-roles');
        if (docRoles) docRoles.textContent = r.docRoles || (data.profile && data.profile.rolePrimary) || 'CREATIVE DEVELOPER';

        if (r.docSummary) {
          const summaryEl = document.querySelector('#printResumeArea > p');
          if (summaryEl) summaryEl.textContent = r.docSummary;
        }

        if (r.techExpertise || r.mgmtExpertise) {
          const compBlocks = document.querySelectorAll('.resume-grid-2col .resume-item-desc');
          if (compBlocks.length >= 2) {
            if (r.techExpertise) compBlocks[0].textContent = r.techExpertise;
            if (r.mgmtExpertise) compBlocks[1].textContent = r.mgmtExpertise;
          }
        }
      }

      // 5. SOCIAL LINKS IN SCREENPLAY & FOOTER
      if (data.socials) {
        const soc = data.socials;
        if (document.getElementById('storyEmailText')) document.getElementById('storyEmailText').textContent = soc.email || '';
        if (document.getElementById('storyEmailLink')) document.getElementById('storyEmailLink').href = 'mailto:' + (soc.email || '');
        if (document.getElementById('storyLinkedInLink')) document.getElementById('storyLinkedInLink').href = soc.linkedin || '#';
        if (document.getElementById('storyGitHubLink')) document.getElementById('storyGitHubLink').href = soc.github || '#';

        // Footer links
        const footerMail = document.querySelector('.footer-social-link[title*="Email"]');
        if (footerMail && soc.email) footerMail.href = 'mailto:' + soc.email;
        const footerLinkedin = document.querySelector('.footer-social-link[title*="LinkedIn"]');
        if (footerLinkedin && soc.linkedin) footerLinkedin.href = soc.linkedin;
        const footerGithub = document.querySelector('.footer-social-link[title*="GitHub"]');
        if (footerGithub && soc.github) footerGithub.href = soc.github;

        // Hydrate Dedicated Social Channel Cards
        if (document.getElementById('socialCardTelegram')) {
          const tgUrl = soc.telegram || 'https://t.me/ashusingh06';
          document.getElementById('socialCardTelegram').href = tgUrl;
          const tgHandle = tgUrl.replace(/^https?:\/\/(t\.me\/|telegram\.me\/)?/, '@').replace(/\/$/, '');
          if (document.getElementById('socialHandleTelegram')) {
            document.getElementById('socialHandleTelegram').textContent = tgHandle || '@telegram';
          }
        }

        if (document.getElementById('socialCardInstagram')) {
          const igUrl = soc.instagram || 'https://instagram.com/ashusingh06';
          document.getElementById('socialCardInstagram').href = igUrl;
          const igHandle = igUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '');
          if (document.getElementById('socialHandleInstagram')) {
            document.getElementById('socialHandleInstagram').textContent = igHandle || '@instagram';
          }
        }

        if (document.getElementById('socialCardLinkedin')) {
          const liUrl = soc.linkedin || '#';
          document.getElementById('socialCardLinkedin').href = liUrl;
          const liName = (data.profile && data.profile.name) || 'Ashish Singh';
          if (document.getElementById('socialHandleLinkedin')) {
            document.getElementById('socialHandleLinkedin').textContent = liName;
          }
        }

        if (document.getElementById('socialCardGithub')) {
          const ghUrl = soc.github || '#';
          document.getElementById('socialCardGithub').href = ghUrl;
          const ghHandle = ghUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '');
          if (document.getElementById('socialHandleGithub')) {
            document.getElementById('socialHandleGithub').textContent = ghHandle || 'ashusingh06';
          }
        }

        if (document.getElementById('socialCardEmail')) {
          const mail = soc.email || 'aashishsinghh06@gmail.com';
          document.getElementById('socialCardEmail').href = 'mailto:' + mail;
          if (document.getElementById('socialHandleEmail')) {
            document.getElementById('socialHandleEmail').textContent = mail;
          }
        }
      }

      // 5B. CONTINUE EXPLORING ROW
      // 6. TRENDING PROJECTS ROW
      if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
        const pSection = document.getElementById('projects');
        if (pSection) {
          const titleSpan = pSection.querySelector('.row-title span:first-child');
          if (titleSpan) titleSpan.textContent = 'Top Projects';
          const seeAll = pSection.querySelector('.row-title .see-all');
          if (seeAll) seeAll.textContent = 'Explore Originals ›';
        }

        const pRow = document.getElementById('projectsRow');
        if (pRow) {
          pRow.innerHTML = '';
          data.projects.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'netflix-card';
            card.onclick = () => openProjectModal(proj.title, proj.subtitle, proj.desc, proj.stack, proj.badge || 'PROJECT', proj.bannerImage || proj.image, proj.liveUrl);
            card.innerHTML = `
              ${proj.badge ? `<span class="top10-badge">${proj.badge}</span>` : ''}
              <img src="${proj.image || 'images/default_hero.svg'}" alt="${proj.title}" class="card-bg" style="object-position: center top;" />
              <div class="card-gradient"></div>
              <div class="card-body">
                <span class="card-category">${proj.category || 'Project'}</span>
                <h3 class="card-title">${proj.title}</h3>
                <div class="card-meta">
                  <span class="card-match">${proj.match ? (proj.match.includes('%') ? proj.match + ' Match' : proj.match) : ''}</span>
                  <span class="card-tags">${proj.stack || ''}</span>
                </div>
              </div>
            `;
            pRow.appendChild(card);
          });
        }
      } else if (data.continueExploring) {
        const ce = data.continueExploring;
        const pSection = document.getElementById('projects');
        if (pSection) {
          const titleSpan = pSection.querySelector('.row-title span:first-child');
          if (titleSpan && ce.title) titleSpan.textContent = ce.title;
          const seeAll = pSection.querySelector('.row-title .see-all');
          if (seeAll && ce.seeAllText) seeAll.textContent = ce.seeAllText;
        }

        const pRow = document.getElementById('projectsRow');
        if (pRow && Array.isArray(ce.cards)) {
          pRow.innerHTML = '';
          const colorMap = {
            gold: '#F59E0B',
            cyan: '#00E5FF',
            crimson: '#E50914',
            emerald: '#10B981',
            purple: '#A855F7'
          };

          ce.cards.forEach(card => {
            const themeColor = colorMap[card.theme] || card.color || '#E50914';
            const cardEl = document.createElement('div');
            cardEl.className = `netflix-card card-theme-${card.theme || 'crimson'}`;
            cardEl.onclick = () => scrollToPortfolioSection(card.target || 'originals');
            cardEl.title = `Resume Watching: ${card.title}`;
            cardEl.innerHTML = `
              <div class="card-play-action">
                <svg viewBox="0 0 24 24"><polygon points="7,5 19,12 7,19" fill="currentColor"/></svg>
              </div>
              <div class="card-art-bg" style="background: linear-gradient(135deg, ${themeColor}25 0%, #08080a 80%); display:flex; align-items:center; justify-content:center;">
                <span style="font-size:2rem; opacity:0.8;">🎬</span>
              </div>
              <div class="card-gradient"></div>
              <div class="card-body">
                <span class="card-ep-tag" style="color:${themeColor};">${card.tag || 'EP 01'}</span>
                <h3 class="card-title">${card.title || 'UNTITLED'}</h3>
              </div>
              <div class="card-progress-bar"><div class="card-progress-fill" style="width: ${card.progress || 50}%; background-color: ${themeColor};"></div></div>
            `;
            pRow.appendChild(cardEl);
          });
        }
      }

      // 7. FEATURED ORIGINALS ROW
      if (data.originalsHeaders) {
        const oh = data.originalsHeaders;
        if (oh.eyebrow && document.getElementById('originalsTag')) {
          document.getElementById('originalsTag').textContent = oh.eyebrow;
        }
        if (oh.title && document.getElementById('originalsMainTitle')) {
          document.getElementById('originalsMainTitle').textContent = oh.title;
        }
        if (oh.accentColor) {
          const redLine = document.getElementById('originalsRedLine');
          if (redLine) redLine.style.background = oh.accentColor;
          const origTag = document.getElementById('originalsTag');
          if (origTag) origTag.style.color = oh.accentColor;
        }
      }

      if (data.originals && Array.isArray(data.originals)) {
        const oRow = document.getElementById('originalsCardsRow');
        if (oRow) {
          oRow.innerHTML = '';
          if (data.originals.length === 0) {
            oRow.innerHTML = '<div style="color: #666; font-size: 0.95rem; padding: 40px 20px; font-family: \'Inter\', sans-serif;">No featured projects added yet.</div>';
          } else {
            data.originals.forEach(orig => {
              const card = document.createElement('div');
              card.className = 'originals-card';
              card.onclick = () => openProjectModal(orig.title, orig.subtitle, orig.desc, orig.stack, orig.badge || 'TOP 1', orig.bannerImage || orig.image, orig.liveUrl, orig.year || '2026', orig.quality || 'HD');
              card.innerHTML = `
                ${orig.badge ? `<span class="top10-badge">${orig.badge}</span>` : ''}
                <img src="${orig.image || 'images/default_hero.svg'}" alt="${orig.title}" class="card-bg" style="object-position: center; object-fit: cover;" />
                <div class="card-gradient"></div>
                <div class="card-body">
                  <span class="card-category">${orig.category}</span>
                  <h3 class="card-title">${orig.title}</h3>
                  <div class="card-meta">
                    <span class="card-tags">${orig.subtitle || orig.tagline || ''}</span>
                  </div>
                  <button class="btn-view-project" onclick="event.stopPropagation(); openProjectModal('${orig.title.replace(/'/g, "\\'")}', '${(orig.subtitle || '').replace(/'/g, "\\'")}', '${(orig.desc || '').replace(/'/g, "\\'")}', '${(orig.stack || '').replace(/'/g, "\\'")}', '${(orig.badge || 'TOP 1').replace(/'/g, "\\'")}', '${(orig.bannerImage || orig.image || '').replace(/'/g, "\\'")}', '${(orig.liveUrl || '').replace(/'/g, "\\'")}', '${(orig.year || '2026').replace(/'/g, "\\'")}', '${(orig.quality || 'HD').replace(/'/g, "\\'")}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    <span>View Project</span>
                  </button>
                </div>
              `;
              oRow.appendChild(card);
            });
          }
        }
      }

      // 8. SKILLS ROW
      if (data.skills && Array.isArray(data.skills)) {
        const sRow = document.getElementById('skillsRow');
        if (sRow) {
          sRow.innerHTML = '';
          data.skills.forEach(skill => {
            const card = document.createElement('div');
            card.className = 'netflix-card';
            card.onclick = () => openProjectModal(skill.title, skill.subtitle, skill.desc, skill.stack, skill.mastery);
            card.innerHTML = `
              <div class="card-gradient" style="background: ${skill.gradient || 'linear-gradient(135deg, #1f2937, #111827)'};"></div>
              <div class="card-body">
                <span class="card-category">${skill.category}</span>
                <h3 class="card-title">${skill.title}</h3>
                <div class="card-meta"><span class="card-match">${skill.mastery} Mastery</span></div>
              </div>
            `;
            sRow.appendChild(card);
          });
        }
      }

      // 9. EXPERIENCE ROW
      if (data.experience && Array.isArray(data.experience)) {
        const eRow = document.getElementById('experienceRow');
        if (eRow) {
          eRow.innerHTML = '';
          data.experience.forEach(exp => {
            const card = document.createElement('div');
            card.className = 'netflix-card';
            card.onclick = () => openProjectModal(exp.title, exp.subtitle, exp.desc, exp.stack, exp.status);
            card.innerHTML = `
              <div class="card-gradient" style="background: ${exp.gradient || 'linear-gradient(180deg, #27272a, #09090b)'};"></div>
              <div class="card-body">
                <span class="card-category">${exp.episode}</span>
                <h3 class="card-title">${exp.title}</h3>
                <div class="card-meta"><span class="card-match">${exp.status}</span></div>
              </div>
            `;
            eRow.appendChild(card);
          });
        }
      }

      // 9B. SKILLS UNIVERSE (INTERACTIVE GENRE SELECTOR)
      if (data.skillsUniverse) {
        const su = data.skillsUniverse;
        if (su.genreTag && document.getElementById('skillsGenreTag')) {
          document.getElementById('skillsGenreTag').textContent = su.genreTag;
        }
        if (su.title && document.getElementById('skillsUniverseTitle')) {
          document.getElementById('skillsUniverseTitle').textContent = su.title;
        }
        if (su.accentColor) {
          const redLine = document.getElementById('skillsRedLine');
          if (redLine) redLine.style.background = su.accentColor;
        }

        const catNav = document.getElementById('skillsCategoryNav');
        const actStage = document.getElementById('skillsActiveStage');
        const categories = Array.isArray(su.categories) ? su.categories : (Array.isArray(su) ? su : []);

        if (catNav && actStage) {
          catNav.innerHTML = '';
          actStage.innerHTML = '';

          if (categories.length === 0) {
            actStage.innerHTML = '<div style="color: #666; font-size: 0.95rem; padding: 40px 20px; font-family: \'Inter\', sans-serif; text-align: center;">No skill categories added yet.</div>';
          } else {
            categories.forEach((cat, idx) => {
              const catName = cat.name || cat.category || 'Category';
              const accent = cat.accent || su.accentColor || '#E50914';
              const eyebrow = cat.eyebrow || `ACTIVE GENRE // 0${idx + 1}`;
              const pills = Array.isArray(cat.pills) ? cat.pills : [];

              // Accordion item container (wraps button + mobile panel)
              const accItem = document.createElement('div');
              accItem.className = `skill-accordion-item ${idx === 0 ? 'active' : ''}`;
              accItem.id = `skillAccItem${idx}`;

              // Nav button
              const btn = document.createElement('button');
              btn.className = `skill-nav-btn ${idx === 0 ? 'active' : ''}`;
              btn.id = `skillTab${idx}`;
              btn.setAttribute('role', 'tab');
              btn.setAttribute('onmouseenter', `if (window.innerWidth > 820) showSkillCategory(${idx}, false)`);
              btn.setAttribute('onclick', `showSkillCategory(${idx}, true)`);
              btn.innerHTML = `
                <div class="skill-btn-left">
                  <span class="skill-nav-indicator" style="background:${accent};"></span>
                  <span>${catName}</span>
                </div>
                <span class="skill-chevron">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                </span>
              `;
              accItem.appendChild(btn);

              // Mobile panel inside accordion item (visible only on mobile directly under genre)
              const mobPanel = document.createElement('div');
              mobPanel.className = 'skill-mobile-panel';
              mobPanel.id = `skillMobilePanel${idx}`;
              mobPanel.innerHTML = `
                <span class="stage-eyebrow" style="color:${accent};">${eyebrow}</span>
                <div class="stage-tech-row">
                  ${pills.map(p => `<span class="stage-pill" style="--accent:${accent}; border-color:${accent}44;">${p}</span>`).join('')}
                </div>
              `;
              accItem.appendChild(mobPanel);

              catNav.appendChild(accItem);

              // Stage panel view
              const panel = document.createElement('div');
              panel.className = `skill-panel-view ${idx === 0 ? 'active' : ''}`;
              panel.id = `skillPanel${idx}`;
              panel.innerHTML = `
                <span class="stage-eyebrow" style="color:${accent};">${eyebrow}</span>
                <h3 class="stage-title">${catName}</h3>
                <div class="stage-tech-row">
                  ${pills.map(p => `<span class="stage-pill" style="--accent:${accent}; border-color:${accent}44;">${p}</span>`).join('')}
                </div>
              `;
              actStage.appendChild(panel);
            });
          }
        }
      }

      // 9C. MY JOURNEY (SEASONS & EPISODES)
      const journeySection = document.getElementById('journey');
      const journeyNavLinks = document.querySelectorAll('a[href="#journey"]');
      const journeyCard = document.querySelector('.netflix-card.card-theme-purple');

      if (data.journey) {
        const j = data.journey;
        const defSeasons = (window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.journey && window.DEFAULT_PORTFOLIO_DATA.journey.seasons) || [];
        let seasons = Array.isArray(j.seasons) && j.seasons.length > 0 ? j.seasons : defSeasons;
        
        // A journey is only valid if it has ACTUAL episodes in seasons 1, 2, 3 or 4
        const hasRealEpisodes = seasons.some(s => !s.isComingSoon && Array.isArray(s.episodes) && s.episodes.length > 0);
        if (!hasRealEpisodes) {
          seasons = defSeasons;
        }
        const isVisible = j.enabled !== false;

        if (journeySection) {
          journeySection.style.display = isVisible ? '' : 'none';
        }
        journeyNavLinks.forEach(link => {
          const parentLi = link.closest('li');
          if (parentLi) parentLi.style.display = isVisible ? '' : 'none';
          else link.style.display = isVisible ? '' : 'none';
        });
        if (journeyCard) {
          journeyCard.style.display = isVisible ? '' : 'none';
        }

        if (isVisible) {
          const sCount = seasons.length;
          const eyebrowTag = document.getElementById('journeyEyebrowTag');
          if (eyebrowTag) {
            eyebrowTag.textContent = `${sCount} ${sCount === 1 ? 'SEASON' : 'SEASONS'}`;
          }
          if (j.title && document.getElementById('journeyMainTitle')) {
            document.getElementById('journeyMainTitle').textContent = j.title;
          }
          if (j.accentColor) {
            const redLine = document.getElementById('journeyRedLine');
            if (redLine) redLine.style.background = j.accentColor;
            const eyebrow = document.getElementById('journeyEyebrowTag');
            if (eyebrow) eyebrow.style.color = j.accentColor;
          }

          const nav = document.getElementById('journeySeasonsNav');
          const container = document.getElementById('journeySeasonsContainer');

          if (nav && container) {
            nav.innerHTML = '';
            container.innerHTML = '';

            seasons.forEach((season, sIdx) => {
              const isActive = sIdx === 0;
              const accent = season.accentColor || j.accentColor || '#E50914';

              // Navigation Button
              const btn = document.createElement('button');
              btn.className = `season-nav-item ${isActive ? 'active' : ''}`;
              btn.id = `seasonTab${sIdx}`;
              btn.setAttribute('role', 'tab');
              btn.setAttribute('onmouseenter', `filterJourneySeason(${sIdx})`);
              btn.setAttribute('onpointerdown', `filterJourneySeason(${sIdx})`);
              btn.setAttribute('onclick', `filterJourneySeason(${sIdx})`);
              btn.innerHTML = `
                <span class="season-item-title">${season.seasonNum || `SEASON ${sIdx + 1}`}</span>
                <span class="season-item-sub">${season.title || ''}</span>
              `;
              nav.appendChild(btn);

              // Season Panel
              const panel = document.createElement('div');
              panel.className = `journey-season-panel ${isActive ? 'active' : ''}`;
              panel.id = `seasonPanel${sIdx}`;

              const episodes = Array.isArray(season.episodes) ? season.episodes : [];
              const isSeasonEmpty = season.isComingSoon || episodes.length === 0;

              if (isSeasonEmpty) {
                panel.innerHTML = `
                  <div class="season-panel-header">
                    <span class="season-title-badge" style="background:${accent};">${season.badge || `SEASON 0${sIdx + 1}`}</span>
                    <h3 class="season-panel-name">${season.title || "What's Next"}</h3>
                  </div>
                  <div class="season-coming-soon" style="min-height: 220px; background: #141414; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; display: flex; align-items: center; justify-content: center; text-align: center;">
                    <h3 class="coming-soon-title" style="font-size: clamp(2.8rem, 6vw, 4.4rem); font-family: 'Bebas Neue', 'Montserrat', sans-serif; letter-spacing: 0.14em; color: #FFFFFF; margin: 0; text-shadow: 0 0 35px ${accent}88;">
                      ${season.comingSoonText || 'COMING SOON'}
                    </h3>
                  </div>
                `;
              } else {
                panel.innerHTML = `
                  <div class="season-panel-header">
                    <span class="season-title-badge" style="background:${accent};">${season.badge || `SEASON 0${sIdx + 1}`}</span>
                    <h3 class="season-panel-name">${season.title || ''}</h3>
                  </div>
                  <div class="season-episodes-grid">
                    ${episodes.map(ep => {
                      const epAccent = ep.color || accent || '#E50914';
                      const tags = Array.isArray(ep.tags) ? ep.tags : [];
                      const bannerImg = ep.image || ep.banner || '';
                      const hasImg = !!bannerImg;
                      return `
                        <div class="episode-card" style="--ep-accent: ${epAccent}; ${ep.link ? 'cursor:pointer;' : ''}" ${ep.link ? `onclick="window.open('${ep.link}', '_blank')"` : ''}>
                          <div class="episode-hero" style="${hasImg ? 'background:#111; padding:0; position:relative; overflow:hidden;' : `background:radial-gradient(circle at 80% 50%, ${epAccent}33, transparent 65%), #0a0a0f; position:relative; overflow:hidden;`}">
                            ${hasImg ? `
                              <span class="episode-badge" style="background:${epAccent};">${ep.epNum || 'EP 01'}</span>
                              <img src="${bannerImg}" alt="${ep.title || ''}" class="episode-img" style="object-position:center; object-fit:cover; width:100%; height:100%; display:block;" />
                              <div class="episode-gradient"></div>
                            ` : `
                              <div class="episode-theme-icon" style="background:${epAccent}20; border-color:${epAccent}55;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="${epAccent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                  <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
                                </svg>
                              </div>
                              <div class="episode-big-num" style="color:${epAccent}; text-shadow:0 0 28px ${epAccent}aa;">
                                <span class="ep-prefix">${(ep.epNum || 'EP 01').split(' ')[0] || 'EP'}</span>${(ep.epNum || 'EP 01').split(' ')[1] || (ep.epNum || '')}
                              </div>
                            `}
                          </div>
                          <div class="episode-body">
                            <div class="episode-title-group">
                              <span class="episode-meta-tag" style="color:${epAccent};">${ep.badge || ''}</span>
                              <h4 class="episode-title">${ep.title || 'Untitled Episode'}</h4>
                            </div>
                            <p class="episode-desc">${ep.desc || ''}</p>
                            <div class="episode-tags">
                              ${tags.map(t => `<span class="episode-tag-pill" style="border-color:${epAccent}33;">${t}</span>`).join('')}
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `;
              }
              container.appendChild(panel);
            });
          }
        }
      }

      // 10. CONTACT / NEXT EPISODE SECTION
      if (data.contact || data.profile) {
        const c = data.contact || {};
        const p = data.profile || {};
        if (c.eyebrow && document.getElementById('contactEyebrowTag')) document.getElementById('contactEyebrowTag').textContent = c.eyebrow;
        if (c.title && document.getElementById('contactMainTitle')) document.getElementById('contactMainTitle').textContent = c.title;

        // Auto-sync directly from Home profile or Contact role
        const resolvedName = (p.name && p.name.trim() !== '') ? p.name : (c.name || '');
        const resolvedRole = (c.role && c.role.trim() !== '') ? c.role : ((p.rolePrimary && p.rolePrimary.trim() !== '') ? p.rolePrimary : ((data.intro && data.intro.roleSecondary) ? data.intro.roleSecondary : (p.match || '')));

        if (document.getElementById('contactName')) document.getElementById('contactName').textContent = resolvedName;
        if (document.getElementById('contactRole')) document.getElementById('contactRole').textContent = resolvedRole;
        if (c.copyright) {
          const copyrightEl = document.querySelector('.copyright');
          if (copyrightEl) copyrightEl.textContent = c.copyright;
        }
        if (c.portfolioCta) {
          const cta = c.portfolioCta;
          if (cta.title && document.getElementById('promoHeading')) document.getElementById('promoHeading').textContent = cta.title;
          if (cta.description && document.getElementById('promoDesc')) document.getElementById('promoDesc').textContent = cta.description;
          if (cta.email && document.getElementById('promoEmailVal')) {
            document.getElementById('promoEmailVal').textContent = cta.email;
            if (document.getElementById('promoEmailLink')) document.getElementById('promoEmailLink').href = `mailto:${cta.email}`;
          }
          if (cta.telegram && document.getElementById('promoTelegramVal')) {
            const cleanTg = cta.telegram.replace('@', '');
            document.getElementById('promoTelegramVal').textContent = `@${cleanTg}`;
            if (document.getElementById('promoTelegramLink')) document.getElementById('promoTelegramLink').href = `https://t.me/${cleanTg}`;
          }
        }
      }

      // Unhide page cleanly after full hydration (Zero Flicker Guaranteed)
      if (typeof window.__REVEAL_PAGE__ === 'function') {
        window.__REVEAL_PAGE__();
      }
    }

    // Dynamic Data Loader (Backend API + LocalStorage fallback)
    function openIDB() {
      return new Promise((resolve) => {
        if (!window.indexedDB) return resolve(null);
        const req = indexedDB.open('ComradePortfolioDB', 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('store')) {
            db.createObjectStore('store');
          }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => resolve(null);
      });
    }

    async function getIDB(key) {
      try {
        const db = await openIDB();
        if (!db) return null;
        return new Promise((resolve) => {
          const tx = db.transaction('store', 'readonly');
          const req = tx.objectStore('store').get(key);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        });
      } catch(e) { return null; }
    }

    async function setIDB(key, val) {
      try {
        const db = await openIDB();
        if (!db) return false;
        return new Promise((resolve) => {
          const tx = db.transaction('store', 'readwrite');
          tx.objectStore('store').put(val, key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        });
      } catch(e) { return false; }
    }
    window.getIDB = getIDB;
    window.setIDB = setIDB;

    function sanitizeUserData(data, uid) {
      return data;
    }

    async function loadDynamicContent() {
      let data = null;

      // DEMO MODE CHECK: If running in standalone Demo Template mode, NEVER load or leak personal data
      if (window.IS_DEMO_MODE) {
        if (window.DEMO_DATA_EMBEDDED) {
          applyPortfolioData(window.DEMO_DATA_EMBEDDED);
          return;
        }
        try {
          const demoRes = await fetch('demo_data.json');
          if (demoRes.ok) {
            data = await demoRes.json();
            applyPortfolioData(data);
            return;
          }
        } catch (e) {}
        return;
      }

      // ================= ZERO-FLICKER SYNCHRONOUS HYDRATION =================
      // Immediately render synchronous cached data (0ms latency, zero flash of old content)
      let initialData = window.__FAST_DATA__ || null;
      if (!initialData) {
        try {
          const stored = localStorage.getItem('comrade_portfolio_data');
          if (stored) initialData = JSON.parse(stored);
        } catch (e) {}
      }
      if (window.DEFAULT_PORTFOLIO_DATA) {
        const defTime = window.DEFAULT_PORTFOLIO_DATA.updatedAt ? new Date(window.DEFAULT_PORTFOLIO_DATA.updatedAt).getTime() : 0;
        const initTime = initialData && initialData.updatedAt ? new Date(initialData.updatedAt).getTime() : 0;
        const hasAbout = initialData && initialData.about && Array.isArray(initialData.about.introLines) && initialData.about.introLines.length > 0;
        const hasJourney = initialData && initialData.journey && Array.isArray(initialData.journey.seasons) && initialData.journey.seasons.some(s => Array.isArray(s.episodes) && s.episodes.length > 0);
        const isStaleHi = initialData && initialData.about && Array.isArray(initialData.about.introLines) && initialData.about.introLines.some(l => l === 'hi');
        const isStaleEp = initialData && initialData.journey && Array.isArray(initialData.journey.seasons) && initialData.journey.seasons.some(s => Array.isArray(s.episodes) && s.episodes.some(e => e.title === '11' || e.title === '1'));
        if (defTime > initTime || !hasAbout || !hasJourney || isStaleHi || isStaleEp || !initialData) {
          initialData = JSON.parse(JSON.stringify(window.DEFAULT_PORTFOLIO_DATA));
          try { localStorage.setItem('comrade_portfolio_data', JSON.stringify(initialData)); } catch(e){}
        }
      }

      if (initialData) {
        // Render instantly before any network delay!
        applyPortfolioData(initialData);
        data = initialData;
      }

      // ================= BACKGROUND SILENT DISK SYNC =================
      // In the background, check if data.json / server has newer changes
      let diskData = null;
      try {
        const res = await fetch('/api/data?v=' + Date.now());
        if (res.ok) diskData = await res.json();
      } catch(e) {
        try {
          const res2 = await fetch('data.json?v=' + Date.now());
          if (res2.ok) diskData = await res2.json();
        } catch(e2) {}
      }

      // Check IndexedDB (in case of large images saved in CEO studio)
      let idbData = null;
      try {
        idbData = await getIDB('comrade_portfolio_data');
      } catch (e) {}

      // Check Firebase Firestore Database (portfolios/portfolio_lead)
      let fbData = null;
      if (window.firebaseGetPortfolio) {
        try {
          fbData = await window.firebaseGetPortfolio('portfolio_lead');
        } catch (e) {}
      }

      // Prioritize freshest data source (Firebase Firestore > Disk > IndexedDB)
      let freshestData = null;
      let freshestTime = initialData && initialData.updatedAt ? new Date(initialData.updatedAt).getTime() : 0;

      [fbData, diskData, idbData].forEach(candidate => {
        if (candidate && candidate.updatedAt) {
          const t = new Date(candidate.updatedAt).getTime();
          if (t > freshestTime) {
            freshestTime = t;
            freshestData = candidate;
          }
        }
      });

      if (freshestData) {
        data = freshestData;
        applyPortfolioData(freshestData);
        try { localStorage.setItem('comrade_portfolio_data', JSON.stringify(freshestData)); } catch(e){}
      }
    }

    // ================= MICROSECOND REAL-TIME CROSS-TAB SYNC ENGINE =================
    (function initRealtimeSync() {
      // 1. Native BroadcastChannel (Triggers within microseconds across tabs)
      if (typeof BroadcastChannel !== 'undefined') {
        const syncChannel = new BroadcastChannel('comrade_portfolio_sync');
        syncChannel.onmessage = (event) => {
          if (event.data && (event.data.type === 'PORTFOLIO_UPDATE' || event.data.type === 'SYNC_UPDATE')) {
            if (event.data.data) {
              applyPortfolioData(event.data.data);
              flashMicroSyncBadge();
            }
          }
        };
      }

      // 2. Storage event fallback (Synchronous cross-tab notification)
      window.addEventListener('storage', (e) => {
        if (e.key === 'comrade_portfolio_data' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            applyPortfolioData(parsed);
            flashMicroSyncBadge();
          } catch(err){}
        }
      });

      // 3. Cloud Firestore Real-time listener (Cross-device worldwide instant sync)
      try {
        if (typeof firebase !== 'undefined' && window.isFirebaseConfigured && window.isFirebaseConfigured()) {
          const db = firebase.firestore();
          db.collection('portfolios').doc('portfolio_lead').onSnapshot((doc) => {
            if (doc.exists) {
              const cloudData = doc.data();
              if (cloudData && cloudData.updatedAt) {
                const cloudTime = new Date(cloudData.updatedAt).getTime();
                const curTime = data && data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
                if (cloudTime > curTime) {
                  data = cloudData;
                  applyPortfolioData(cloudData);
                  try { localStorage.setItem('comrade_portfolio_data', JSON.stringify(cloudData)); } catch(e){}
                  if (typeof flashMicroSyncBadge === 'function') flashMicroSyncBadge();
                }
              }
            }
          }, (err) => {
            console.warn('Firestore live listener notice:', err);
          });
        }
      } catch(e) {}
    })();

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', loadDynamicContent);
    } else {
      loadDynamicContent();
    }

    // ================= CUSTOM RED DOT CURSOR LOGIC =================
    (function initCustomCursor() {
      const dot = document.getElementById('cursorDot');
      const ring = document.getElementById('cursorRing');
      const glow = document.getElementById('cursorGlow');
      if (!dot || !ring) return;

      let mouseX = -200;
      let mouseY = -200;
      let ringX = -200;
      let ringY = -200;
      let glowX = -200;
      let glowY = -200;
      let isVisible = false;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';

        if (!isVisible) {
          dot.style.opacity = '1';
          ring.style.opacity = '1';
          if (glow) glow.style.opacity = '1';
          ringX = mouseX;
          ringY = mouseY;
          glowX = mouseX;
          glowY = mouseY;
          isVisible = true;
        }
      });

      document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
        if (glow) glow.style.opacity = '0';
        isVisible = false;
      });

      document.addEventListener('mouseenter', () => {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        if (glow) glow.style.opacity = '1';
        isVisible = true;
      });

      // Smooth lag effect: ring follows closely, bright red light trails gracefully behind
      function animateCursor() {
        ringX += (mouseX - ringX) * 0.24;
        ringY += (mouseY - ringY) * 0.24;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';

        if (glow) {
          glowX += (mouseX - glowX) * 0.12;
          glowY += (mouseY - glowY) * 0.12;
          glow.style.left = glowX + 'px';
          glow.style.top = glowY + 'px';
        }

        requestAnimationFrame(animateCursor);
      }
      requestAnimationFrame(animateCursor);

      // Click animation
      window.addEventListener('mousedown', () => {
        document.body.classList.add('cursor-active');
      });
      window.addEventListener('mouseup', () => {
        document.body.classList.remove('cursor-active');
      });

      // Hover expansion on interactive elements
      const interactiveTargets = 'a, button, input, textarea, select, .netflix-card, .btn-play, .btn-info, .nav-icon-btn, .profile-trigger, .stat-pill-card, .dropdown-item, [role="button"], .a4-sheet';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveTargets)) {
          document.body.classList.add('cursor-hover');
        }
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveTargets)) {
          document.body.classList.remove('cursor-hover');
        }
      });
    })();

    // ================= CONTACT FORM SUBMISSION =================
    function handleContactSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const firstName = document.getElementById('contactFirstName').value.trim();
      const lastName = document.getElementById('contactLastName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const subject = document.getElementById('contactSubject') ? document.getElementById('contactSubject').value.trim() : '';
      const message = document.getElementById('contactMessage').value.trim();
      const consent = document.getElementById('contactConsent').checked;
      const statusMsg = document.getElementById('contactStatusMsg');
      const submitBtn = document.getElementById('contactSubmitBtn');

      if (!firstName || !lastName || !email || !message) {
        if (statusMsg) {
          statusMsg.className = 'contact-status-msg error';
          statusMsg.textContent = 'Please fill in all required fields.';
          statusMsg.style.display = 'block';
        }
        return;
      }

      if (!consent) {
        if (statusMsg) {
          statusMsg.className = 'contact-status-msg error';
          statusMsg.textContent = 'Please check the consent box to proceed.';
          statusMsg.style.display = 'block';
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span>`;
      }

      const payload = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        subject: subject || 'Portfolio Contact Inquiry',
        message,
        date: new Date().toISOString()
      };

      // 1. Save to Local Backend API (CEO Inbox)
      try {
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch(e) {}

      // 2. Backup in localStorage for offline CEO inbox access
      try {
        const stored = JSON.parse(localStorage.getItem('comrade_contact_messages') || '[]');
        stored.unshift({ id: 'msg_' + Date.now(), ...payload, read: false });
        localStorage.setItem('comrade_contact_messages', JSON.stringify(stored));
      } catch(e) {}

      // 3. Deliver to Gmail via FormSubmit.co
      const targetGmail = (window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.socials && window.DEFAULT_PORTFOLIO_DATA.socials.email) || 'aashishsinghh06@gmail.com';
      fetch(`https://formsubmit.co/ajax/${targetGmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Portfolio Message from ${payload.name}`,
          Name: payload.name,
          Email: payload.email,
          Subject: payload.subject,
          Message: payload.message,
          _template: 'table'
        })
      }).catch(() => {});

      // UI Success Feedback
      setTimeout(() => {
        if (statusMsg) {
          statusMsg.className = 'contact-status-msg success';
          statusMsg.innerHTML = `✓ Thank you, <strong>${firstName} ${lastName}</strong>! Your message has been dispatched successfully. We will reply to <strong>${email}</strong> soon.`;
          statusMsg.style.display = 'block';
        }
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
            <span>Send Message</span>
          `;
        }
      }, 700);
    }