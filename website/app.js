(function (root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (typeof window !== "undefined") {
    root.VilLayoutApp = api;
    window.addEventListener("DOMContentLoaded", api.init);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DEFAULT_LAYER_NAMES = ["Default", "Symbol", "Function"];

  const LAYER_DESCRIPTIONS = [
    {
      name: "默认层",
      summary:
        "默认层用于主要文字输入。字母采用左右手分布，拇指区放置 `LAlt`、`LGui`、`MO(1)`、`MO(2)`、`Space`、`RAlt` 等高频按键。",
      highlights: [
        "左右手主键区负责字母输入。",
        "`MO(1)` 进入符号层。",
        "`MO(2)` 进入功能层。",
        "层键按左右手分工放置，尽量让触发层的那只手获得对应侧的扩展能力。",
        "`Backspace`、`Space`、修饰键靠近拇指或边缘，便于快速触发。",
      ],
    },
    {
      name: "符号层",
      summary:
        "符号层主要用于标点、括号和编程符号输入。按住 `MO(1)` 即可进入此层，松开后返回默认层。",
      highlights: [
        "数字上排映射为常见符号，例如 `! @ # $ % ^ & * ( )`。",
        "括号、反斜杠、加减号、等号集中在左手区域。",
        "适合代码输入、Markdown、命令行和日常标点输入。",
      ],
    },
    {
      name: "功能层",
      summary:
        "功能层用于数字、方向键、Esc、Enter 和个人高频功能键。按住 `MO(2)` 即可进入此层。数字区的布局尽量沿用普通键盘的数字排逻辑，放在默认层 `QWER` 对应的那一列附近。这样从标准键盘迁移到 Corne 时，不需要重新建立一套完全陌生的数字位置记忆，输入数字时更容易靠原有肌肉记忆过渡。",
      highlights: [
        "数字键集中在上排，并贴近普通键盘数字排的相对位置。",
        "方向键放在右手主键区，便于编辑文本时快速移动光标。",
        "`F12` 是我的输入法切换键，`F8` 是我的 tmux prefix，因此放在功能层中快速触发。",
        "`Esc`、`Enter` 等编辑控制键也放在功能层，减少默认层负担。",
        "适合代码编辑、窗口操作和系统快捷键。",
      ],
    },
  ];

  const DEFAULT_VIL_DATA = {
    version: 1,
    uid: 15126841831861545787,
    layout: [
      [
        ["KC_TAB", "KC_Q", "KC_W", "KC_E", "KC_R", "KC_T"],
        ["KC_LCTRL", "KC_A", "KC_S", "KC_D", "KC_F", "KC_G"],
        ["KC_LSHIFT", "KC_Z", "KC_X", "KC_C", "KC_V", "KC_B"],
        [-1, -1, -1, "KC_LALT", "KC_LGUI", "MO(1)"],
        ["KC_BSPACE", "KC_P", "KC_O", "KC_I", "KC_U", "KC_Y"],
        ["KC_QUOTE", "KC_SCOLON", "KC_L", "KC_K", "KC_J", "KC_H"],
        ["KC_RSHIFT", "KC_SLASH", "KC_DOT", "KC_COMMA", "KC_M", "KC_N"],
        [-1, -1, -1, "KC_RALT", "KC_SPACE", "MO(2)"],
      ],
      [
        ["LSFT(KC_GRAVE)", "LSFT(KC_1)", "LSFT(KC_2)", "LSFT(KC_3)", "LSFT(KC_4)", "LSFT(KC_5)"],
        ["KC_LSHIFT", "LSFT(KC_BSLASH)", "KC_LBRACKET", "KC_EQUAL", "KC_MINUS", "KC_RBRACKET"],
        ["KC_TRNS", "KC_BSLASH", "LSFT(KC_LBRACKET)", "LSFT(KC_EQUAL)", "LSFT(KC_MINUS)", "LSFT(KC_RBRACKET)"],
        [-1, -1, -1, "KC_TRNS", "KC_TRNS", "KC_TRNS"],
        ["KC_TRNS", "LSFT(KC_0)", "LSFT(KC_9)", "LSFT(KC_8)", "LSFT(KC_7)", "LSFT(KC_6)"],
        ["KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS"],
        ["KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS"],
        [-1, -1, -1, "KC_LCTRL", "KC_LGUI", "KC_TRNS"],
      ],
      [
        ["KC_GRAVE", "KC_1", "KC_2", "KC_3", "KC_4", "KC_5"],
        ["KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS"],
        ["KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_TRNS"],
        [-1, -1, -1, "KC_TRNS", "KC_TRNS", "KC_TRNS"],
        ["KC_TRNS", "KC_0", "KC_9", "KC_8", "KC_7", "KC_6"],
        ["KC_ENTER", "KC_ESCAPE", "KC_RIGHT", "KC_UP", "KC_DOWN", "KC_LEFT"],
        ["KC_TRNS", "KC_TRNS", "KC_TRNS", "KC_F8", "KC_F12", "KC_TRNS"],
        [-1, -1, -1, "KC_TRNS", "KC_TRNS", "KC_TRNS"],
      ],
    ],
  };

  const BASIC_LABELS = {
    KC_NO: { primary: "No", kind: "disabled" },
    KC_TAB: { primary: "Tab" },
    KC_ENTER: { primary: "Enter" },
    KC_ENT: { primary: "Enter" },
    KC_ESCAPE: { primary: "Esc" },
    KC_ESC: { primary: "Esc" },
    KC_BSPACE: { primary: "Bksp" },
    KC_BSPC: { primary: "Bksp" },
    KC_DELETE: { primary: "Del" },
    KC_DEL: { primary: "Del" },
    KC_SPACE: { primary: "Space" },
    KC_SPC: { primary: "Space" },
    KC_LCTRL: { primary: "LCtrl", kind: "modifier" },
    KC_LCTL: { primary: "LCtrl", kind: "modifier" },
    KC_RCTRL: { primary: "RCtrl", kind: "modifier" },
    KC_RCTL: { primary: "RCtrl", kind: "modifier" },
    KC_LSHIFT: { primary: "LShift", kind: "modifier" },
    KC_LSFT: { primary: "LShift", kind: "modifier" },
    KC_RSHIFT: { primary: "RShift", kind: "modifier" },
    KC_RSFT: { primary: "RShift", kind: "modifier" },
    KC_LALT: { primary: "LAlt", kind: "modifier" },
    KC_RALT: { primary: "RAlt", kind: "modifier" },
    KC_LGUI: { primary: "LGui", kind: "modifier" },
    KC_RGUI: { primary: "RGui", kind: "modifier" },
    KC_LEFT: { primary: "Left", kind: "nav" },
    KC_RIGHT: { primary: "Right", kind: "nav" },
    KC_UP: { primary: "Up", kind: "nav" },
    KC_DOWN: { primary: "Down", kind: "nav" },
    KC_HOME: { primary: "Home", kind: "nav" },
    KC_END: { primary: "End", kind: "nav" },
    KC_PGUP: { primary: "PgUp", kind: "nav" },
    KC_PGDN: { primary: "PgDn", kind: "nav" },
    KC_INSERT: { primary: "Ins", kind: "nav" },
    KC_INS: { primary: "Ins", kind: "nav" },
    KC_GRAVE: { primary: "`", secondary: "~" },
    KC_GRV: { primary: "`", secondary: "~" },
    KC_QUOTE: { primary: "'", secondary: "\"" },
    KC_QUOT: { primary: "'", secondary: "\"" },
    KC_SCOLON: { primary: ";", secondary: ":" },
    KC_SCLN: { primary: ";", secondary: ":" },
    KC_SLASH: { primary: "/", secondary: "?" },
    KC_SLSH: { primary: "/", secondary: "?" },
    KC_DOT: { primary: ".", secondary: ">" },
    KC_COMMA: { primary: ",", secondary: "<" },
    KC_COMM: { primary: ",", secondary: "<" },
    KC_MINUS: { primary: "-", secondary: "_" },
    KC_MINS: { primary: "-", secondary: "_" },
    KC_EQUAL: { primary: "=", secondary: "+" },
    KC_EQL: { primary: "=", secondary: "+" },
    KC_LBRACKET: { primary: "[", secondary: "{" },
    KC_LBRC: { primary: "[", secondary: "{" },
    KC_RBRACKET: { primary: "]", secondary: "}" },
    KC_RBRC: { primary: "]", secondary: "}" },
    KC_BSLASH: { primary: "\\", secondary: "|" },
    KC_BSLS: { primary: "\\", secondary: "|" },
    QK_BOOT: { primary: "Boot", kind: "system" },
    RGB_TOG: { primary: "RGB", secondary: "Toggle", kind: "system" },
    RGB_MOD: { primary: "RGB+", kind: "system" },
    RGB_RMOD: { primary: "RGB-", kind: "system" },
    RGB_HUI: { primary: "Hue+", kind: "system" },
    RGB_HUD: { primary: "Hue-", kind: "system" },
    RGB_SAI: { primary: "Sat+", kind: "system" },
    RGB_SAD: { primary: "Sat-", kind: "system" },
    RGB_VAI: { primary: "Val+", kind: "system" },
    RGB_VAD: { primary: "Val-", kind: "system" },
    RGB_SPI: { primary: "Spd+", kind: "system" },
    RGB_SPD: { primary: "Spd-", kind: "system" },
    RGB_M_P: { primary: "RGB", secondary: "Plain", kind: "system" },
  };

  const SHIFTED_LABELS = {
    KC_GRAVE: "~",
    KC_GRV: "~",
    KC_1: "!",
    KC_2: "@",
    KC_3: "#",
    KC_4: "$",
    KC_5: "%",
    KC_6: "^",
    KC_7: "&",
    KC_8: "*",
    KC_9: "(",
    KC_0: ")",
    KC_MINUS: "_",
    KC_MINS: "_",
    KC_EQUAL: "+",
    KC_EQL: "+",
    KC_LBRACKET: "{",
    KC_LBRC: "{",
    KC_RBRACKET: "}",
    KC_RBRC: "}",
    KC_BSLASH: "|",
    KC_BSLS: "|",
    KC_SCOLON: ":",
    KC_SCLN: ":",
    KC_QUOTE: "\"",
    KC_QUOT: "\"",
    KC_COMMA: "<",
    KC_COMM: "<",
    KC_DOT: ">",
    KC_SLASH: "?",
    KC_SLSH: "?",
  };

  const MODIFIER_PREFIXES = {
    LCTL: "Ctrl",
    RCTL: "Ctrl",
    C: "Ctrl",
    LALT: "Alt",
    RALT: "Alt",
    A: "Alt",
    LGUI: "Gui",
    RGUI: "Gui",
    G: "Gui",
    LSFT: "Shift",
    RSFT: "Shift",
    S: "Shift",
  };

  function parseVilText(text) {
    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error("The selected file is not valid JSON.");
    }

    if (!data || typeof data !== "object" || !Array.isArray(data.layout)) {
      throw new Error("The selected file must contain a Vial layout array.");
    }

    if (!data.layout.every(Array.isArray)) {
      throw new Error("The selected file contains a layout array in an unsupported shape.");
    }

    return data;
  }

  function layerHasVisibleKey(layer) {
    return flatten(layer).some((keycode) => {
      const formatted = formatKeycode(keycode);
      return formatted.kind !== "empty" && formatted.kind !== "transparent";
    });
  }

  function flatten(value) {
    if (!Array.isArray(value)) {
      return [value];
    }

    return value.flatMap(flatten);
  }

  function getDisplayLayers(data) {
    const sourceLayers = data.layout.filter(Array.isArray).filter(layerHasVisibleKey);

    return sourceLayers.slice(0, 3).map((rows, index) => ({
      name: DEFAULT_LAYER_NAMES[index] || `Layer ${index + 1}`,
      index,
      rows,
    }));
  }

  function normalizeLayerIndex(index, length) {
    if (!length) {
      return 0;
    }

    const numericIndex = Number.isFinite(index) ? index : 0;
    return ((numericIndex % length) + length) % length;
  }

  function getCarouselCards(layers, activeIndex) {
    const count = layers.length;

    if (!count) {
      return [];
    }

    const active = normalizeLayerIndex(activeIndex, count);

    if (count === 1) {
      return [{ placement: "active", index: active, layer: layers[active] }];
    }

    const placements = [
      { placement: "left", offset: 1 },
      { placement: "active", offset: 0 },
      { placement: "right", offset: -1 },
    ];
    const used = new Set();

    return placements.flatMap(({ placement, offset }) => {
      const index = normalizeLayerIndex(active + offset, count);

      if (used.has(index)) {
        return [];
      }

      used.add(index);
      return [{ placement, index, layer: layers[index] }];
    });
  }

  function getNextLayerIndex(activeIndex, direction, length) {
    const offset = direction === "previous" ? -1 : 1;
    return normalizeLayerIndex(activeIndex + offset, length);
  }

  function getTransitionDirection(activeIndex, targetIndex, length) {
    if (!length) {
      return "none";
    }

    const active = normalizeLayerIndex(activeIndex, length);
    const target = normalizeLayerIndex(targetIndex, length);

    if (active === target) {
      return "none";
    }

    if (normalizeLayerIndex(active + 1, length) === target) {
      return "next";
    }

    return "previous";
  }

  function getLayerDescription(index) {
    const description = LAYER_DESCRIPTIONS[normalizeLayerIndex(index, LAYER_DESCRIPTIONS.length)];

    return {
      ...description,
      highlights: [...description.highlights],
    };
  }

  function formatKeycode(keycode) {
    if (keycode === -1 || keycode === null || typeof keycode === "undefined") {
      return {
        raw: String(keycode),
        primary: "",
        secondary: "",
        kind: "empty",
      };
    }

    if (typeof keycode === "number") {
      return {
        raw: String(keycode),
        primary: `0x${keycode.toString(16).toUpperCase().padStart(4, "0")}`,
        secondary: "",
        kind: "raw",
      };
    }

    const raw = String(keycode).trim();

    if (raw === "-1") {
      return {
        raw,
        primary: "",
        secondary: "",
        kind: "empty",
      };
    }

    if (raw === "KC_TRNS" || raw === "KC_TRANSPARENT") {
      return {
        raw,
        primary: "▽",
        secondary: "",
        kind: "transparent",
      };
    }

    const shifted = raw.match(/^(?:LSFT|RSFT|S)\((.+)\)$/);
    if (shifted) {
      const inner = shifted[1];
      const innerLabel = formatKeycode(inner);

      return {
        raw,
        primary: SHIFTED_LABELS[inner] || `Shift+${innerLabel.primary || inner}`,
        secondary: innerLabel.primary ? `Shift + ${innerLabel.primary}` : raw,
        kind: "shifted",
      };
    }

    const wrapped = raw.match(/^([A-Z]+)\((.+)\)$/);
    if (wrapped && MODIFIER_PREFIXES[wrapped[1]]) {
      const innerLabel = formatKeycode(wrapped[2]);

      return {
        raw,
        primary: `${MODIFIER_PREFIXES[wrapped[1]]}+${innerLabel.primary || wrapped[2]}`,
        secondary: "",
        kind: "chord",
      };
    }

    if (/^(?:MO|TO|TG|DF|TT|OSL)\(\d+\)$/.test(raw)) {
      return {
        raw,
        primary: raw,
        secondary: "",
        kind: "layer",
      };
    }

    const layerTap = raw.match(/^LT\((\d+),(.+)\)$/);
    if (layerTap) {
      const innerLabel = formatKeycode(layerTap[2]);

      return {
        raw,
        primary: `LT${layerTap[1]} ${innerLabel.primary || layerTap[2]}`,
        secondary: "",
        kind: "layer",
      };
    }

    const modTap = raw.match(/^(LCTL|RCTL|LALT|RALT|LGUI|RGUI|LSFT|RSFT)_T\((.+)\)$/);
    if (modTap) {
      const innerLabel = formatKeycode(modTap[2]);

      return {
        raw,
        primary: `${MODIFIER_PREFIXES[modTap[1]]} ${innerLabel.primary || modTap[2]}`,
        secondary: "",
        kind: "modifier",
      };
    }

    if (BASIC_LABELS[raw]) {
      return {
        raw,
        secondary: "",
        kind: "standard",
        ...BASIC_LABELS[raw],
      };
    }

    const alpha = raw.match(/^KC_([A-Z])$/);
    if (alpha) {
      return {
        raw,
        primary: alpha[1],
        secondary: "",
        kind: "alpha",
      };
    }

    const number = raw.match(/^KC_([0-9])$/);
    if (number) {
      return {
        raw,
        primary: number[1],
        secondary: "",
        kind: "number",
      };
    }

    const functionKey = raw.match(/^KC_F([0-9]{1,2})$/);
    if (functionKey) {
      return {
        raw,
        primary: `F${functionKey[1]}`,
        secondary: "",
        kind: "function",
      };
    }

    return {
      raw,
      primary: raw,
      secondary: "",
      kind: "unknown",
    };
  }

  function toKeyboardModel(rows) {
    const normalizedRows = rows.map((row) => (Array.isArray(row) ? row : [row]));
    const isCorneShape =
      normalizedRows.length === 8 &&
      normalizedRows.every((row) => row.length <= 6);

    if (isCorneShape) {
      return {
        type: "corne-split",
        left: normalizedRows.slice(0, 4).map(formatRow),
        right: normalizedRows.slice(4, 8).map((row) => formatRow([...row].reverse())),
      };
    }

    return {
      type: "generic-matrix",
      columns: Math.max(...normalizedRows.map((row) => row.length), 1),
      rows: normalizedRows.map(formatRow),
    };
  }

  function formatRow(row) {
    return row.map(formatKeycode);
  }

  async function init() {
    const app = {
      layers: document.querySelector("[data-layers]"),
      dots: document.querySelector("[data-dots]"),
      description: document.querySelector("[data-description]"),
      previous: document.querySelector("[data-action='previous']"),
      next: document.querySelector("[data-action='next']"),
      state: {
        activeIndex: 0,
        layers: [],
        motion: "none",
      },
    };

    if (!app.layers) {
      return;
    }

    bindCarousel(app);

    try {
      const response = await fetch("../layout.vil", { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Default layout request failed with ${response.status}.`);
      }

      renderLayout(app, parseVilText(await response.text()));
    } catch (error) {
      console.warn("Default layout could not be fetched; using embedded fallback.", error);
      renderLayout(app, DEFAULT_VIL_DATA);
    }
  }

  function bindCarousel(app) {
    if (app.previous) {
      app.previous.addEventListener("click", () => moveCarousel(app, "previous"));
    }

    if (app.next) {
      app.next.addEventListener("click", () => moveCarousel(app, "next"));
    }

    if (app.layers) {
      app.layers.addEventListener("click", (event) => {
        const card = event.target.closest("[data-layer-card]");

        if (!card || !app.layers.contains(card)) {
          return;
        }

        setActiveLayer(app, Number(card.dataset.layerIndex));
      });
    }

    if (app.dots) {
      app.dots.addEventListener("click", (event) => {
        const dot = event.target.closest("[data-carousel-index]");

        if (!dot || !app.dots.contains(dot)) {
          return;
        }

        setActiveLayer(app, Number(dot.dataset.carouselIndex));
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveCarousel(app, "previous");
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveCarousel(app, "next");
      }
    });
  }

  function renderLayout(app, data) {
    const layers = getDisplayLayers(data);

    if (!layers.length) {
      throw new Error("The layout does not contain displayable layers.");
    }

    app.state.layers = layers;
    app.state.activeIndex = 0;
    app.state.motion = "none";
    renderCarousel(app);
  }

  function moveCarousel(app, direction) {
    setActiveLayer(
      app,
      getNextLayerIndex(app.state.activeIndex, direction, app.state.layers.length),
    );
  }

  function setActiveLayer(app, index) {
    if (!app.state.layers.length) {
      return;
    }

    app.state.motion = getTransitionDirection(
      app.state.activeIndex,
      index,
      app.state.layers.length,
    );
    app.state.activeIndex = normalizeLayerIndex(index, app.state.layers.length);
    renderCarousel(app);
  }

  function renderCarousel(app) {
    const cards = getCarouselCards(app.state.layers, app.state.activeIndex);

    app.layers.dataset.motion = app.state.motion;
    app.layers.replaceChildren(...cards.map(renderLayerCard));
    renderDots(app);
    renderLayerDescription(app);
  }

  function renderLayerCard(card) {
    const button = document.createElement("button");
    const model = toKeyboardModel(card.layer.rows);
    const description = getLayerDescription(card.layer.index);
    const isActive = card.placement === "active";

    button.type = "button";
    button.className = `layer-card layer-card-${card.placement}`;
    button.dataset.layerCard = "";
    button.dataset.layerIndex = String(card.index);
    button.dataset.layerTheme = getLayerTheme(card.layer);
    button.setAttribute(
      "aria-label",
      isActive ? `${card.layer.name} Layer is selected` : `Show ${card.layer.name} Layer`,
    );
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    button.innerHTML = `
      <div class="layer-heading">
        <span class="layer-index">${String(card.layer.index + 1).padStart(2, "0")}</span>
        <span class="layer-title">${escapeHtml(card.layer.name)} Layer</span>
        <span class="layer-role">${escapeHtml(description.name)}</span>
      </div>
    `;

    button.appendChild(renderKeyboard(model));
    return button;
  }

  function renderDots(app) {
    if (!app.dots) {
      return;
    }

    app.dots.replaceChildren(
      ...app.state.layers.map((layer, index) => {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = "carousel-dot";
        dot.dataset.carouselIndex = String(index);
        dot.dataset.layerTheme = getLayerTheme(layer);
        dot.setAttribute("aria-label", `Show ${layer.name} Layer`);

        if (index === app.state.activeIndex) {
          dot.setAttribute("aria-current", "true");
        }

        return dot;
      }),
    );
  }

  function renderLayerDescription(app) {
    if (!app.description) {
      return;
    }

    const activeLayer = app.state.layers[app.state.activeIndex];
    const description = getLayerDescription(activeLayer.index);
    const heading = document.createElement("h2");
    const summary = document.createElement("p");
    const listTitle = document.createElement("p");
    const list = document.createElement("ul");

    app.description.dataset.layerTheme = getLayerTheme(activeLayer);
    app.description.replaceChildren();

    heading.className = "description-title";
    heading.textContent = description.name;

    summary.className = "description-summary";
    summary.textContent = description.summary;

    listTitle.className = "description-kicker";
    listTitle.textContent = "设计重点";

    description.highlights.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      list.appendChild(listItem);
    });

    app.description.append(heading, summary, listTitle, list);
  }

  function getLayerTheme(layer) {
    return (layer.name || "").toLowerCase();
  }

  function renderKeyboard(model) {
    if (model.type === "corne-split") {
      const keyboard = document.createElement("div");
      keyboard.className = "keyboard keyboard-corne";
      keyboard.appendChild(renderHalf(model.left, "left"));
      keyboard.appendChild(renderHalf(model.right, "right"));
      return keyboard;
    }

    const keyboard = document.createElement("div");
    keyboard.className = "keyboard keyboard-generic";
    keyboard.style.setProperty("--columns", model.columns);
    model.rows.forEach((row) => {
      row.forEach((key) => keyboard.appendChild(renderKey(key)));
    });
    return keyboard;
  }

  function renderHalf(rows, side) {
    const half = document.createElement("div");
    half.className = `keyboard-half keyboard-half-${side}`;

    rows.forEach((row) => {
      const rowNode = document.createElement("div");
      rowNode.className = "key-row";
      row.forEach((key) => rowNode.appendChild(renderKey(key)));
      half.appendChild(rowNode);
    });

    return half;
  }

  function renderKey(key) {
    const node = document.createElement("div");
    node.className = `key key-${key.kind}`;

    if (key.kind !== "empty") {
      const primary = document.createElement("span");
      primary.className = "key-primary";
      primary.textContent = key.primary;
      node.appendChild(primary);

      if (key.secondary) {
        const secondary = document.createElement("span");
        secondary.className = "key-secondary";
        secondary.textContent = key.secondary;
        node.appendChild(secondary);
      }

      node.title = key.raw;
    }

    return node;
  }

  function escapeHtml(value) {
    const text = document.createElement("span");
    text.textContent = value;
    return text.innerHTML;
  }

  return {
    DEFAULT_VIL_DATA,
    formatKeycode,
    getCarouselCards,
    getDisplayLayers,
    getLayerDescription,
    getNextLayerIndex,
    getTransitionDirection,
    init,
    parseVilText,
    toKeyboardModel,
  };
});
