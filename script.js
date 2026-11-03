
// ============================================
// GIFTERA - SUPABASE CONNECTED WEBSITE
// ============================================

const SUPABASE_URL = "https://ppaseexvdprdrjupnzjh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9NR3AY5q3xb0tArU0Zrr5A_X20nSNnl";
const SITE_URL = "https://giftera.pages.dev";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

let currentUser = null;
let gifts = [];
let requests = [];
let activeFilter = "All";
let toastTimer;
let isPasswordRecovery = false;

// ============================================
// PAGE NAVIGATION
// ============================================

function showPage(id) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(id);
    if (!selectedPage) return;

    selectedPage.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (id === "market") renderMarket();
    if (id === "dashboard") renderDashboard();
    if (id === "home") renderHome();

    setTimeout(() => observeMotion(selectedPage), 80);
}

// ============================================
// AUTHENTICATION MESSAGES
// ============================================

function authMessage(message, error = false) {
    const el = document.getElementById("authMessage");
    if (!el) return;

    el.textContent = message;
    el.style.color = error ? "#b42318" : "#28734e";
}

// ============================================
// PASSWORD RECOVERY INTERFACE
// ============================================

function createPasswordRecoveryUI() {
    const notice = document.getElementById("authNotice");

    if (!notice || document.getElementById("forgotPasswordButton")) {
        return;
    }

    const forgotButton = document.createElement("button");
    forgotButton.id = "forgotPasswordButton";
    forgotButton.className = "btn outline";
    forgotButton.type = "button";
    forgotButton.textContent = "Forgot Password?";
    forgotButton.style.marginTop = "10px";
    forgotButton.onclick = sendPasswordReset;

    notice.appendChild(forgotButton);

    const recoveryForm = document.createElement("div");
    recoveryForm.id = "passwordRecoveryPanel";
    recoveryForm.className = "form-card";
    recoveryForm.style.cssText =
        "display:none;max-width:760px;margin-top:20px;";

    recoveryForm.innerHTML = `
        <h3 style="margin-top:0">Create a new password</h3>
        <p class="section-sub">
            Enter and confirm your new GIFTERA account password.
        </p>

        <div class="field">
            <label>New password</label>
            <input
                id="newPassword"
                type="password"
                minlength="6"
                autocomplete="new-password"
                placeholder="Enter new password"
            >
        </div>

        <div class="field" style="margin-top:14px">
            <label>Confirm new password</label>
            <input
                id="confirmNewPassword"
                type="password"
                minlength="6"
                autocomplete="new-password"
                placeholder="Confirm new password"
            >
        </div>

        <div class="form-actions">
            <button
                class="btn primary"
                type="button"
                onclick="updatePassword()"
            >
                Save New Password
            </button>
        </div>

        <p id="resetMessage" class="hint" aria-live="polite"></p>
    `;

    notice.insertAdjacentElement("afterend", recoveryForm);
}

function resetMessage(message, error = false) {
    const el = document.getElementById("resetMessage");
    if (!el) return;

    el.textContent = message;
    el.style.color = error ? "#b42318" : "#28734e";
}

function showPasswordRecoveryForm() {
    createPasswordRecoveryUI();

    const notice = document.getElementById("authNotice");
    const panel = document.getElementById("passwordRecoveryPanel");

    if (notice) notice.style.display = "block";
    if (panel) panel.style.display = "block";

    isPasswordRecovery = true;
    showPage("upload");

    resetMessage("Enter your new password below.");
}

// ============================================
// SEND PASSWORD RESET EMAIL
// ============================================

async function sendPasswordReset() {
    const email = document.getElementById("authEmail")?.value.trim();

    if (!email) {
        authMessage("Please enter your registered email address first.", true);
        return;
    }

    authMessage("Sending password reset email...");

    try {
        const { error } = await db.auth.resetPasswordForEmail(email, {
            redirectTo: SITE_URL + "/"
        });

        if (error) throw error;

        authMessage(
            "Password reset email sent! Check your inbox and spam folder."
        );

    } catch (error) {
        console.error("Password reset email error:", error);
        authMessage(error.message, true);
    }
}

// ============================================
// SAVE NEW PASSWORD
// ============================================

async function updatePassword() {
    const password = document.getElementById("newPassword")?.value || "";
    const confirmPassword =
        document.getElementById("confirmNewPassword")?.value || "";

    if (password.length < 6) {
        resetMessage(
            "Your password must contain at least 6 characters.",
            true
        );
        return;
    }

    if (password !== confirmPassword) {
        resetMessage("The passwords do not match.", true);
        return;
    }

    resetMessage("Updating your password...");

    try {
        const { data, error } = await db.auth.updateUser({
            password: password
        });

        if (error) throw error;

        currentUser = data.user || currentUser;
        isPasswordRecovery = false;

        document.getElementById("newPassword").value = "";
        document.getElementById("confirmNewPassword").value = "";

        resetMessage("Your password has been changed successfully!");

        updateAuthDisplay();

        toast("GIFTERA password updated successfully.");

    } catch (error) {
        console.error("Password update error:", error);
        resetMessage(error.message, true);
    }
}

// ============================================
// AUTHENTICATION DISPLAY
// ============================================

function updateAuthDisplay() {
    const status = document.getElementById("authStatus");
    const notice = document.getElementById("authNotice");
    const dashboardUser = document.getElementById("dashboardUser");

    if (currentUser) {
        const name =
            currentUser.user_metadata?.full_name ||
            currentUser.email;

        if (status) {
            status.textContent = "Signed in as " + currentUser.email;
        }

        if (notice && !isPasswordRecovery) {
            notice.style.display = "none";
        }

        if (dashboardUser) {
            dashboardUser.textContent =
                "Signed in as " + name + " (" + currentUser.email + ")";
        }

        const ownerInput = document.querySelector('[name="owner"]');

        if (ownerInput && !ownerInput.value) {
            ownerInput.value = name;
        }

    } else {
        if (status) {
            status.textContent = "You are not signed in.";
        }

        if (notice) {
            notice.style.display = "block";
        }

        if (dashboardUser) {
            dashboardUser.textContent = "Sign in to view your account.";
        }
    }
}

// ============================================
// SIGN UP
// ============================================

async function signUp() {
    const name = document.getElementById("authName").value.trim();
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;

    if (!name || !email || password.length < 6) {
        authMessage(
            "Enter your full name, valid email and password of at least 6 characters.",
            true
        );
        return;
    }

    authMessage("Creating your GIFTERA account...");

    try {
        const { data, error } = await db.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name
                }
            }
        });

        if (error) throw error;

        if (data.session) {
            currentUser = data.user;
            authMessage("Account created successfully!");
            await loadGifts();
            updateAuthDisplay();
        } else {
            authMessage(
                "Account created! Check your email for confirmation, then sign in."
            );
        }

    } catch (error) {
        authMessage(error.message, true);
    }
}

// ============================================
// SIGN IN
// ============================================

async function signIn() {
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;

    if (!email || !password) {
        authMessage("Please enter your email and password.", true);
        return;
    }

    authMessage("Signing in...");

    try {
        const { data, error } = await db.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        currentUser = data.user;
        authMessage("Welcome back to GIFTERA!");

        updateAuthDisplay();
        await loadGifts();
        await renderDashboard();

    } catch (error) {
        authMessage(error.message, true);
    }
}

// ============================================
// SIGN OUT
// ============================================

async function signOut() {
    const { error } = await db.auth.signOut();

    if (error) {
        toast(error.message);
        return;
    }

    currentUser = null;
    gifts = [];
    isPasswordRecovery = false;

    updateAuthDisplay();
    renderHome();
    renderMarket();
    renderDashboard();

    toast("You have signed out.");
}

// ============================================
// LOAD GIFTS FROM SUPABASE
// ============================================

async function loadGifts() {
    try {
        const { data, error } = await db
            .from("gifts")
            .select("*")
            .eq("status", "approved");

        if (error) throw error;

        gifts = (data || []).map(g => ({
            id: g.id,
            title: g.title,
            category: g.category,
            points: g.estimated_value || 0,
            condition: g.condition,
            description: g.description,
            photo: g.image_path,
            owner: "GIFTERA member",
            pincode: g.city || "Pune",
            emoji: "🎁",
            bg: "#e4eadf",
            wants: "",
            sample: false
        }));

        renderHome();
        renderMarket();

    } catch (error) {
        console.error("Gift loading error:", error);
        toast("Unable to load community gifts. Please refresh.");
    }
}

// ============================================
// GIFT CARDS
// ============================================

function card(g) {
    const visual = g.photo
        ? `<img src="${escapeHtml(g.photo)}" alt="${escapeHtml(g.title)}" style="width:100%;height:100%;object-fit:cover">`
        : (g.emoji || "🎁");

    return `
    <article class="gift-card">
        <div class="gift-photo" style="background:${g.bg || "#e7e9dc"}">
            <span>${visual}</span>
            <span class="tag">${escapeHtml(g.category)}</span>
        </div>

        <div class="gift-info">
            <h3>${escapeHtml(g.title)}</h3>

            <div class="gift-meta">
                ${escapeHtml(g.condition || "New gift")}
                · ${escapeHtml(g.pincode || "Pune")}
            </div>

            <div class="gift-bottom">
                <span class="points">${Number(g.points) || 0} Gifter Points</span>
                <button class="btn secondary" onclick="openGift('${escapeHtml(g.id)}')">
                    View gift
                </button>
            </div>
        </div>
    </article>`;
}

function renderHome() {
    const container = document.getElementById("homeGifts");
    if (!container) return;

    container.innerHTML = gifts.slice(0, 4).map(card).join("");

    if (!gifts.length) {
        container.innerHTML =
            '<div class="empty">New community gifts will appear here soon.</div>';
    }
}

function renderMarket() {
    const container = document.getElementById("marketGifts");
    if (!container) return;

    const search = (
        document.getElementById("searchInput")?.value || ""
    ).toLowerCase();

    const list = gifts.filter(g => {
        const matchesCategory =
            activeFilter === "All" || g.category === activeFilter;

        const matchesSearch =
            `${g.title} ${g.category} ${g.description || ""}`
                .toLowerCase()
                .includes(search);

        return matchesCategory && matchesSearch;
    });

    container.innerHTML = list.length
        ? list.map(card).join("")
        : '<div class="empty">No approved gifts found. Please check again later.</div>';

    observeMotion(container);
}

function setFilter(category, element) {
    activeFilter = category;

    document.querySelectorAll(".filter").forEach(button => {
        button.classList.remove("active");
    });

    element.classList.add("active");
    renderMarket();
}

// ============================================
// GIFT DETAILS
// ============================================

function openGift(id) {
    const gift = gifts.find(g => String(g.id) === String(id));
    if (!gift) return;

    const visual = gift.photo
        ? `<img src="${escapeHtml(gift.photo)}" alt="${escapeHtml(gift.title)}" style="width:100%;max-height:250px;object-fit:contain">`
        : gift.emoji || "🎁";

    document.getElementById("modalContent").innerHTML = `
        <div style="font-size:65px;text-align:center;background:${gift.bg || "#e7e9dc"};border-radius:15px;padding:20px;margin:15px 0">
            ${visual}
        </div>

        <h2 style="font:30px Georgia;color:var(--green);margin:0 0 6px">
            ${escapeHtml(gift.title)}
        </h2>

        <p class="section-sub">
            ${escapeHtml(gift.description || "A gift looking for a new home.")}
        </p>

        <div class="notice">
            ${escapeHtml(gift.condition || "Condition to be confirmed")}
            · ${escapeHtml(gift.category)}
            · ${escapeHtml(gift.pincode || "Pune")}
        </div>

        <p><b>${Number(gift.points) || 0} Gifter Points (indicative value)</b></p>

        <p class="hint">Listed by ${escapeHtml(gift.owner || "GIFTERA member")}</p>

        <div class="notice">
            Exchange requests are not enabled yet. GIFTERA is currently testing gift listings.
        </div>
    `;

    document.getElementById("giftModal").classList.add("show");
}

function closeModal() {
    document.getElementById("giftModal").classList.remove("show");
}

// ============================================
// EXCHANGE REQUESTS - DEMO ONLY
// ============================================

function requestGift() {
    toast("Exchange requests will be enabled after secure transaction setup.");
}

// ============================================
// SUBMIT GIFT TO SUPABASE
// ============================================

const giftForm = document.getElementById("giftForm");

if (giftForm) {
    giftForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!currentUser) {
            toast("Please sign in before listing a gift.");
            showPage("upload");
            return;
        }

        const form = new FormData(giftForm);

        const title = String(form.get("title") || "").trim();
        const description = String(form.get("description") || "").trim();
        const category = String(form.get("category") || "");
        const condition = String(form.get("condition") || "");
        const photo = String(form.get("photo") || "").trim();

        if (!title || !description || !category || !condition) {
            toast("Please complete all required fields.");
            return;
        }

        const points = Number(form.get("points")) || 0;

        const giftData = {
            user_id: currentUser.id,
            title,
            description,
            category,
            condition,
            estimated_value: points,
            exchange_type: "direct",
            image_path: photo || null,
            city: "Pune",
            status: "pending"
        };

        const submitButton = giftForm.querySelector(
            'button[type="submit"]'
        );

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        try {
            const { error } = await db
                .from("gifts")
                .insert(giftData);

            if (error) throw error;

            giftForm.reset();

            toast("Gift submitted successfully! It is awaiting review.");

            await renderDashboard();
            showPage("dashboard");

        } catch (error) {
            console.error("Gift submission error:", error);
            toast("Gift submission failed: " + error.message);

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Submit gift for review →";
        }
    });
}

// ============================================
// USER DASHBOARD
// ============================================

async function renderDashboard() {
    const listings = document.getElementById("myListings");
    const requestsContainer = document.getElementById("myRequests");

    if (!currentUser) {
        document.getElementById("statGifts").textContent = "0";
        document.getElementById("statRequests").textContent = "0";

        if (listings) {
            listings.innerHTML =
                '<p class="section-sub">Please sign in to view your listings.</p>';
        }

        if (requestsContainer) {
            requestsContainer.innerHTML =
                '<p class="section-sub">No exchange requests yet.</p>';
        }

        updateAuthDisplay();
        return;
    }

    const { data, error } = await db
        .from("gifts")
        .select("*")
        .eq("user_id", currentUser.id);

    if (error) {
        console.error("Dashboard error:", error);

        if (listings) {
            listings.innerHTML =
                '<p class="section-sub">Unable to load your listings. Please try again.</p>';
        }
        return;
    }

    const mine = data || [];

    document.getElementById("statGifts").textContent = mine.length;
    document.getElementById("statRequests").textContent = "0";

    if (listings) {
        listings.innerHTML = mine.length
            ? mine.map(g => `
                <div class="list-row">
                    <span>🎁 ${escapeHtml(g.title)}</span>
                    <span class="hint">${escapeHtml(g.status)}</span>
                </div>
            `).join("")
            : '<p class="section-sub">You have not listed a gift yet.</p>';
    }

    if (requestsContainer) {
        requestsContainer.innerHTML =
            '<p class="section-sub">Exchange requests will be available in a future update.</p>';
    }

    updateAuthDisplay();
}

// ============================================
// SECURITY AND HTML HELPERS
// ============================================

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function toast(message) {
    const element = document.getElementById("toast");
    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        element.classList.remove("show");
    }, 3000);
}

// ============================================
// SCROLL AND ANIMATION EFFECTS
// ============================================

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

function observeMotion(root = document) {
    root.querySelectorAll(
        ".step,.gift-card,.section-head,.cta,.form-card,.panel"
    ).forEach((element, index) => {
        if (!element.classList.contains("reveal")) {
            element.classList.add("reveal");
        }

        element.style.transitionDelay =
            `${Math.min(index % 4, 3) * 70}ms`;

        revealObserver.observe(element);
    });

    root.querySelectorAll(".gift-card").forEach(card => {
        if (card.dataset.tiltReady) return;

        card.dataset.tiltReady = "1";

        card.addEventListener("pointermove", event => {
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
                window.innerWidth < 800
            ) return;

            const rect = card.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            card.style.transform =
                `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-5px)`;
        });

        card.addEventListener("pointerleave", () => {
            card.style.transform = "";
        });
    });
}

function updateScrollProgress() {
    const documentElement = document.documentElement;
    const max = documentElement.scrollHeight - window.innerHeight;
    const progress = document.getElementById("scrollProgress");

    if (progress) {
        progress.style.width =
            (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    }
}

window.addEventListener("scroll", updateScrollProgress, {
    passive: true
});

// ============================================
// START GIFTERA
// ============================================

async function initializeGiftera() {
    createPasswordRecoveryUI();

    try {
        const { data, error } = await db.auth.getSession();

        if (error) throw error;

        currentUser = data.session?.user || null;

        updateAuthDisplay();
        await loadGifts();

        if (currentUser) {
            await renderDashboard();
        }

        // Handle a recovery link that has returned to the live website.
        if (
            window.location.hash.includes("type=recovery") ||
            new URLSearchParams(window.location.search).get("type") === "recovery"
        ) {
            showPasswordRecoveryForm();
        }

    } catch (error) {
        console.error("GIFTERA initialization error:", error);
        toast("Unable to connect to GIFTERA. Please refresh.");
    }
}

// ============================================
// SUPABASE AUTH STATE LISTENER
// ============================================

db.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;

    if (event === "PASSWORD_RECOVERY") {
        showPasswordRecoveryForm();
        updateAuthDisplay();
        return;
    }

    updateAuthDisplay();

    if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setTimeout(async () => {
            await loadGifts();

            if (
                document.getElementById("dashboard")?.classList.contains("active")
            ) {
                await renderDashboard();
            }
        }, 0);
    }
});

// ============================================
// OBSERVERS
// ============================================

const motionMutation = new MutationObserver(() => {
    observeMotion();
});

["home", "market"].forEach(id => {
    const element = document.getElementById(id);

    if (element) {
        motionMutation.observe(element, {
            childList: true,
            subtree: true
        });
    }
});

// ============================================
// INITIAL PAGE SETUP
// ============================================

createPasswordRecoveryUI();
observeMotion();
updateScrollProgress();
initializeGiftera();
