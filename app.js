"use strict";

const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const STORAGE_KEY = "meal-organizer-pwa-v2";
const SYNC_QUEUE_KEY = "meal-organizer-sync-pending";
const CONFIG = window.APP_CONFIG ?? {};
const SUPABASE_READY = Boolean(CONFIG.supabaseUrl && CONFIG.supabasePublishableKey);
const supabaseClient = SUPABASE_READY
  ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabasePublishableKey)
  : null;

function food(quantity, name, category, alternatives = []) {
  return { quantity, name, category, alternatives };
}

const PLANS = {
  simple: {
    label: "Petit déjeuner simple",
    meals: [
      {
        id: "breakfast",
        title: "Petit déjeuner",
        icon: "☀️",
        foods: [
          food("125 g", "Yaourt nature", "Produits frais", ["90 g de fromage blanc nature 3 % MG"]),
          food("5 g", "Miel", "Épicerie", ["5 g de sucre", "5 g de sirop d’agave"]),
          food("150 g", "Fruit cru", "Fruits et légumes")
        ]
      },
      {
        id: "lunch",
        title: "Déjeuner",
        icon: "🥗",
        foods: [
          food("150 g", "Viande cuite", "Viandes et poissons", ["190 g de poisson", "75 g de céréales-légumineuses crues", "205 g d’œufs durs"]),
          food("90 g", "Pâtes complètes sèches", "Féculents", ["340 g de pommes de terre cuites", "90 g de riz complet cru"]),
          food("150 g", "Légumes", "Fruits et légumes"),
          food("20 g", "Huile d’olive", "Épicerie"),
          food("40 g", "Fromage", "Produits frais"),
          food("80 g", "Pain de mie complet", "Boulangerie"),
          food("125 g", "Yaourt nature", "Produits frais"),
          food("5 g", "Miel", "Épicerie"),
          food("150 g", "Fruit", "Fruits et légumes")
        ]
      },
      {
        id: "snack",
        title: "Collation",
        icon: "🍎",
        foods: [
          food("100 g", "Fruit cru", "Fruits et légumes", ["105 g de compote sans sucres ajoutés"]),
          food("80 g", "Pain complet", "Boulangerie"),
          food("10 g", "Beurre doux", "Produits frais", ["10 g de beurre de cacahuète"]),
          food("20 g", "Miel", "Épicerie", ["25 g de confiture"])
        ]
      },
      {
        id: "dinner",
        title: "Dîner",
        icon: "🌙",
        foods: [
          food("120 g", "Viande cuite", "Viandes et poissons", ["165 g d’œufs durs", "150 g de poisson", "60 g de céréales-légumineuses crues"]),
          food("80 g", "Pâtes complètes sèches", "Féculents", ["305 g de pommes de terre cuites", "80 g de riz complet cru"]),
          food("150 g", "Légumes", "Fruits et légumes"),
          food("20 g", "Huile d’olive", "Épicerie"),
          food("40 g", "Fromage", "Produits frais"),
          food("150 g", "Fruit", "Fruits et légumes"),
          food("80 g", "Pain de mie complet", "Boulangerie")
        ]
      },
      {
        id: "extras",
        title: "Dans la journée",
        icon: "✨",
        foods: [
          food("30 g", "Chocolat noir 70 %", "Épicerie"),
          food("30 g", "Noix", "Épicerie", ["20 g d’amandes", "20 g de noisettes", "20 g de noix de cajou"])
        ]
      }
    ]
  },
  complete: {
    label: "Petit déjeuner complet",
    meals: [
      {
        id: "breakfast",
        title: "Petit déjeuner",
        icon: "☀️",
        foods: [
          food("200 g", "Lait demi-écrémé", "Produits frais"),
          food("125 g", "Yaourt nature", "Produits frais", ["90 g de fromage blanc nature 3 % MG"]),
          food("5 g", "Miel", "Épicerie", ["5 g de sucre", "5 g de sirop d’agave"]),
          food("80 g", "Pain complet", "Boulangerie", ["60 g de flocons d’avoine", "55 g de muesli"]),
          food("10 g", "Beurre doux", "Produits frais"),
          food("20 g", "Confiture", "Épicerie")
        ]
      },
      {
        id: "snack-am",
        title: "Collation du matin",
        icon: "🍏",
        foods: [
          food("100 g", "Fruit cru", "Fruits et légumes", ["105 g de compote sans sucres ajoutés"]),
          food("40 g", "Pain de mie complet", "Boulangerie", ["65 g de barre céréalière protéinée"]),
          food("10 g", "Beurre doux", "Produits frais", ["10 g de beurre de cacahuète"]),
          food("10 g", "Miel", "Épicerie", ["15 g de confiture"])
        ]
      },
      {
        id: "lunch",
        title: "Déjeuner",
        icon: "🥗",
        foods: [
          food("150 g", "Viande cuite", "Viandes et poissons", ["190 g de poisson", "75 g de céréales-légumineuses crues", "205 g d’œufs durs"]),
          food("80 g", "Pâtes complètes sèches", "Féculents", ["305 g de pommes de terre cuites", "80 g de riz complet cru"]),
          food("150 g", "Légumes", "Fruits et légumes"),
          food("20 g", "Huile d’olive", "Épicerie"),
          food("30 g", "Fromage", "Produits frais"),
          food("40 g", "Pain de mie complet", "Boulangerie"),
          food("125 g", "Yaourt nature", "Produits frais"),
          food("5 g", "Miel", "Épicerie"),
          food("150 g", "Fruit", "Fruits et légumes")
        ]
      },
      {
        id: "snack-pm",
        title: "Collation de l’après-midi",
        icon: "🥪",
        foods: [
          food("100 g", "Fruit cru", "Fruits et légumes", ["105 g de compote sans sucres ajoutés"]),
          food("80 g", "Pain complet", "Boulangerie"),
          food("10 g", "Beurre doux", "Produits frais", ["10 g de beurre de cacahuète"]),
          food("20 g", "Miel", "Épicerie", ["25 g de confiture"])
        ]
      },
      {
        id: "dinner",
        title: "Dîner",
        icon: "🌙",
        foods: [
          food("120 g", "Viande cuite", "Viandes et poissons", ["165 g d’œufs durs", "150 g de poisson", "60 g de céréales-légumineuses crues"]),
          food("70 g", "Pâtes complètes sèches", "Féculents", ["265 g de pommes de terre cuites", "70 g de riz complet cru"]),
          food("150 g", "Légumes", "Fruits et légumes"),
          food("20 g", "Huile d’olive", "Épicerie"),
          food("30 g", "Fromage", "Produits frais"),
          food("150 g", "Fruit", "Fruits et légumes"),
          food("40 g", "Pain de mie complet", "Boulangerie")
        ]
      },
      {
        id: "extras",
        title: "Dans la journée",
        icon: "✨",
        foods: [
          food("30 g", "Chocolat noir 70 %", "Épicerie"),
          food("30 g", "Noix", "Épicerie", ["20 g d’amandes", "20 g de noisettes", "20 g de noix de cajou"])
        ]
      }
    ]
  }
};

const RECIPES = [
  {
    id: "bowl",
    emoji: "🥣",
    tag: "Petit déjeuner",
    title: "Bowl yaourt, fruit et miel",
    description: "Une préparation fraîche prête en cinq minutes.",
    ingredients: ["125 g de yaourt nature", "150 g de fruit", "5 g de miel"],
    steps: ["Couper le fruit.", "Verser le yaourt dans un bol.", "Ajouter le fruit puis le miel."]
  },
  {
    id: "oats",
    emoji: "🌾",
    tag: "Petit déjeuner complet",
    title: "Overnight oats",
    description: "Préparé la veille pour gagner du temps le matin.",
    ingredients: ["60 g de flocons d’avoine", "200 g de lait", "125 g de yaourt", "5 g de miel"],
    steps: ["Mélanger les ingrédients dans un bocal.", "Fermer et réserver au frais toute la nuit.", "Remuer avant de manger."]
  },
  {
    id: "chicken-pasta",
    emoji: "🍝",
    tag: "Déjeuner",
    title: "Poulet et pâtes complètes",
    description: "Un plat simple avec légumes et huile d’olive.",
    ingredients: ["Pâtes selon le plan", "150 g de poulet cuit", "150 g de légumes", "20 g d’huile d’olive"],
    steps: ["Cuire les pâtes.", "Cuire les légumes.", "Ajouter le poulet.", "Assembler avec l’huile hors du feu."]
  },
  {
    id: "fish-rice",
    emoji: "🍚",
    tag: "Dîner",
    title: "Poisson, riz et légumes",
    description: "Une assiette complète et facile à préparer.",
    ingredients: ["150 g de poisson", "Riz selon le plan", "150 g de légumes", "20 g d’huile d’olive"],
    steps: ["Cuire le riz.", "Cuire le poisson.", "Cuire les légumes.", "Assembler et assaisonner."]
  },
  {
    id: "toast",
    emoji: "🍞",
    tag: "Collation",
    title: "Tartines fruitées",
    description: "Une collation rapide à emporter.",
    ingredients: ["Pain selon le plan", "Beurre ou beurre de cacahuète", "Miel ou confiture", "Fruit ou compote"],
    steps: ["Faire griller le pain.", "Ajouter la matière grasse choisie.", "Ajouter le miel ou la confiture.", "Servir avec le fruit."]
  },
  {
    id: "potato-eggs",
    emoji: "🥔",
    tag: "Alternative",
    title: "Pommes de terre et œufs",
    description: "Une alternative pratique à la viande.",
    ingredients: ["Pommes de terre selon le plan", "Œufs selon le plan", "150 g de légumes", "20 g d’huile d’olive"],
    steps: ["Cuire les pommes de terre.", "Cuire les œufs durs.", "Préparer les légumes.", "Assembler avec l’huile."]
  }
];

function cleanCatalogName(value) {
  return value
    .replace(/^\s*\d+(?:[.,]\d+)?\s*(?:g|kg|ml|cl|l)\s+(?:de |d’|d')?/i, "")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function buildPantryCatalog() {
  const catalog = new Map();

  Object.values(PLANS).forEach((plan) => {
    plan.meals.forEach((meal) => {
      meal.foods.forEach((entry) => {
        const names = [entry.name, ...entry.alternatives.map(cleanCatalogName)];

        names.forEach((name) => {
          const cleanName = cleanCatalogName(name);
          const key = normalize(cleanName);

          if (!cleanName || catalog.has(key)) return;

          catalog.set(key, {
            id: `catalog-${key.replaceAll(" ", "-")}`,
            name: cleanName,
            category: entry.category,
            available: false,
            catalog: true
          });
        });
      });
    });
  });

  return [...catalog.values()].sort(
    (left, right) =>
      left.category.localeCompare(right.category, "fr") ||
      left.name.localeCompare(right.name, "fr")
  );
}

function ensurePantryCatalog(sourceState) {
  const nextState = sourceState ?? createInitialState();
  const existingPantry = Array.isArray(nextState.pantry) ? nextState.pantry : [];
  const existingByName = new Map(existingPantry.map((item) => [normalize(item.name), item]));

  buildPantryCatalog().forEach((catalogItem) => {
    const existing = existingByName.get(normalize(catalogItem.name));

    if (existing) {
      existing.category ??= catalogItem.category;
      existing.catalog ??= true;
      return;
    }

    existingPantry.push(catalogItem);
  });

  nextState.pantry = existingPantry;
  nextState.version = 3;
  return nextState;
}

function createInitialState() {
  return {
    version: 3,
    weekStart: toIsoDate(startOfWeek(new Date())),
    days: Object.fromEntries(DAY_KEYS.map((key) => [key, { plan: "complete", completed: [] }])),
    pantry: buildPantryCatalog(),
    shopping: [],
    settings: {
      assumeEmptyPantry: true,
      includeCompletedDays: true
    },
    updatedAt: new Date().toISOString()
  };
}

let state = loadLocalState();
let currentUser = null;
let syncTimer = null;
let deferredInstallPrompt = null;

function loadLocalState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return parsed ? ensurePantryCatalog(parsed) : createInitialState();
  } catch {
    return createInitialState();
  }
}

function saveLocalState({ queueSync = true } = {}) {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (queueSync) {
    localStorage.setItem(SYNC_QUEUE_KEY, "1");
    scheduleSync();
  }
}

function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() - day + 1);
  return result;
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function dateFromIso(value) {
  return new Date(`${value}T12:00:00`);
}

function getDayInfo(index) {
  const date = addDays(dateFromIso(state.weekStart), index);
  return {
    key: DAY_KEYS[index],
    date,
    label: new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(date),
    shortDate: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date),
    isToday: toIsoDate(date) === toIsoDate(new Date())
  };
}

function getTodayIndex() {
  const today = toIsoDate(new Date());
  const index = DAY_KEYS.findIndex((_, dayIndex) => toIsoDate(addDays(dateFromIso(state.weekStart), dayIndex)) === today);
  return index >= 0 ? index : 0;
}

function normalize(value) {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createId() {
  return crypto.randomUUID();
}

function showRoute(routeName) {
  document.querySelectorAll(".route").forEach((route) => {
    route.classList.toggle("active", route.id === `route-${routeName}`);
  });
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.classList.toggle("active", button.dataset.route === routeName);
  });
  if (location.hash !== `#${routeName}`) history.replaceState(null, "", `#${routeName}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderApp() {
  renderToday();
  renderWeek();
  renderShopping();
  renderPantry();
  renderRecipes();
  renderSyncStatus();
}

function renderToday() {
  const index = getTodayIndex();
  const info = getDayInfo(index);
  const dayState = state.days[info.key];
  const plan = PLANS[dayState.plan];
  const completedCount = dayState.completed.length;
  const percent = Math.round((completedCount / plan.meals.length) * 100);

  document.querySelector("#route-today").innerHTML = `
    <section class="hero">
      <article class="hero-main">
        <span class="eyebrow">${escapeHtml(info.label)} ${escapeHtml(info.shortDate)}</span>
        <h1>Ton plan,<br>sans charge mentale.</h1>
        <p class="hero-copy">
          Consulte les repas du jour, coche ce qui est fait et indique immédiatement
          les produits manquants à la maison.
        </p>
      </article>
      <aside class="hero-side">
        <div>
          <small>Progression du jour</small>
          <div class="big-number">${completedCount}<small> / ${plan.meals.length}</small></div>
          <div class="progress"><span style="width:${percent}%"></span></div>
        </div>
        <p>${percent === 100 ? "Journée terminée. Beau travail." : `${percent} % du programme réalisé.`}</p>
      </aside>
    </section>

    <div class="section-heading">
      <div>
        <h2>Programme d’aujourd’hui</h2>
        <p>Le choix modifie automatiquement les quantités de la semaine.</p>
      </div>
      ${renderPlanChoice(info.key, dayState.plan)}
    </div>

    <div class="meal-list">
      ${plan.meals.map((meal) => renderMealCard(info.key, meal, dayState.completed.includes(meal.id))).join("")}
    </div>

    <div class="notice">
      Le plan prévoit un repas plaisir par semaine. Les recettes proposées sont des idées
      d’organisation ; les consignes de ton diététicien restent prioritaires.
    </div>
  `;

  bindPlanChoice(document.querySelector("#route-today"));
  bindMealActions(document.querySelector("#route-today"));
}

function renderPlanChoice(dayKey, selected) {
  return `
    <div class="plan-choice" data-day="${dayKey}">
      <button class="${selected === "simple" ? "active" : ""}" data-plan="simple">Simple</button>
      <button class="${selected === "complete" ? "active" : ""}" data-plan="complete">Complet</button>
    </div>
  `;
}

function renderMealCard(dayKey, meal, completed) {
  return `
    <article class="meal-card">
      <div class="meal-heading">
        <div class="meal-name">
          <span>${meal.icon}</span>
          <div>
            <h3>${escapeHtml(meal.title)}</h3>
            <small>${meal.foods.length} éléments</small>
          </div>
        </div>
        <button class="done-button ${completed ? "done" : ""}" data-complete-meal="${meal.id}" data-day="${dayKey}">
          ${completed ? "✓ Fait" : "Marquer fait"}
        </button>
      </div>
      <div class="food-list">
        ${meal.foods.map((entry) => `
          <div class="food-row">
            <span class="quantity">${escapeHtml(entry.quantity)}</span>
            <span class="food-title">
              ${escapeHtml(entry.name)}
              ${entry.alternatives.length ? `<small class="food-alternatives">ou ${entry.alternatives.map(escapeHtml).join(" · ou ")}</small>` : ""}
            </span>
            <button class="mini-button" data-missing-food="${escapeHtml(entry.name)}" data-category="${escapeHtml(entry.category)}">
              Je n’en ai plus
            </button>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function bindPlanChoice(scope) {
  scope.querySelectorAll(".plan-choice button").forEach((button) => {
    button.addEventListener("click", () => {
      const dayKey = button.closest(".plan-choice").dataset.day;
      state.days[dayKey].plan = button.dataset.plan;
      state.days[dayKey].completed = [];
      saveLocalState();
      renderApp();
    });
  });
}

function bindMealActions(scope) {
  scope.querySelectorAll("[data-complete-meal]").forEach((button) => {
    button.addEventListener("click", () => {
      const day = state.days[button.dataset.day];
      const mealId = button.dataset.completeMeal;
      day.completed = day.completed.includes(mealId)
        ? day.completed.filter((id) => id !== mealId)
        : [...day.completed, mealId];
      saveLocalState();
      renderApp();
    });
  });

  scope.querySelectorAll("[data-missing-food]").forEach((button) => {
    button.addEventListener("click", () => {
      setPantryItem(button.dataset.missingFood, false);
      addShoppingItem(button.dataset.missingFood, button.dataset.category, "Produit manquant");
      saveLocalState();
      renderApp();
      showRoute("shopping");
    });
  });
}

function renderWeek() {
  const weekStart = dateFromIso(state.weekStart);
  const weekEnd = addDays(weekStart, 6);

  document.querySelector("#route-week").innerHTML = `
    <div class="section-heading">
      <div>
        <span class="eyebrow">Planning sur sept jours</span>
        <h1>Ma semaine</h1>
        <p>Du ${formatDate(weekStart)} au ${formatDate(weekEnd)}.</p>
      </div>
      <div class="button-row">
        <button class="button ghost" id="previousWeek">← Semaine précédente</button>
        <button class="button secondary" id="currentWeek">Cette semaine</button>
        <button class="button ghost" id="nextWeek">Semaine suivante →</button>
      </div>
    </div>

    <div class="week-grid">
      ${DAY_KEYS.map((dayKey, index) => {
        const info = getDayInfo(index);
        const day = state.days[dayKey];
        const plan = PLANS[day.plan];
        return `
          <article class="day-card ${info.isToday ? "today" : ""}">
            <h3>${escapeHtml(info.label)}</h3>
            <span class="day-date">${escapeHtml(info.shortDate)}</span>
            ${renderPlanChoice(dayKey, day.plan)}
            <div class="day-meals">
              ${plan.meals.map((meal) => `
                <div class="day-meal ${day.completed.includes(meal.id) ? "completed" : ""}">
                  <span>${meal.icon} ${escapeHtml(meal.title)}</span>
                  <span>${day.completed.includes(meal.id) ? "✓" : ""}</span>
                </div>
              `).join("")}
            </div>
          </article>
        `;
      }).join("")}
    </div>

    <div class="panel">
      <h2>Préparer la semaine</h2>
      <p>La liste est calculée avec les sept journées ci-dessus et les produits déjà présents à la maison.</p>
      <div class="button-row">
        <button class="button primary" id="generateShopping">Générer la liste de courses</button>
        <button class="button ghost" id="resetWeekProgress">Réinitialiser les repas cochés</button>
      </div>
    </div>
  `;

  bindPlanChoice(document.querySelector("#route-week"));
  document.querySelector("#previousWeek").addEventListener("click", () => shiftWeek(-7));
  document.querySelector("#nextWeek").addEventListener("click", () => shiftWeek(7));
  document.querySelector("#currentWeek").addEventListener("click", () => {
    state.weekStart = toIsoDate(startOfWeek(new Date()));
    saveLocalState();
    renderApp();
  });
  document.querySelector("#generateShopping").addEventListener("click", () => {
    generateWeeklyShopping();
    showRoute("shopping");
  });
  document.querySelector("#resetWeekProgress").addEventListener("click", () => {
    DAY_KEYS.forEach((dayKey) => { state.days[dayKey].completed = []; });
    saveLocalState();
    renderApp();
  });
}

function shiftWeek(days) {
  state.weekStart = toIsoDate(addDays(dateFromIso(state.weekStart), days));
  DAY_KEYS.forEach((dayKey) => { state.days[dayKey].completed = []; });
  saveLocalState();
  renderApp();
}

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(date);
}

function parseQuantity(quantity) {
  const match = quantity.replace(",", ".").match(/^(\d+(?:\.\d+)?)\s*(g|kg|ml|cl|l)?$/i);
  if (!match) return null;
  let value = Number(match[1]);
  const unit = (match[2] || "unité").toLowerCase();
  if (unit === "kg") return { value: value * 1000, unit: "g" };
  if (unit === "l") return { value: value * 1000, unit: "ml" };
  if (unit === "cl") return { value: value * 10, unit: "ml" };
  return { value, unit };
}

function generateWeeklyShopping() {
  const aggregated = new Map();

  DAY_KEYS.forEach((dayKey) => {
    const day = state.days[dayKey];
    const plan = PLANS[day.plan];

    plan.meals.forEach((meal) => {
      meal.foods.forEach((entry) => {
        const key = normalize(entry.name);
        const parsed = parseQuantity(entry.quantity);
        const current = aggregated.get(key) ?? {
          name: entry.name,
          category: entry.category,
          amounts: new Map()
        };
        const amountKey = parsed?.unit ?? entry.quantity;
        current.amounts.set(amountKey, (current.amounts.get(amountKey) ?? 0) + (parsed?.value ?? 1));
        aggregated.set(key, current);
      });
    });
  });

  const customItems = state.shopping.filter((item) => item.source === "Manuel");
  const generated = [];

  aggregated.forEach((entry) => {
    const pantryItem = findPantryItem(entry.name);
    if (pantryItem?.available) return;

    const quantity = [...entry.amounts.entries()]
      .map(([unit, value]) => unit === "unité" ? `${value} portion(s)` : `${Math.round(value)} ${unit}`)
      .join(" + ");

    generated.push({
      id: createId(),
      name: entry.name,
      quantity,
      category: entry.category,
      bought: false,
      source: "Semaine"
    });
  });

  state.shopping = [...customItems, ...generated];
  saveLocalState();
  renderApp();
}

function renderShopping() {
  const items = state.shopping;
  const bought = items.filter((item) => item.bought).length;
  const categories = [...new Set(items.map((item) => item.category))].sort((a, b) => a.localeCompare(b, "fr"));

  document.querySelector("#route-shopping").innerHTML = `
    <div class="section-heading">
      <div>
        <span class="eyebrow">Sept jours</span>
        <h1>Liste de courses</h1>
        <p>Quantités cumulées selon les plans choisis et les produits disponibles à la maison.</p>
      </div>
      <div class="button-row">
        <button class="button primary" id="regenerateShopping">Recalculer</button>
        <button class="button ghost" id="shareShopping">Partager</button>
      </div>
    </div>

    <div class="shopping-summary">
      <div class="summary-tile"><strong>${items.length}</strong><small>produits</small></div>
      <div class="summary-tile"><strong>${bought}</strong><small>achetés</small></div>
      <div class="summary-tile"><strong>${Math.max(items.length - bought, 0)}</strong><small>restants</small></div>
    </div>

    <div class="panel">
      <form class="input-row" id="shoppingForm">
        <input class="input" id="shoppingInput" placeholder="Ajouter un produit…" autocomplete="off">
        <button class="button secondary" type="submit">Ajouter</button>
      </form>

      <div class="list" id="shoppingList">
        ${items.length ? categories.map((category) => `
          <div class="category-heading">${escapeHtml(category)}</div>
          ${items.filter((item) => item.category === category).map((item) => `
            <div class="list-item ${item.bought ? "checked" : ""}">
              <input type="checkbox" data-shopping-check="${item.id}" ${item.bought ? "checked" : ""}>
              <span class="item-label">
                <strong>${escapeHtml(item.name)}</strong>
                <small>${escapeHtml(item.quantity || item.source)}</small>
              </span>
              <button class="mini-button" data-shopping-delete="${item.id}">×</button>
            </div>
          `).join("")}
        `).join("") : renderEmpty("Génère la liste depuis la page Semaine ou ajoute un produit manuellement.")}
      </div>

      <div class="button-row" style="margin-top:16px">
        <button class="button ghost" id="removeBought">Retirer les produits achetés</button>
        <button class="button danger" id="clearShopping">Vider la liste</button>
      </div>
    </div>
  `;

  document.querySelector("#regenerateShopping").addEventListener("click", generateWeeklyShopping);
  document.querySelector("#shoppingForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#shoppingInput");
    addShoppingItem(input.value, "Ajouts personnels", "Manuel");
    input.value = "";
    saveLocalState();
    renderApp();
  });

  document.querySelectorAll("[data-shopping-check]").forEach((input) => {
    input.addEventListener("change", () => {
      const item = state.shopping.find((entry) => entry.id === input.dataset.shoppingCheck);
      if (item) item.bought = input.checked;
      saveLocalState();
      renderApp();
    });
  });

  document.querySelectorAll("[data-shopping-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.shopping = state.shopping.filter((item) => item.id !== button.dataset.shoppingDelete);
      saveLocalState();
      renderApp();
    });
  });

  document.querySelector("#removeBought").addEventListener("click", () => {
    state.shopping = state.shopping.filter((item) => !item.bought);
    saveLocalState();
    renderApp();
  });

  document.querySelector("#clearShopping").addEventListener("click", () => {
    state.shopping = [];
    saveLocalState();
    renderApp();
  });

  document.querySelector("#shareShopping").addEventListener("click", shareShoppingList);
}

function addShoppingItem(name, category = "Autres", source = "Manuel") {
  const cleanName = name.trim();
  if (!cleanName) return;
  const existing = state.shopping.find((item) => normalize(item.name) === normalize(cleanName));
  if (existing) return;

  state.shopping.push({
    id: createId(),
    name: cleanName,
    quantity: "",
    category,
    bought: false,
    source
  });
}

async function shareShoppingList() {
  const text = state.shopping
    .filter((item) => !item.bought)
    .map((item) => `☐ ${item.name}${item.quantity ? ` — ${item.quantity}` : ""}`)
    .join("\n");

  if (!text) return;

  if (navigator.share) {
    await navigator.share({ title: "Liste de courses", text });
  } else {
    await navigator.clipboard.writeText(text);
    alert("Liste copiée dans le presse-papiers.");
  }
}

function renderPantry() {
  const available = state.pantry.filter((item) => item.available).length;

  document.querySelector("#route-pantry").innerHTML = `
    <div class="section-heading">
      <div>
        <span class="eyebrow">Garde-manger</span>
        <h1>Ce que j’ai à la maison</h1>
        <p>Tous les produits du plan sont déjà présents. Coche simplement ceux que tu as chez toi.</p>
      </div>
    </div>

    <div class="two-column">
      <article class="panel">
        <h2>Réglages</h2>
        <div class="toggle-row">
          <div>
            <strong>Je pars d’un garde-manger vide</strong>
            <small>Tout produit non coché sera ajouté aux courses.</small>
          </div>
          <label class="switch">
            <input id="emptyPantryToggle" type="checkbox" ${state.settings.assumeEmptyPantry ? "checked" : ""}>
            <span></span>
          </label>
        </div>
        <p>
          ${available} produit${available > 1 ? "s" : ""} actuellement disponible${available > 1 ? "s" : ""}.
          Lorsqu’un produit est décoché, il peut être ajouté automatiquement à la liste.
        </p>
        <div class="button-row">
          <button class="button secondary" id="markEverythingAvailable">Tout cocher</button>
          <button class="button danger" id="markEverythingMissing">Tout décocher</button>
          <button class="button ghost" id="reloadCatalog">Recharger les produits du plan</button>
        </div>
      </article>

      <article class="panel">
        <h2>Produits à la maison</h2>
        <form class="input-row" id="pantryForm">
          <input class="input" id="pantryInput" placeholder="Ex. huile d’olive…" autocomplete="off">
          <button class="button secondary" type="submit">Ajouter</button>
        </form>
        <div class="list">
          ${state.pantry.length ? state.pantry
            .slice()
            .sort((a, b) => Number(b.available) - Number(a.available) || a.name.localeCompare(b.name, "fr"))
            .map((item) => `
              <div class="list-item ${item.available ? "" : "checked"}">
                <input type="checkbox" data-pantry-check="${item.id}" ${item.available ? "checked" : ""}>
                <span class="item-label">
                  <strong>${escapeHtml(item.name)}</strong>
                  <small>${item.available ? "Disponible" : "Manquant"}${item.category ? ` · ${escapeHtml(item.category)}` : ""}</small>
                </span>
                <button class="mini-button" data-pantry-delete="${item.id}">×</button>
              </div>
            `).join("") : renderEmpty("Ajoute ton premier produit. Par défaut, rien n’est considéré comme disponible.")}
        </div>
      </article>
    </div>
  `;

  document.querySelector("#emptyPantryToggle").addEventListener("change", (event) => {
    state.settings.assumeEmptyPantry = event.target.checked;
    saveLocalState();
  });

  document.querySelector("#pantryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#pantryInput");
    setPantryItem(input.value, true);
    input.value = "";
    saveLocalState();
    renderApp();
  });

  document.querySelectorAll("[data-pantry-check]").forEach((input) => {
    input.addEventListener("change", () => {
      const item = state.pantry.find((entry) => entry.id === input.dataset.pantryCheck);
      if (!item) return;
      item.available = input.checked;
      if (!item.available) addShoppingItem(item.name, "Produits manquants", "Produit manquant");
      saveLocalState();
      renderApp();
    });
  });

  document.querySelectorAll("[data-pantry-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pantry = state.pantry.filter((item) => item.id !== button.dataset.pantryDelete);
      saveLocalState();
      renderApp();
    });
  });

  document.querySelector("#markEverythingAvailable").addEventListener("click", () => {
    state.pantry.forEach((item) => {
      item.available = true;
    });
    saveLocalState();
    renderApp();
  });

  document.querySelector("#markEverythingMissing").addEventListener("click", () => {
    state.pantry.forEach((item) => {
      item.available = false;
    });
    saveLocalState();
    renderApp();
  });

  document.querySelector("#reloadCatalog").addEventListener("click", () => {
    state = ensurePantryCatalog(state);
    saveLocalState();
    renderApp();
  });
}

function setPantryItem(name, available) {
  const cleanName = name.trim();
  if (!cleanName) return;

  const existing = findPantryItem(cleanName);
  if (existing) {
    existing.available = available;
    return;
  }

  state.pantry.push({
    id: createId(),
    name: cleanName,
    category: "Ajouts personnels",
    available,
    catalog: false
  });
}

function findPantryItem(name) {
  const target = normalize(name);
  return state.pantry.find((item) => {
    const candidate = normalize(item.name);
    return candidate === target || candidate.includes(target) || target.includes(candidate);
  });
}

function renderRecipes() {
  document.querySelector("#route-recipes").innerHTML = `
    <div class="section-heading">
      <div>
        <span class="eyebrow">Idées pratiques</span>
        <h1>Recettes</h1>
        <p>Des assemblages simples construits autour des portions du plan.</p>
      </div>
    </div>

    <div class="recipe-grid">
      ${RECIPES.map((recipe) => `
        <article class="recipe-card">
          <div class="recipe-image">${recipe.emoji}</div>
          <div class="recipe-body">
            <div class="recipe-meta">${escapeHtml(recipe.tag)} · facile</div>
            <h3>${escapeHtml(recipe.title)}</h3>
            <p>${escapeHtml(recipe.description)}</p>
            <div class="button-row">
              <button class="button primary" data-open-recipe="${recipe.id}">Voir</button>
              <button class="button secondary" data-add-recipe="${recipe.id}">Aux courses</button>
            </div>
          </div>
        </article>
      `).join("")}
    </div>
  `;

  document.querySelectorAll("[data-open-recipe]").forEach((button) => {
    button.addEventListener("click", () => openRecipe(button.dataset.openRecipe));
  });

  document.querySelectorAll("[data-add-recipe]").forEach((button) => {
    button.addEventListener("click", () => {
      const recipe = RECIPES.find((entry) => entry.id === button.dataset.addRecipe);
      recipe.ingredients.forEach((ingredient) => addShoppingItem(ingredient, "Recettes", "Manuel"));
      saveLocalState();
      renderApp();
      showRoute("shopping");
    });
  });
}

function openRecipe(recipeId) {
  const recipe = RECIPES.find((entry) => entry.id === recipeId);
  if (!recipe) return;

  document.querySelector("#recipeDialogTag").textContent = recipe.tag;
  document.querySelector("#recipeDialogTitle").textContent = recipe.title;
  document.querySelector("#recipeDialogDescription").textContent = recipe.description;
  document.querySelector("#recipeDialogContent").innerHTML = `
    <h3>Ingrédients</h3>
    <ul>${recipe.ingredients.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h3>Préparation</h3>
    <ol>${recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
  `;
  document.querySelector("#recipeDialog").showModal();
}

function renderEmpty(message) {
  return `
    <div class="empty-state">
      <span>✦</span>
      <h3>Rien ici pour le moment</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function renderSyncStatus(status) {
  const indicator = document.querySelector("#syncIndicator");
  indicator.className = "sync-indicator";

  if (!SUPABASE_READY) {
    indicator.textContent = "Mode local";
    return;
  }

  if (!currentUser) {
    indicator.textContent = "Non connecté";
    return;
  }

  if (status === "syncing") {
    indicator.textContent = "Synchronisation…";
    indicator.classList.add("pending");
    return;
  }

  if (localStorage.getItem(SYNC_QUEUE_KEY)) {
    indicator.textContent = "À synchroniser";
    indicator.classList.add("pending");
    return;
  }

  indicator.textContent = "Synchronisé";
  indicator.classList.add("synced");
}

function scheduleSync() {
  if (!currentUser || !navigator.onLine || !SUPABASE_READY) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushState, 700);
}

async function pushState() {
  if (!currentUser || !navigator.onLine || !SUPABASE_READY) return;

  renderSyncStatus("syncing");
  const { error } = await supabaseClient
    .from("user_app_state")
    .upsert({
      user_id: currentUser.id,
      state,
      updated_at: state.updatedAt
    }, { onConflict: "user_id" });

  if (error) {
    console.error("Erreur de synchronisation :", error);
    renderSyncStatus();
    return;
  }

  localStorage.removeItem(SYNC_QUEUE_KEY);
  renderSyncStatus();
}

async function pullState() {
  if (!currentUser || !SUPABASE_READY) return;

  renderSyncStatus("syncing");
  const { data, error } = await supabaseClient
    .from("user_app_state")
    .select("state, updated_at")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.error("Erreur de récupération :", error);
    renderSyncStatus();
    return;
  }

  if (!data) {
    await pushState();
    return;
  }

  const remoteTime = new Date(data.updated_at || data.state?.updatedAt || 0).getTime();
  const localTime = new Date(state.updatedAt || 0).getTime();

  if (remoteTime > localTime || !localStorage.getItem(SYNC_QUEUE_KEY)) {
    state = ensurePantryCatalog(data.state);
    saveLocalState({ queueSync: false });
    localStorage.removeItem(SYNC_QUEUE_KEY);
  } else {
    await pushState();
  }

  renderApp();
}

async function initializeAuth() {
  if (!SUPABASE_READY) {
    renderAccount();
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  currentUser = data.session?.user ?? null;
  renderAccount();

  if (currentUser) await pullState();

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user ?? null;
    renderAccount();
    renderSyncStatus();
    if (currentUser) await pullState();
  });
}

function renderAccount() {
  const signedOut = document.querySelector("#signedOutPanel");
  const signedIn = document.querySelector("#signedInPanel");
  const accountButton = document.querySelector("#accountButton");

  signedOut.hidden = Boolean(currentUser);
  signedIn.hidden = !currentUser;

  if (currentUser) {
    document.querySelector("#accountEmail").textContent = currentUser.email;
    accountButton.textContent = currentUser.email?.slice(0, 1).toUpperCase() ?? "✓";
  } else {
    accountButton.textContent = "A";
  }

  if (!SUPABASE_READY) {
    document.querySelector("#authDescription").textContent =
      "La synchronisation n’est pas encore configurée. Suis le README puis complète config.js.";
    document.querySelector("#signInButton").disabled = true;
    document.querySelector("#signUpButton").disabled = true;
  }
}

async function signIn() {
  const email = document.querySelector("#authEmail").value.trim();
  const password = document.querySelector("#authPassword").value;
  setAuthMessage("");

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) setAuthMessage(error.message);
  else document.querySelector("#accountDialog").close();
}

async function signUp() {
  const email = document.querySelector("#authEmail").value.trim();
  const password = document.querySelector("#authPassword").value;
  setAuthMessage("");

  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) {
    setAuthMessage(error.message);
    return;
  }

  setAuthMessage("Compte créé. Vérifie ton e-mail si la confirmation est activée.", true);
}

function setAuthMessage(message, success = false) {
  const element = document.querySelector("#authMessage");
  element.textContent = message;
  element.style.color = success ? "var(--green)" : "var(--danger)";
}

async function signOut() {
  await supabaseClient.auth.signOut();
  document.querySelector("#accountDialog").close();
}

function bindGlobalEvents() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => showRoute(button.dataset.route));
  });

  document.querySelector("#accountButton").addEventListener("click", () => {
    document.querySelector("#accountDialog").showModal();
  });

  document.querySelector("#signInButton").addEventListener("click", signIn);
  document.querySelector("#signUpButton").addEventListener("click", signUp);
  document.querySelector("#signOutButton").addEventListener("click", signOut);
  document.querySelector("#syncNowButton").addEventListener("click", pushState);
  document.querySelector("#closeRecipeButton").addEventListener("click", () => {
    document.querySelector("#recipeDialog").close();
  });

  window.addEventListener("online", () => {
    document.querySelector("#offlineBanner").hidden = true;
    scheduleSync();
  });

  window.addEventListener("offline", () => {
    document.querySelector("#offlineBanner").hidden = false;
    renderSyncStatus();
  });

  window.addEventListener("hashchange", () => {
    const route = location.hash.slice(1);
    if (["today", "week", "shopping", "pantry", "recipes"].includes(route)) showRoute(route);
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    document.querySelector("#installButton").hidden = false;
  });

  document.querySelector("#installButton").addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    document.querySelector("#installButton").hidden = true;
  });
}

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
    } catch (error) {
      console.error("Service worker non enregistré :", error);
    }
  }
}

async function initialize() {
  bindGlobalEvents();
  renderApp();
  showRoute(location.hash.slice(1) || "today");
  document.querySelector("#offlineBanner").hidden = navigator.onLine;
  await registerServiceWorker();
  await initializeAuth();
}

initialize();
