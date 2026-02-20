/* Main.js - UI Logic */

const EVENT_CONFIG = {
    date: "March 25",
    year: "2026"
};

const upcomingEvent = {
    title: "AI Tool Explorers Night | Connect & Make New Friends",
    date: new Date("2026-03-25T18:00:00"),
    endDate: new Date("2026-03-25T20:00:00"),
    locationName: "Aslin Beer Company - Herndon",
    address: "767 Elden St · Herndon, VA",
    hosts: ["Gus", "Haytham"],
    desc: "Join us for a clear, structured night of AI demos and networking. We respect your time with a tight schedule and actionable takeaways.",
    meetupUrl: "https://www.meetup.com/weve_got_now/",
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

// --- Helpers ---
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function safeCreateIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // 1. Static UI elements
    const eventBadge = document.getElementById('event-date-badge');
    if (eventBadge) eventBadge.textContent = `Next Event: ${EVENT_CONFIG.date}`;

    // 2. FAQ Accordion
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                document.querySelectorAll('.faq-item').forEach(other => other.classList.remove('active'));
                item.classList.toggle('active', !isActive);
            });
        }
    });

    // 3. Mobile Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('header');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const bars = document.querySelectorAll('.bar');
            if (navLinks.classList.contains('active')) {
                bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                bars.forEach(b => { b.style.transform = 'none'; b.style.opacity = '1'; });
            }
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                document.querySelectorAll('.bar').forEach(b => { b.style.transform = 'none'; b.style.opacity = '1'; });
            });
        });
    }

    // 4. Scroll Header
    window.addEventListener('scroll', () => {
        if (header) header.style.background = window.scrollY > 50 ? 'rgba(10, 15, 28, 0.95)' : 'rgba(10, 15, 28, 0.85)';
    });

    // 5. Animations
    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    function observeElements(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.style.opacity = "0";
            el.style.transform = "translateY(20px)";
            el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
            fadeInObserver.observe(el);
        });
    }

    // 6. Events Logic
    const featuredContainer = document.getElementById('featured-event-container');
    const eventsGrid = document.getElementById('events-grid');

    if (featuredContainer || eventsGrid) {
        let currentFilter = 'all';
        let currentSearch = '';
        let currentSort = 'newest';

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
                            <img src="assets/banner.jpg" alt="Cover">
                            <div class="featured-overlay-info">
                                 <div class="host-info">
                                    <span class="host-label">Hosted By</span>
                                    <div class="host-names">${upcomingEvent.hosts.join(' & ')}</div>
                                 </div>
                                 <a href="https://maps.google.com/?q=${encodeURIComponent(upcomingEvent.address)}" target="_blank" class="map-link">
                                    <i data-lucide="map"></i> View Map
                                 </a>
                            </div>
                        </div>
                    </div>
                    <div class="featured-details-panel">
                        <div class="featured-header">
                            <span class="featured-badge pulse-animation">NEXT EVENT</span>
                            <h2 class="featured-title">${upcomingEvent.title}</h2>
                            <div class="featured-meta">
                                <div class="featured-meta-item"><i data-lucide="calendar"></i> <span>${dateStr}</span></div>
                                <div class="featured-meta-item"><i data-lucide="clock"></i> <span>${timeStr}</span></div>
                                <div class="featured-meta-item"><i data-lucide="map-pin"></i> <span>${upcomingEvent.locationName}</span></div>
                            </div>
                        </div>
                        <div class="featured-desc">
                            <p>${upcomingEvent.desc}</p>
                            <p class="featured-note"><strong>Note:</strong> We will be by the blue couches by the bar!</p>
                        </div>
                        <div class="featured-flow">
                            <h4>Event Agenda</h4>
                            <div class="flow-steps">${flowHtml}</div>
                        </div>
                        <div class="featured-actions">
                            <a href="${upcomingEvent.meetupUrl}" target="_blank" class="btn btn-red" style="justify-content: center;">RSVP on Meetup</a>
                            <button id="add-to-calendar-btn" class="btn btn-secondary" style="justify-content: center;">
                                <i data-lucide="calendar-plus"></i> Add to Calendar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            safeCreateIcons();
            const calBtn = document.getElementById('add-to-calendar-btn');
            if (calBtn) calBtn.onclick = () => downloadICS(upcomingEvent);
            observeElements('.featured-event-card');
        }

        function renderPastEvents() {
            if (!eventsGrid) return;
            let filtered = pastEvents.filter(event => {
                const matchesSearch = (event.title + event.city + event.tags.join(' ')).toLowerCase().includes(currentSearch.toLowerCase());
                const matchesFilter = currentFilter === 'all' ? true : (event.city === currentFilter || event.tags.includes(currentFilter));
                return matchesSearch && matchesFilter;
            });
            filtered.sort((a, b) => currentSort === 'newest' ? b.date - a.date : a.date - b.date);

            if (filtered.length === 0) {
                eventsGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center;">No events found.</p>';
                return;
            }

            eventsGrid.innerHTML = filtered.map(event => {
                const dateStr = event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return `
                    <div class="event-grid-card">
                        <div class="event-card-cover">
                            <img src="assets/banner.jpg" alt="Cover">
                             <div class="photo-badge">${event.photos} Photos</div>
                        </div>
                        <div class="card-content">
                            <div class="card-date">${dateStr}</div>
                            <h3 class="card-title">${event.title}</h3>
                            <div class="card-location"><i data-lucide="map-pin"></i> ${event.location}</div>
                            <div class="card-stats">
                                <span><i data-lucide="users"></i> ${event.attendees}</span>
                                <span>${event.city}</span>
                            </div>
                            <div class="card-tags">${event.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}</div>
                            <div style="margin-top: 16px;"><a href="#" class="btn btn-red btn-sm-cards">View Details</a></div>
                        </div>
                    </div>
                `;
            }).join('');
            safeCreateIcons();
            observeElements('.event-grid-card');
        }

        function downloadICS(event) {
            const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');
            const calendarData = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `SUMMARY:${event.title}`, `DTSTART:${formatDate(event.date)}`, `DTEND:${formatDate(event.endDate)}`, `LOCATION:${event.address}`, `DESCRIPTION:${event.desc}`, 'END:VEVENT', 'END:VCALENDAR'].join('\n');
            const blob = new Blob([calendarData], { type: 'text/calendar' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'event.ics'; a.click();
            window.URL.revokeObjectURL(url);
        }

        // Listeners for Events Page
        const searchInput = document.getElementById('event-search');
        if (searchInput) searchInput.oninput = (e) => { currentSearch = e.target.value; renderPastEvents(); };
        const sortSelect = document.getElementById('event-sort');
        if (sortSelect) sortSelect.onchange = (e) => { currentSort = e.target.value; renderPastEvents(); };
        document.querySelectorAll('.chip').forEach(chip => {
            chip.onclick = () => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentFilter = chip.getAttribute('data-filter');
                renderPastEvents();
            };
        });

        renderFeaturedEvent();
        renderPastEvents();
    }

    // Initial Observation for static content
    observeElements('.card, .timeline-item, .section-title, .section-desc');
    safeCreateIcons();
});
