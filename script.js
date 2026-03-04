const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

let MOCK_RESERVATIONS = {
    "1324341343": {
        name: "Pitinach chutiprachakij",
        room: "50",
        keycard_pin: "7713",
        checkin_date: today.toISOString(),
        checkout_date: tomorrow.toISOString()
    },
    "1129901948919": {
        name: "Pitinach chutiprachakij",
        room: "50",
        keycard_pin: "7713",
        checkin_date: today.toISOString(),
        checkout_date: tomorrow.toISOString()
    }
};

let CURRENT_USER_CREDENTIAL = null;

const MOCK_ROOMS = [
    {
        id: "101", type: "Standard Room", price: "฿850", occupied: false,
        size: "28 sqm", bed: "2 Twin Beds",
        img: "image/modern_hotel_room_1772553450378.png"
    },
    {
        id: "102", type: "Standard Room", price: "฿850", occupied: true,
        size: "28 sqm", bed: "2 Twin Beds",
        img: "image/hotel_room_standard_1772554637032.png"
    },
    {
        id: "201", type: "Modern Queen Suite", price: "฿1,250", occupied: false,
        size: "35 sqm", bed: "1 Queen Bed",
        img: "image/hotel_room_suite_1772554656536.png"
    },
    {
        id: "305", type: "Executive King Suite", price: "฿1,800", occupied: false,
        size: "45 sqm", bed: "1 King Bed + Sofa Bed",
        img: "image/hotel_room_suite_1772554656536.png"
    },
    {
        id: "402", type: "Presidential Penthouse", price: "฿3,500", occupied: true,
        size: "95 sqm", bed: "2 King Beds",
        img: "image/hotel_room_penthouse_1772554675742.png"
    },
];

document.addEventListener("DOMContentLoaded", () => {
    // --- Navigation System ---
    const navItems = document.querySelectorAll(".nav-item");
    const pages = document.querySelectorAll(".view-panel");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = item.getAttribute("data-target");

            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");

            pages.forEach(page => {
                if (page.id === targetId) {
                    page.style.display = "block";
                    void page.offsetWidth; // trigger reflow
                    page.classList.add("active");
                } else {
                    page.classList.remove("active");
                    setTimeout(() => {
                        if (!page.classList.contains("active")) {
                            page.style.display = "none";
                        }
                    }, 300);
                }
            });
        });
    });

    // --- Hidden Admin Dashboard Logic ---
    const adminTrigger = document.getElementById("hidden-admin-trigger");
    const adminPage = document.getElementById("admin-page");
    const exitAdminBtn = document.getElementById("exit-admin-btn");
    let feedInterval;

    const navToAdmin = () => {
        pages.forEach(p => {
            p.classList.remove("active");
            p.style.display = "none";
        });
        navItems.forEach(n => n.classList.remove("active"));

        adminPage.style.display = "block";
        void adminPage.offsetWidth;
        adminPage.classList.add("active");

        const socialLinks = document.querySelector(".social-links");
        if (socialLinks) socialLinks.style.display = "none";

        startLiveFeed();
    };

    const exitAdmin = () => {
        adminPage.classList.remove("active");
        adminPage.style.display = "none";
        stopLiveFeed();

        // Go back to booking page
        const homePage = document.getElementById("booking-page");
        homePage.style.display = "block";
        void homePage.offsetWidth;
        homePage.classList.add("active");
        document.querySelector("[data-target='booking-page']").classList.add("active");

        const socialLinks = document.querySelector(".social-links");
        if (socialLinks) socialLinks.style.display = "flex";
    };

    adminTrigger.addEventListener("click", () => {
        // Simple hidden pattern: click "Modern Inn" to access backend!
        // Removed confirm() as it gets blocked in some WebViews
        navToAdmin();
    });

    exitAdminBtn.addEventListener("click", exitAdmin);

    // --- Admin Dashboard Interactivity ---
    const adminNavItems = document.querySelectorAll(".admin-nav-item");
    const adminViewPanels = document.querySelectorAll(".admin-view-panel");
    const topbarTitle = document.getElementById("topbar-title");
    const roleSelector = document.getElementById("role-selector");

    adminNavItems.forEach(item => {
        item.addEventListener("click", () => {
            adminNavItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");

            const targetId = item.getAttribute("data-admin-target");
            topbarTitle.textContent = item.textContent.trim();

            adminViewPanels.forEach(panel => {
                if (panel.id === targetId) {
                    panel.classList.add("active");
                } else {
                    panel.classList.remove("active");
                }
            });

            // Render rooms if opening room management
            if (targetId === "admin-room-mgt") {
                renderAdminRooms();
            }
        });
    });

    roleSelector.addEventListener("change", (e) => {
        // Simple visual feedback for prototype role change
        const val = e.target.value;
        if (val === "housekeeping") {
            document.querySelector("[data-admin-target='admin-housekeeper']").click();
        } else if (val === "inside") {
            document.querySelector("[data-admin-target='admin-procurement']").click();
        } else {
            document.querySelector("[data-admin-target='admin-dashboard']").click();
        }
    });

    const renderAdminRooms = () => {
        const container = document.getElementById("admin-rooms-container");
        if (!container) return;
        container.innerHTML = "";

        MOCK_ROOMS.forEach(room => {
            const card = document.createElement("div");
            let statusClass = "status-vacant";
            let badgeClass = "vacant";
            let statusText = "Vacant";

            if (room.occupied) {
                statusClass = "status-occupied";
                badgeClass = "occupied";
                statusText = "Occupied";
            }
            // Add some randomness for cleaning/maintenance in prototype
            if (Math.random() > 0.8) {
                statusClass = room.occupied ? "status-maintenance" : "status-cleaning";
                badgeClass = room.occupied ? "maintenance" : "cleaning";
                statusText = room.occupied ? "Maintenance" : "Cleaning";
            }

            card.className = `admin-room-card ${statusClass}`;
            card.innerHTML = `
                <div class="room-number">Room ${room.id}</div>
                <div class="room-type-admin">${room.type}</div>
                <div class="room-badge ${badgeClass}">${statusText}</div>
                <div style="margin-top: 16px; font-size: 13px; color: var(--text-secondary); border-top: 1px solid #eee; padding-top: 12px; display: flex; justify-content: space-between;">
                    <span>${room.bed}</span>
                    <span style="font-weight: 600; color: #333;">${room.price}</span>
                </div>
            `;
            container.appendChild(card);
        });
    };

    // --- Live Feed Simulation ---
    const feedLogs = document.getElementById("feed-logs");
    const feedTemplates = [
        { type: "booking", label: "NEW BOOKING", text: "Standard Room reserved for 2 nights (Guest: A. Miller)" },
        { type: "booking", label: "CHECK-OUT", text: "Room 402 checked out. Room status updated to Dirty." },
        { type: "request", label: "GUEST REQUEST", text: "Room 12B requested 2 extra towels." },
        { type: "request", label: "MAINTENANCE", text: "Room 305 reported AC making noise." },
        { type: "chat", label: "AI CHAT BOT", text: "Guest inquired about breakfast times. Resolved automatically." },
        { type: "request", label: "ROOM SERVICE", text: "Room 201 ordered 1x Continental Breakfast." },
        { type: "booking", label: "CHECK-IN", text: "Guest Maria Garcia self-checked into Room 12B." }
    ];

    const addFeedItem = (template) => {
        const item = document.createElement("div");
        item.className = `feed-item type-${template.type}`;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        item.innerHTML = `
            <div class="feed-header">
                <span>${template.label}</span>
                <span>${timeStr}</span>
            </div>
            <div class="feed-body">${template.text}</div>
        `;

        feedLogs.prepend(item);

        // Keep log size manageable
        if (feedLogs.children.length > 50) {
            feedLogs.lastChild.remove();
        }
    };

    const startLiveFeed = () => {
        // Initial population
        feedLogs.innerHTML = "";
        for (let i = 0; i < 3; i++) {
            addFeedItem(feedTemplates[Math.floor(Math.random() * feedTemplates.length)]);
        }

        // Continuous updates
        feedInterval = setInterval(() => {
            const randomMsg = feedTemplates[Math.floor(Math.random() * feedTemplates.length)];
            addFeedItem(randomMsg);
        }, Math.floor(Math.random() * 4000) + 3000); // 3-7s random interval
    };

    const stopLiveFeed = () => {
        clearInterval(feedInterval);
    };

    // --- Landing Page Logic ---
    const roomGrid = document.querySelector(".room-grid");
    const modal = document.getElementById("room-modal");
    const modalClose = document.getElementById("modal-close");

    MOCK_ROOMS.forEach(room => {
        const card = document.createElement("div");
        card.className = `room-card ${room.occupied ? 'occupied' : 'available'}`;

        const badgeClass = room.occupied ? 'status-occupied-badge' : 'status-available-badge';
        const badgeLabel = room.occupied ? 'Occupied' : 'Reserve';

        card.innerHTML = `
            <div class="card-img" style="background-image: url('${room.img}')">
                <div class="card-img-overlay ${badgeClass}">${badgeLabel}</div>
            </div>
            <div class="card-body">
                <div class="card-title">${room.type}</div>
                <div class="card-features">
                    <span>${room.bed}</span>
                    <span style="color:#d1c4e9;">•</span>
                    <span>${room.size}</span>
                </div>
                <div class="card-price">${room.price} <span style="font-size:14px; color:var(--text-secondary); font-weight:500;">/ night</span></div>
            </div>
        `;

        if (!room.occupied) {
            card.addEventListener("click", () => {
                document.getElementById("modal-room-type").textContent = room.type;
                document.getElementById("modal-room-price").innerHTML = `${room.price} <span style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">/ night</span>`;
                document.getElementById("modal-room-size").textContent = room.size;
                document.getElementById("modal-room-bed").textContent = room.bed;

                // Update modal image to match the precise room tapped!
                const modalImageEl = document.querySelector(".modal-image");
                if (modalImageEl) {
                    modalImageEl.style.backgroundImage = `url('${room.img}')`;
                }

                modal.classList.add("show");
            });
        }

        roomGrid.appendChild(card);
    });

    modalClose.addEventListener("click", () => modal.classList.remove("show"));
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("show");
    });

    // --- Check-in Application Logic ---
    const form = document.getElementById("checkin-form");
    const input = document.getElementById("credential-input");
    const errorMsg = document.getElementById("error-message");
    const submitBtn = document.getElementById("submit-btn");
    const btnText = submitBtn.querySelector(".btn-text");
    const spinner = submitBtn.querySelector(".spinner");

    const searchView = document.getElementById("search-view");
    const resultView = document.getElementById("result-view");
    const checkoutBtn = document.getElementById("checkout-btn");

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleString(undefined, {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const displayError = (show) => {
        if (show) {
            errorMsg.classList.add("show");
            input.parentElement.style.animation = "shake 0.4s ease-in-out";
            setTimeout(() => { input.parentElement.style.animation = ""; }, 400);
        } else {
            errorMsg.classList.remove("show");
        }
    };

    const showResult = (data) => {
        form.reset();

        document.getElementById("guest-name").textContent = data.name;
        document.getElementById("res-room").textContent = data.room;
        document.getElementById("res-pwd").textContent = data.keycard_pin;
        document.getElementById("res-checkin").textContent = formatDate(data.checkin_date);
        document.getElementById("res-checkout").textContent = formatDate(data.checkout_date);

        // Reset check-out button style in case they checked out previously
        checkoutBtn.textContent = "Check-Out Now";
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = "1";

        searchView.style.opacity = "0";
        searchView.style.transform = "translateY(-15px)";

        setTimeout(() => {
            searchView.classList.remove("active");
            searchView.style.display = "none";

            resultView.style.display = "block";
            void resultView.offsetWidth;
            resultView.classList.add("active");
        }, 300);
    };

    const goBackToSearch = () => {
        resultView.style.opacity = "0";
        resultView.style.transform = "translateY(15px)";

        setTimeout(() => {
            resultView.classList.remove("active");
            resultView.style.display = "none";

            searchView.style.display = "block";
            void searchView.offsetWidth;

            searchView.style.opacity = "1";
            searchView.style.transform = "translateY(0)";
            searchView.classList.add("active");
        }, 300);
    };

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const credentials = input.value.replace(/\s+/g, "").toUpperCase();
        displayError(false);

        btnText.style.display = "none";
        spinner.style.display = "block";
        submitBtn.disabled = true;

        setTimeout(() => {
            btnText.style.display = "block";
            spinner.style.display = "none";
            submitBtn.disabled = false;

            const reservation = MOCK_RESERVATIONS[credentials];

            if (reservation) {
                CURRENT_USER_CREDENTIAL = credentials;
                showResult(reservation);
            } else {
                displayError(true);
            }
        }, 1200);
    });

    document.getElementById("finish-btn").addEventListener("click", goBackToSearch);

    // Completely Native DOM approach to checkout (fixing the issue of alert/confirm restrictions!)
    checkoutBtn.addEventListener("click", () => {
        checkoutBtn.textContent = "Processing...";
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = "0.7";

        // Fake network delay for seamless feeling
        setTimeout(() => {
            if (CURRENT_USER_CREDENTIAL && MOCK_RESERVATIONS[CURRENT_USER_CREDENTIAL]) {
                delete MOCK_RESERVATIONS[CURRENT_USER_CREDENTIAL];
                CURRENT_USER_CREDENTIAL = null;
            }

            // Soft DOM update indicating success
            checkoutBtn.textContent = "Checked Out Successfully ✓";
            checkoutBtn.style.background = "var(--success-color)";
            checkoutBtn.style.opacity = "1";

            setTimeout(() => {
                // Send back to search screen afterwards seamlessly
                goBackToSearch();
                // Revert styling reset happens in showResult later naturally
                checkoutBtn.style.background = "";
            }, 1800);

        }, 800);
    });

    // --- AI Chatbot Logic ---
    const chatBtn = document.getElementById("ai-chat-btn");
    const chatWindow = document.getElementById("ai-chat-window");
    const chatClose = document.getElementById("chat-close");
    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");
    const chatMessages = document.getElementById("chat-messages");

    let isChatOpen = false;

    chatBtn.addEventListener("click", () => {
        if (!isChatOpen) {
            chatWindow.style.display = "flex";
            void chatWindow.offsetWidth; // trigger display flow
            chatWindow.classList.add("open");
            isChatOpen = true;
        } else {
            closeChat();
        }
    });

    const closeChat = () => {
        chatWindow.classList.remove("open");
        setTimeout(() => {
            if (!chatWindow.classList.contains("open")) {
                chatWindow.style.display = "none";
            }
        }, 300);
        isChatOpen = false;
    };

    chatClose.addEventListener("click", closeChat);

    const addMessage = (text, isAI, isError = false) => {
        const msg = document.createElement("div");
        msg.className = `message ${isAI ? 'ai-message' : 'user-message'}`;
        if (isError) {
            msg.style.color = "var(--error-color)";
        }
        msg.textContent = text;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const addTypingIndicator = () => {
        const indicator = document.createElement("div");
        indicator.className = "message ai-message typing-indicator";
        indicator.id = "typing-indicator";
        indicator.textContent = "Typing...";
        indicator.style.opacity = "0.6";
        indicator.style.fontStyle = "italic";
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) {
            indicator.remove();
        }
    };

    const GEMINI_API_KEY = "AIzaSyDIUYsz4usQEI4Wc8VjQ3sHjPtvQXGsZzQ";

    const fetchGeminiResponse = async (query) => {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

        const systemPrompt = "You are the Modern Inn Virtual Assistant. You help guests exclusively with hotel-related questions. The hotel location is at Google Maps (https://maps.app.goo.gl/H8dhnWRZCo3XuMy36). Contact LINE at @906vqhos or via link (https://lin.ee/lwgExvl). Keep responses extremely concise (1-3 sentences max). Tone should be highly polite and welcoming.\n\nUser Question: ";

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: systemPrompt + query }]
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Gemini API Error details:", errorText);
                throw new Error("API Connection Failed");
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "I'm sorry, I couldn't formulate a proper response.";
            }

        } catch (error) {
            console.error("Gemini Error:", error);
            return "I apologize, but I'm currently unable to connect to my AI systems.";
        }
    };

    const handleChat = async () => {
        const query = chatInput.value.trim();
        if (!query) return;

        addMessage(query, false);
        chatInput.value = "";

        addTypingIndicator();

        // Fetch external AI Response natively
        const responseText = await fetchGeminiResponse(query);

        removeTypingIndicator();
        addMessage(responseText, true);
    };

    chatSend.addEventListener("click", handleChat);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleChat();
    });
});
