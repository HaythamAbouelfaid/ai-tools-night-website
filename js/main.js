/* Main.js - UI Logic */

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------
    // Event Configuration (Easy Update Spot)
    // --------------------------------------------------------
    const EVENT_CONFIG = {
        date: "March 25",
        year: "2026"
    };

    // Update Event Badge
    const eventBadge = document.getElementById('event-date-badge');
    if (eventBadge) {
        eventBadge.textContent = `Next Event: ${EVENT_CONFIG.date}`;
    }

    // --------------------------------------------------------
    // FAQ Accordion
    // --------------------------------------------------------
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                // Toggle current item
                const isActive = item.classList.contains('active');

                // Optional: Close others (accordian style)
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) otherItem.classList.remove('active');
                });

                item.classList.toggle('active', !isActive);
            });
        }
    });

    // --------------------------------------------------------
    // Mobile Menu Toggle
    // --------------------------------------------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('header');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Transform hamburger to X
            const bars = document.querySelectorAll('.bar');
            if (navLinks.classList.contains('active')) {
                bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                // Reset bars
                const bars = document.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            });
        });
    }

    // --------------------------------------------------------
    // Scroll Effects (Header)
    // --------------------------------------------------------
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(10, 15, 28, 0.95)';
            header.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        } else {
            header.style.background = 'rgba(10, 15, 28, 0.85)';
            header.style.borderBottom = 'var(--border-glass)';
        }
    });

    // --------------------------------------------------------
    // Intersection Observer for Fade-in Animations
    // --------------------------------------------------------
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animatedElements = document.querySelectorAll('.card, .timeline-item, .section-title, .section-desc');

    animatedElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
        fadeInObserver.observe(el);
    });
});

// --------------------------------------------------------
// Events Page Logic
// --------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the events page
    const featuredContainer = document.getElementById('featured-event-container');
    const eventsGrid = document.getElementById('events-grid');

    if (!featuredContainer && !eventsGrid) return; // Exit if not events page

    // --- Data ---

    const upcomingEvent = {
        title: "AI Tool Explorers Night | Connect & Make New Friends",
        date: new Date("2026-03-25T18:00:00"),
        endDate: new Date("2026-03-25T20:00:00"),
        locationName: "Aslin Beer Company - Herndon",
        address: "767 Elden St · Herndon, VA",
        hosts: ["Gus", "Haytham"],
        desc: "Join us for a clear, structured night of AI demos and networking. We respect your time with a tight schedule and actionable takeaways.",
        meetupUrl: "https://www.meetup.com/weve_got_now/", // Placeholder
        flow: [
            { time: "6:00 PM", title: "Arrivals & Intros" },
            { time: "6:15 PM", title: "AI Demo / Learning Nugget" },
            { time: "6:45 PM", title: "Q&A and Discussion" },
            { time: "7:00 PM", title: "Networking" }
        ]
    };

    const pastEvents = [
        {
            title: "AI Tool Explorers Night | Connect & Make New Friends",
            date: new Date("2025-08-20T18:00:00"),
            location: "Aslin Beer Company - Herndon",
            city: "Herndon",
            hosts: ["Gus"],
            attendees: 52,
            photos: 2,
            tags: ["AI Tools", "Networking", "Automation"]
        },
        {
            title: "AI Tool Explorers Night | Connect & Make New Friends",
            date: new Date("2025-09-17T18:00:00"),
            location: "Aslin Beer Company - Herndon",
            city: "Herndon",
            hosts: ["Gus", "Soham J."],
            attendees: 60,
            photos: 3,
            tags: ["AI Tools", "Structured Format", "Networking"]
        },
        {
            title: "AI Explorers Night | Connect & Make New Friends",
            date: new Date("2025-10-15T18:00:00"),
            location: "AI Explorer Rooftop",
            city: "Herndon",
            hosts: ["Gus", "Soham J."],
            attendees: 53,
            photos: 3,
            tags: ["AI Tools", "Community", "Rooftop"]
        },
        {
            title: "AI Explorers Night | Connect & Make New Friends",
            date: new Date("2025-11-12T18:15:00"),
            location: "AI Explorer VIP Lounge",
            city: "Herndon",
            hosts: ["Gus", "Soham", "Haytham"],
            attendees: 5,
            photos: 5,
            tags: ["Workshop", "Automation", "Make.com"],
            note: "Automate 101 (Make.com live examples)"
        },
        {
            title: "AI Explorers Night | Connect & Make New Friends",
            date: new Date("2025-11-21T19:00:00"),
            location: "The Veil",
            city: "Richmond",
            hosts: ["Gus", "Haytham A."],
            attendees: 3,
            photos: 8,
            tags: ["Richmond", "Social", "AI Tools"]
        },
        {
            title: "AI Tools Explorers Night | NOVA & GMU Edition",
            date: new Date("2025-12-03T18:15:00"),
            location: "AI Explorer VIP Lounge",
            city: "Herndon",
            hosts: ["Gus", "Soham", "Haytham"],
            attendees: 11,
            photos: 5,
            tags: ["NOVA", "GMU", "Special Edition"]
        }
    ];

    // --- State ---
    let currentFilter = 'all';
    let currentSearch = '';
    let currentSort = 'newest';

    // --- Render Functions ---

    function renderFeaturedEvent() {
        if (!featuredContainer) return;

        const dateStr = upcomingEvent.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        const timeStr = `${formatTime(upcomingEvent.date)} – ${formatTime(upcomingEvent.endDate)} EDT`;

        const flowHtml = upcomingEvent.flow.map(step => `
            <div class="flow-step">
                <span class="flow-time">${step.time}</span>
                <span class="flow-title">${step.title}</span>
            </div>
        `).join('');

        featuredContainer.innerHTML = `
            <div class="card featured-event-card">
                <div class="featured-left-col">
                    <div class="featured-cover">
                        <img src="assets/banner.jpg" alt="Featured Event Cover">
                        <div class="featured-overlay-info">
                             <div class="host-info">
                                <span class="host-label">Hosted By</span>
                                <div class="host-names">${upcomingEvent.hosts.join(' & ')}</div>
                             </div>
                             <a href="https://maps.google.com/?q=${encodeURIComponent(upcomingEvent.address)}" target="_blank" class="map-link">
                                <i data-lucide="map" size="16"></i> View Map
                             </a>
                        </div>
                    </div>
                </div>
                
                <div class="featured-details-panel">
                    <div class="featured-header">
                        <div class="featured-badge-container">
                            <span class="featured-badge pulse-animation">
                                <span class="badge-dot"></span> NEXT EVENT
                            </span>
                        </div>
                        <h2 class="featured-title">${upcomingEvent.title}</h2>
                        <div class="featured-meta">
                            <div class="featured-meta-item">
                                <i data-lucide="calendar" size="18"></i>
                                <span>${dateStr}</span>
                            </div>
                            <div class="featured-meta-item">
                                <i data-lucide="clock" size="18"></i>
                                <span>${timeStr}</span>
                            </div>
                            <div class="featured-meta-item">
                                <i data-lucide="map-pin" size="18"></i>
                                <span>${upcomingEvent.locationName}</span>
                            </div>
                        </div>
                    </div>
                
                    <div class="featured-desc">
                        <p>${upcomingEvent.desc}</p>
                        <p class="featured-note"><strong>Note:</strong> We will be by the blue couches by the bar — ask for ${upcomingEvent.hosts[0]} or ${upcomingEvent.hosts[1]}~</p>
                    </div>
                    
                    <div class="featured-flow">
                        <h4>Event Agenda</h4>
                        <div class="flow-steps">
                            ${flowHtml}
                        </div>
                    </div>

                    <div class="featured-actions">
                        <a href="${upcomingEvent.meetupUrl}" target="_blank" class="btn btn-primary" style="justify-content: center;">RSVP on Meetup</a>
                        <button id="add-to-calendar-btn" class="btn btn-secondary" style="justify-content: center;">
                            <i data-lucide="calendar-plus" size="18"></i> Add to Calendar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Re-initialize icons
        lucide.createIcons();

        // Add Calendar Listener
        document.getElementById('add-to-calendar-btn').addEventListener('click', () => downloadICS(upcomingEvent));
    }

    function renderPastEvents() {
        if (!eventsGrid) return;

        // Filter
        let filtered = pastEvents.filter(event => {
            const matchesSearch = (event.title + event.city + event.tags.join(' ')).toLowerCase().includes(currentSearch.toLowerCase());
            const matchesFilter = currentFilter === 'all'
                ? true
                : (event.city === currentFilter || event.tags.includes(currentFilter));
            return matchesSearch && matchesFilter;
        });

        // Sort
        filtered.sort((a, b) => {
            return currentSort === 'newest' ? b.date - a.date : a.date - b.date;
        });

        // Render
        if (filtered.length === 0) {
            eventsGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center;">No events found matching your criteria.</p>';
            return;
        }

        eventsGrid.innerHTML = filtered.map((event, index) => {
            const dateStr = event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

            const tagsHtml = event.tags.slice(0, 3).map(tag => `<span class="tag-badge">${tag}</span>`).join('');

            // Use specific cover if available, else default
            const coverImg = event.coverImage || "assets/cover2.png";

            return `
                <div class="event-grid-card">
                    <div class="event-card-cover">
                        <img src="${coverImg}" alt="${event.title} Cover">
                         <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; color: white;">
                            ${event.photos} Photos
                       </div>
                    </div>
                    <div class="card-content">
                        <div class="card-date">${dateStr}</div>
                        <h3 class="card-title">${event.title}</h3>
                        <div class="card-location">
                            <i data-lucide="map-pin" size="14"></i>
                            ${event.location}
                        </div>
                        <div class="card-stats" style="align-items: center;">
                            <span style="display:flex; align-items:center; gap:4px;"><i data-lucide="users" size="14"></i> ${event.attendees} Attendees</span>
                            <span>Hosted by ${event.hosts[0]} ${event.hosts.length > 1 ? '& ' + event.hosts[1] : ''}</span>
                        </div>
                        <div class="card-tags">
                            ${tagsHtml}
                        </div>
                        <div style="margin-top: 16px;">
                            <a href="#" class="btn btn-primary btn-sm-cards" style="text-decoration:none;">View on Meetup</a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Re-init icons
        lucide.createIcons();


    }

    // --- Helpers ---

    function formatTime(date) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    function downloadICS(event) {
        const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');
        const calendarData = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `SUMMARY:${event.title}`,
            `DTSTART:${formatDate(event.date)}`,
            `DTEND:${formatDate(event.endDate)}`,
            `LOCATION:${event.address}`,
            `DESCRIPTION:${event.desc}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n');

        const blob = new Blob([calendarData], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'event.ics';
        a.click();
        window.URL.revokeObjectURL(url);
    }



    // --- Event Listeners ---

    // Search
    const searchInput = document.getElementById('event-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            renderPastEvents();
        });
    }

    // Sort
    const sortSelect = document.getElementById('event-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderPastEvents();
        });
    }

    // Filter Chips
    const filterChips = document.querySelectorAll('.chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Remove active class from all
            filterChips.forEach(c => c.classList.remove('active'));
            // Add to clicked
            chip.classList.add('active');
            // Update state
            currentFilter = chip.getAttribute('data-filter');
            renderPastEvents();
        });
    });

    // --- Init ---
    renderFeaturedEvent();
    renderPastEvents();

});

// --------------------------------------------------------
// Initialize AI Chat Assistant Widget
// --------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const chatScript = document.createElement('script');
    chatScript.src = '/js/chat.js';
    document.body.appendChild(chatScript);
});
