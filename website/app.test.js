const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  formatKeycode,
  getCarouselCards,
  getDisplayLayers,
  getLayerDescription,
  getLayoutFetchPaths,
  getNextLayerIndex,
  getTransitionDirection,
  parseVilText,
  toKeyboardModel,
} = require("./app.js");

test("parses current Vial .vil and selects the three shareable layers", () => {
  const vilPath = path.join(__dirname, "..", "layout.vil");
  const data = parseVilText(fs.readFileSync(vilPath, "utf8"));
  const layers = getDisplayLayers(data);

  assert.equal(layers.length, 3);
  assert.deepEqual(
    layers.map((layer) => layer.name),
    ["Default", "Symbol", "Function"],
  );
  assert.equal(layers[0].rows[0][0], "KC_TAB");
  assert.equal(layers[1].rows[0][1], "LSFT(KC_1)");
  assert.equal(layers[2].rows[5][2], "KC_RIGHT");
});

test("formats common QMK keycodes, shifted wrappers, placeholders, and unknowns", () => {
  assert.deepEqual(formatKeycode(-1), {
    raw: "-1",
    primary: "",
    secondary: "",
    kind: "empty",
  });
  assert.equal(formatKeycode("KC_TRNS").kind, "transparent");
  assert.equal(formatKeycode("KC_TRNS").primary, "▽");
  assert.equal(formatKeycode("KC_BSPACE").primary, "Bksp");
  assert.equal(formatKeycode("KC_SPACE").primary, "Space");
  assert.equal(formatKeycode("LSFT(KC_1)").primary, "!");
  assert.equal(formatKeycode("LSFT(KC_EQUAL)").primary, "+");
  assert.equal(formatKeycode("LSFT(KC_MINS)").primary, "_");
  assert.equal(formatKeycode("MO(2)").kind, "layer");
  assert.equal(formatKeycode("LT(2,KC_SPC)").primary, "LT2 Space");
  assert.equal(formatKeycode("LCTL_T(KC_A)").primary, "Ctrl A");
  assert.equal(formatKeycode(4).primary, "0x0004");
  assert.equal(formatKeycode("CUSTOM_MACRO").primary, "CUSTOM_MACRO");
});

test("builds carousel cards with Default active and side previews in share order", () => {
  const vilPath = path.join(__dirname, "..", "layout.vil");
  const data = parseVilText(fs.readFileSync(vilPath, "utf8"));
  const layers = getDisplayLayers(data);
  const cards = getCarouselCards(layers, 0);

  assert.deepEqual(
    cards.map((card) => [card.placement, card.layer.name]),
    [
      ["left", "Symbol"],
      ["active", "Default"],
      ["right", "Function"],
    ],
  );
});

test("updates carousel active layer and keeps left and right previews in order", () => {
  const layers = ["Default", "Symbol", "Function"].map((name, index) => ({
    name,
    index,
    rows: [[`KC_${index}`]],
  }));

  assert.equal(getNextLayerIndex(0, "next", layers.length), 1);
  assert.equal(getNextLayerIndex(0, "previous", layers.length), 2);

  const cards = getCarouselCards(layers, 1);
  assert.deepEqual(
    cards.map((card) => [card.placement, card.layer.name]),
    [
      ["left", "Function"],
      ["active", "Symbol"],
      ["right", "Default"],
    ],
  );
});

test("derives carousel motion direction for animated layer changes", () => {
  assert.equal(getTransitionDirection(0, 1, 3), "next");
  assert.equal(getTransitionDirection(1, 0, 3), "previous");
  assert.equal(getTransitionDirection(0, 2, 3), "previous");
  assert.equal(getTransitionDirection(2, 0, 3), "next");
  assert.equal(getTransitionDirection(1, 1, 3), "none");
});

test("styles make the active card larger and define directional switch animations", () => {
  const css = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");

  assert.match(css, /\.layer-card-active\s*{[^}]*--key-size:\s*52px/s);
  assert.match(css, /data-motion="next"/);
  assert.match(css, /data-motion="previous"/);
  assert.match(css, /@keyframes active-card-enter-next/);
  assert.match(css, /@keyframes active-card-enter-previous/);
});

test("active carousel card reserves bottom space for the rotated thumb cluster", () => {
  const css = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");

  assert.match(css, /\.layer-card-active\s*{[^}]*min-height:\s*560px/s);
  assert.match(css, /\.layer-card-active \.keyboard\s*{[^}]*padding-bottom:\s*72px/s);
});

test("returns Chinese README description for the active layer", () => {
  const description = getLayerDescription(2);

  assert.equal(description.name, "功能层");
  assert.match(description.summary, /数字、方向键、Esc、Enter/);
  assert.deepEqual(description.highlights.slice(0, 2), [
    "数字键集中在上排，并贴近普通键盘数字排的相对位置。",
    "方向键放在右手主键区，便于编辑文本时快速移动光标。",
  ]);
});

test("chooses layout.vil fetch path for local website and deployed Pages URLs", () => {
  assert.deepEqual(getLayoutFetchPaths("/website/"), ["../layout.vil", "layout.vil"]);
  assert.deepEqual(getLayoutFetchPaths("/my-corne-layout/"), ["layout.vil", "../layout.vil"]);
});

test("builds a Corne split model from the current Vial matrix shape", () => {
  const vilPath = path.join(__dirname, "..", "layout.vil");
  const data = parseVilText(fs.readFileSync(vilPath, "utf8"));
  const [defaultLayer] = getDisplayLayers(data);
  const model = toKeyboardModel(defaultLayer.rows);

  assert.equal(model.type, "corne-split");
  assert.equal(model.left.length, 4);
  assert.equal(model.right.length, 4);
  assert.equal(model.left[3][0].kind, "empty");
  assert.equal(model.left[3][3].primary, "LAlt");
  assert.equal(model.right[0][0].primary, "Y");
  assert.equal(model.right[0][5].primary, "Bksp");
  assert.equal(model.right[3][1].primary, "Space");
});
