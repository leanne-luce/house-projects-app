/* @ds-bundle: {"format":4,"namespace":"ClubLuceDesignSystem_b992b6","components":[{"name":"Eyebrow","sourcePath":"components/brand/Eyebrow.jsx"},{"name":"PlanCard","sourcePath":"components/brand/PlanCard.jsx"},{"name":"PullQuote","sourcePath":"components/brand/PullQuote.jsx"},{"name":"SandBlock","sourcePath":"components/brand/SandBlock.jsx"},{"name":"SectionHeading","sourcePath":"components/brand/SectionHeading.jsx"},{"name":"SiteFooter","sourcePath":"components/brand/SiteFooter.jsx"},{"name":"SiteNav","sourcePath":"components/brand/SiteNav.jsx"},{"name":"TextLink","sourcePath":"components/brand/TextLink.jsx"},{"name":"BadgeCount","sourcePath":"components/core/BadgeCount.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"EmptyState","sourcePath":"components/core/EmptyState.jsx"},{"name":"Fab","sourcePath":"components/core/Fab.jsx"},{"name":"StatusPill","sourcePath":"components/core/StatusPill.jsx"},{"name":"Toast","sourcePath":"components/core/Toast.jsx"},{"name":"BudgetBar","sourcePath":"components/data/BudgetBar.jsx"},{"name":"ListItem","sourcePath":"components/data/ListItem.jsx"},{"name":"PanelCard","sourcePath":"components/data/PanelCard.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"SectionTitle","sourcePath":"components/data/SectionTitle.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"TotalsStrip","sourcePath":"components/data/TotalsStrip.jsx"},{"name":"ChecklistItem","sourcePath":"components/forms/ChecklistItem.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"TextInput","sourcePath":"components/forms/TextInput.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"HouseTabs","sourcePath":"components/navigation/HouseTabs.jsx"},{"name":"TabNav","sourcePath":"components/navigation/TabNav.jsx"},{"name":"Modal","sourcePath":"components/overlays/Modal.jsx"}],"sourceHashes":{"components/brand/Eyebrow.jsx":"494489f7404f","components/brand/PlanCard.jsx":"8d237f49f567","components/brand/PullQuote.jsx":"876bf398dca7","components/brand/SandBlock.jsx":"41bcd9026641","components/brand/SectionHeading.jsx":"4f415b9eab17","components/brand/SiteFooter.jsx":"f5774e5d17f4","components/brand/SiteNav.jsx":"9e56e4676977","components/brand/TextLink.jsx":"20c8a3efb263","components/core/BadgeCount.jsx":"87231a3807fd","components/core/Button.jsx":"1c87403dd269","components/core/Card.jsx":"bab5f8d623fa","components/core/EmptyState.jsx":"f318d0698847","components/core/Fab.jsx":"9d2ce9386f79","components/core/StatusPill.jsx":"df23d0190056","components/core/Toast.jsx":"d9ad76013a6f","components/data/BudgetBar.jsx":"7590b072893f","components/data/ListItem.jsx":"e5b2ff74ec36","components/data/PanelCard.jsx":"e21cc42e99e0","components/data/ProgressBar.jsx":"24d157cd013d","components/data/SectionTitle.jsx":"69bc225ef52c","components/data/StatCard.jsx":"07ac38259f22","components/data/TotalsStrip.jsx":"0bf66d8c10ad","components/forms/ChecklistItem.jsx":"73351cbd55e5","components/forms/Field.jsx":"292e37fd0a5e","components/forms/Select.jsx":"2c9ef1c71c30","components/forms/TextInput.jsx":"c2237f656bce","components/forms/Textarea.jsx":"9ef5442c8da3","components/navigation/HouseTabs.jsx":"e662f327f0c0","components/navigation/TabNav.jsx":"6f28a80f72a1","components/overlays/Modal.jsx":"6d15de90fec3","ui_kits/site/AboutPage.jsx":"10e6b1c6c08d","ui_kits/site/HomePage.jsx":"baa51138cbcd","ui_kits/site/PlansPage.jsx":"f7f48491995a","ui_kits/site/data.js":"389a946c4af9","ui_kits/studio/AppShell.jsx":"8180cb2a0ce8","ui_kits/studio/DetailScreen.jsx":"629b577af1b4","ui_kits/studio/HousesScreen.jsx":"e8a3c1b6f547","ui_kits/studio/InboxScreen.jsx":"d288f527486a","ui_kits/studio/LoginScreen.jsx":"4fd06de2e3d4","ui_kits/studio/LookbookScreen.jsx":"efb98c3d8209","ui_kits/studio/OverviewScreen.jsx":"c7c7ac370015","ui_kits/studio/ProjectsScreen.jsx":"0c6ad59ca429","ui_kits/studio/ReceiptsScreen.jsx":"cd9f21274247","ui_kits/studio/data.js":"23bd660ede5d"},"inlinedExternals":[],"unexposedExports":[{"name":"controlStyle","sourcePath":"components/forms/TextInput.jsx"}]} */

(() => {

const __ds_ns = (window.ClubLuceDesignSystem_b992b6 = window.ClubLuceDesignSystem_b992b6 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Eyebrow.jsx
try { (() => {
function Eyebrow({
  tone = "faint",
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "0.7rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: tone === "brass" ? "var(--brass)" : "var(--brown-light)",
      lineHeight: 1.6,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/brand/PullQuote.jsx
try { (() => {
function PullQuote({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("blockquote", {
    style: {
      borderLeft: "2px solid var(--brass)",
      padding: "0.25rem 0 0.25rem 1.75rem",
      margin: "3rem 0",
      ...style
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "clamp(1.25rem,2vw,1.625rem)",
      fontWeight: 300,
      fontStyle: "italic",
      color: "var(--brown)",
      lineHeight: 1.45,
      margin: 0
    }
  }, children));
}
Object.assign(__ds_scope, { PullQuote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/PullQuote.jsx", error: String((e && e.message) || e) }); }

// components/brand/SandBlock.jsx
try { (() => {
function SandBlock({
  title,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--sand)",
      padding: "2rem 2rem 2.25rem",
      ...style
    }
  }, title ? /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "1.125rem",
      fontWeight: 400,
      letterSpacing: "-0.01em",
      color: "var(--brown)",
      marginBottom: "1.375rem",
      paddingBottom: "1rem",
      borderBottom: "1px solid var(--sand-deep)"
    }
  }, title) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "0.9rem",
      color: "var(--brown-mid)",
      lineHeight: 1.7
    }
  }, children));
}
Object.assign(__ds_scope, { SandBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/SandBlock.jsx", error: String((e && e.message) || e) }); }

// components/brand/SectionHeading.jsx
try { (() => {
function SectionHeading({
  label,
  children,
  action,
  level = 2,
  style
}) {
  const Tag = "h" + level;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "1rem",
      marginBottom: "3.25rem",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", null, label ? /*#__PURE__*/React.createElement(__ds_scope.Eyebrow, {
    style: {
      marginBottom: "0.625rem"
    }
  }, label) : null, /*#__PURE__*/React.createElement(Tag, {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "clamp(1.75rem,3vw,2.5rem)",
      fontWeight: 400,
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
      color: "var(--brown)",
      margin: 0
    }
  }, children)), action);
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/brand/SiteFooter.jsx
try { (() => {
function SiteFooter({
  links = [],
  style
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      padding: "3rem 2.5rem",
      borderTop: "1px solid var(--sand)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "1160px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "1.25rem"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-wordmark)",
      fontSize: "1.125rem",
      fontWeight: 700,
      color: "var(--brown)"
    }
  }, "Club Luce"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "0.8125rem",
      color: "var(--brown-light)"
    }
  }, "\xA9 2025 Club Luce. All rights reserved."), /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      gap: "1.5rem",
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: "0.8125rem",
      color: "var(--brown-light)",
      textDecoration: "none"
    }
  }, l))))));
}
Object.assign(__ds_scope, { SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// components/brand/SiteNav.jsx
try { (() => {
function SiteNav({
  links = [],
  active,
  onSelect,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "var(--cream)",
      borderBottom: "1px solid var(--sand)",
      padding: "1.25rem 2.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "wordmark",
    style: {
      fontFamily: "var(--font-wordmark)",
      fontSize: "1.375rem",
      fontWeight: 700,
      letterSpacing: "-0.01em",
      color: "var(--brown)"
    }
  }, "Club Luce"), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      display: "flex",
      alignItems: "center",
      gap: "2.25rem",
      margin: 0,
      padding: 0
    }
  }, links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l.id
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onSelect && onSelect(l.id);
    },
    style: {
      fontSize: "0.8125rem",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      textDecoration: "none",
      color: l.id === active ? "var(--terracotta)" : "var(--brown-mid)",
      transition: "color 0.2s ease"
    }
  }, l.label)))));
}
Object.assign(__ds_scope, { SiteNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/SiteNav.jsx", error: String((e && e.message) || e) }); }

// components/brand/TextLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TextLink({
  href = "#",
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.8125rem",
      letterSpacing: "0.03em",
      color: "var(--terracotta)",
      fontWeight: 500,
      textDecoration: "none",
      opacity: hover ? 0.7 : 1,
      transition: "opacity 0.2s",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { TextLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/TextLink.jsx", error: String((e && e.message) || e) }); }

// components/brand/PlanCard.jsx
try { (() => {
function PlanCard({
  tag,
  title,
  description,
  image,
  href = "#",
  style
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      textDecoration: "none",
      color: "inherit",
      display: "block",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: "hidden",
      marginBottom: "1.375rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      aspectRatio: "4/3",
      background: image ? `url(${image}) center/cover` : "linear-gradient(145deg,#CDA87E 0%,#B8956A 60%,#A68055 100%)",
      transform: hover ? "scale(1.04)" : "none",
      transition: "transform 0.55s ease"
    }
  })), tag ? /*#__PURE__*/React.createElement(__ds_scope.Eyebrow, {
    style: {
      marginBottom: "0.5rem",
      letterSpacing: "0.1em"
    }
  }, tag) : null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "1.375rem",
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
      color: hover ? "var(--terracotta)" : "var(--brown)",
      marginBottom: "0.625rem",
      transition: "color 0.2s ease"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "0.9375rem",
      color: "var(--brown-mid)",
      lineHeight: 1.7,
      marginBottom: "1.125rem"
    }
  }, description), /*#__PURE__*/React.createElement(__ds_scope.TextLink, null, "View plan \u2192"));
}
Object.assign(__ds_scope, { PlanCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/PlanCard.jsx", error: String((e && e.message) || e) }); }

// components/core/BadgeCount.jsx
try { (() => {
function BadgeCount({
  count,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      display: "inline-block",
      minWidth: "1.1rem",
      padding: "0 0.3rem",
      marginLeft: "0.3rem",
      background: "var(--brass)",
      color: "var(--cream)",
      borderRadius: "999px",
      fontSize: "0.6875rem",
      lineHeight: "1.1rem",
      textAlign: "center",
      ...style
    }
  }, count);
}
Object.assign(__ds_scope, { BadgeCount });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/BadgeCount.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const base = {
  fontFamily: "var(--font-sans)",
  cursor: "pointer",
  borderRadius: 0,
  transition: "background 0.25s ease, color 0.25s ease, border-color 0.25s ease"
};
const VARIANTS = {
  primary: {
    background: "var(--terracotta)",
    color: "var(--cream)",
    border: "1.5px solid var(--terracotta)",
    padding: "0.75rem 1.75rem",
    fontWeight: 500,
    fontSize: "0.875rem",
    letterSpacing: "0.04em"
  },
  outline: {
    background: "transparent",
    color: "var(--brown)",
    border: "1.5px solid var(--brown)",
    padding: "0.9rem 2.25rem",
    fontWeight: 500,
    fontSize: "0.875rem",
    letterSpacing: "0.04em"
  },
  secondary: {
    background: "var(--sand)",
    color: "var(--brown)",
    border: "1.5px solid var(--sand)",
    padding: "0.7rem 1.5rem",
    fontWeight: 500,
    fontSize: "0.875rem",
    letterSpacing: "0.04em"
  },
  ghost: {
    background: "transparent",
    color: "var(--brown-mid)",
    border: "1.5px dashed var(--brown-light)",
    padding: "0.65rem 1.25rem",
    fontWeight: 400,
    fontSize: "0.8125rem",
    letterSpacing: "0.04em"
  },
  icon: {
    background: "transparent",
    border: "none",
    color: "var(--brown-light)",
    fontSize: "1rem",
    padding: "0.25rem 0.5rem"
  },
  link: {
    background: "none",
    border: "none",
    color: "var(--terracotta)",
    fontWeight: 500,
    fontSize: "0.8125rem",
    letterSpacing: "0.03em",
    padding: "0.25rem 0"
  }
};
const HOVER = {
  primary: {
    background: "var(--brown)",
    borderColor: "var(--brown)",
    color: "var(--cream)"
  },
  outline: {
    background: "var(--brown)",
    color: "var(--cream)"
  },
  secondary: {
    background: "var(--sand-deep)",
    borderColor: "var(--sand-deep)"
  },
  ghost: {
    borderColor: "var(--terracotta)",
    color: "var(--terracotta)"
  },
  icon: {
    color: "var(--terracotta)"
  },
  link: {
    opacity: 0.7
  }
};
function Button({
  variant = "primary",
  disabled,
  onClick,
  style,
  type = "button",
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...VARIANTS[variant],
      ...(hover && !disabled ? HOVER[variant] : null),
      opacity: disabled ? 0.45 : 1,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  pad = false,
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: pad ? "1.75rem" : undefined,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/EmptyState.jsx
try { (() => {
function EmptyState({
  glyph,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "3rem 1rem",
      color: "var(--brown-mid)",
      ...style
    }
  }, glyph ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "2.2rem",
      marginBottom: "0.6rem"
    }
  }, glyph) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "1rem",
      lineHeight: 1.75,
      textWrap: "pretty",
      maxWidth: "34rem",
      margin: "0 auto"
    }
  }, children));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/core/Fab.jsx
try { (() => {
function Fab({
  onClick,
  label = "+",
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    "aria-label": "Quick capture",
    style: {
      position: "fixed",
      right: "1.1rem",
      bottom: "1.1rem",
      zIndex: 50,
      width: "3.25rem",
      height: "3.25rem",
      borderRadius: 0,
      background: "var(--terracotta)",
      color: "var(--cream)",
      border: "none",
      fontSize: "1.5rem",
      fontFamily: "var(--font-sans)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style
    }
  }, label);
}
Object.assign(__ds_scope, { Fab });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Fab.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusPill.jsx
try { (() => {
const LABELS = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  on_hold: "On hold"
};
const TONES = {
  not_started: {
    background: "var(--surface-2)",
    color: "var(--text-muted)",
    border: "1px solid var(--border)"
  },
  in_progress: {
    background: "var(--warn-soft)",
    color: "var(--warn)"
  },
  done: {
    background: "var(--good-soft)",
    color: "var(--good)"
  },
  on_hold: {
    background: "var(--danger-soft)",
    color: "var(--danger)"
  }
};
function StatusPill({
  status = "not_started",
  label,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.6875rem",
      fontWeight: 500,
      padding: "0.2rem 0.6rem",
      borderRadius: "999px",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      whiteSpace: "nowrap",
      ...TONES[status],
      ...style
    }
  }, label || LABELS[status]);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/core/Toast.jsx
try { (() => {
function Toast({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: "5.2rem",
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--brown)",
      color: "var(--cream)",
      fontFamily: "var(--font-sans)",
      padding: "0.7rem 1.25rem",
      borderRadius: 0,
      fontSize: "0.875rem",
      letterSpacing: "0.02em",
      zIndex: 200,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Toast.jsx", error: String((e && e.message) || e) }); }

// components/data/BudgetBar.jsx
try { (() => {
function BudgetBar({
  label,
  value,
  max,
  amount,
  over,
  style
}) {
  const pct = max > 0 ? Math.min(100, value / max * 100) : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
      flexWrap: "wrap",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "5.2rem",
      fontFamily: "var(--font-sans)",
      fontSize: "0.7rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--brown-light)",
      flexShrink: 0
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: "0.5rem",
      background: "var(--sand)",
      borderRadius: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: pct + "%",
      borderRadius: 0,
      background: over ? "var(--terracotta)" : "var(--brass)",
      transition: "width .35s ease"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: "4.2rem",
      textAlign: "right",
      fontFamily: "var(--font-display)",
      fontSize: "1rem",
      fontWeight: 400,
      flexShrink: 0,
      color: over ? "var(--terracotta)" : "var(--brown)"
    }
  }, amount));
}
Object.assign(__ds_scope, { BudgetBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/BudgetBar.jsx", error: String((e && e.message) || e) }); }

// components/data/ListItem.jsx
try { (() => {
function ListItem({
  main,
  sub,
  right,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "0.6rem",
      padding: "0.75rem 0.875rem",
      background: "var(--sand)",
      borderRadius: 0,
      marginBottom: "0.375rem",
      cursor: onClick ? "pointer" : undefined,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1,
      fontFamily: "var(--font-sans)",
      fontSize: "0.9375rem",
      lineHeight: 1.55
    }
  }, main, sub ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.8125rem",
      color: "var(--brown-mid)",
      marginTop: "0.25rem"
    }
  }, sub) : null), right ? /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0
    }
  }, right) : null);
}
Object.assign(__ds_scope, { ListItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ListItem.jsx", error: String((e && e.message) || e) }); }

// components/data/PanelCard.jsx
try { (() => {
function PanelCard({
  title,
  span2,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "1.75rem",
      gridColumn: span2 ? "1 / -1" : undefined,
      ...style
    }
  }, title ? /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: "0 0 1.25rem",
      fontSize: "0.7rem",
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--brown-mid)",
      fontFamily: "var(--font-sans)",
      display: "flex",
      alignItems: "center",
      gap: "0.4rem"
    }
  }, title) : null, children);
}
Object.assign(__ds_scope, { PanelCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/PanelCard.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function ProgressBar({
  pct = 0,
  showPct = false,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.4rem",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: "0.375rem",
      background: "var(--sand)",
      borderRadius: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: Math.max(0, Math.min(100, pct)) + "%",
      background: "var(--good)",
      borderRadius: 0,
      transition: "width .35s ease"
    }
  })), showPct ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.75rem",
      color: "var(--brown-mid)",
      flexShrink: 0,
      minWidth: "2ch",
      textAlign: "right"
    }
  }, Math.round(pct), "%") : null);
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/SectionTitle.jsx
try { (() => {
function SectionTitle({
  children,
  right,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.7rem",
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--brown-mid)",
      marginBottom: "0.875rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "0.5rem",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", null, children), right);
}
Object.assign(__ds_scope, { SectionTitle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/SectionTitle.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
function StatCard({
  value,
  label,
  tone,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "1.125rem 0.875rem",
      textAlign: "center",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "1.5rem",
      fontWeight: 400,
      letterSpacing: "-0.02em",
      color: tone === "danger" ? "var(--terracotta)" : "var(--brown)",
      overflowWrap: "break-word"
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.7rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--brown-light)",
      marginTop: "0.5rem",
      lineHeight: 1.4
    }
  }, label));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data/TotalsStrip.jsx
try { (() => {
function TotalsStrip({
  items = [],
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "2rem",
      flexWrap: "wrap",
      background: "var(--sand)",
      borderRadius: 0,
      padding: "1rem 1.25rem",
      marginBottom: "0.6rem",
      ...style
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.7rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--brown-light)"
    }
  }, /*#__PURE__*/React.createElement("div", null, it.label), /*#__PURE__*/React.createElement("b", {
    style: {
      color: it.emphasis ? "var(--terracotta)" : "var(--brown)",
      fontFamily: "var(--font-display)",
      fontSize: "1.25rem",
      display: "block",
      fontWeight: 400,
      letterSpacing: "-0.02em",
      marginTop: "0.25rem"
    }
  }, it.value))));
}
Object.assign(__ds_scope, { TotalsStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/TotalsStrip.jsx", error: String((e && e.message) || e) }); }

// components/forms/ChecklistItem.jsx
try { (() => {
function ChecklistItem({
  checked,
  onChange,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.35rem 0.2rem"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: !!checked,
    onChange: onChange,
    style: {
      width: "auto",
      accentColor: "var(--terracotta)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.9375rem",
      textDecoration: checked ? "line-through" : "none",
      color: checked ? "var(--brown-light)" : "var(--brown)"
    }
  }, children));
}
Object.assign(__ds_scope, { ChecklistItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/ChecklistItem.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function Field({
  label,
  htmlFor,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "0.7rem",
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      fontSize: "0.7rem",
      fontWeight: 400,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--brown-light)",
      display: "block",
      marginBottom: "0.5rem"
    }
  }, label) : null, children);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const controlStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.9375rem",
  color: "var(--brown)",
  background: "var(--surface)",
  border: "1px solid var(--sand-deep)",
  borderRadius: 0,
  padding: "0.7rem 0.85rem",
  width: "100%"
};
function TextInput({
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("input", _extends({
    style: {
      ...controlStyle,
      ...style
    },
    onFocus: e => {
      e.currentTarget.style.outline = "1.5px solid var(--terracotta)";
      e.currentTarget.style.outlineOffset = "1px";
    },
    onBlur: e => {
      e.currentTarget.style.outline = "none";
    }
  }, rest));
}
Object.assign(__ds_scope, { controlStyle, TextInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("select", _extends({
    style: {
      ...__ds_scope.controlStyle,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  style,
  rows = 2,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    style: {
      ...__ds_scope.controlStyle,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/HouseTabs.jsx
try { (() => {
function HouseTabs({
  houses = [],
  active,
  onSelect,
  style
}) {
  if (houses.length < 2) return null;
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: "0.4rem",
      flexWrap: "wrap",
      marginBottom: "1rem",
      ...style
    }
  }, houses.map(h => {
    const isActive = h.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: h.id,
      onClick: () => onSelect && onSelect(h.id),
      style: {
        border: `1.5px solid ${isActive ? "var(--terracotta)" : "var(--sand-deep)"}`,
        background: "transparent",
        color: isActive ? "var(--terracotta)" : "var(--brown-mid)",
        fontFamily: "var(--font-sans)",
        fontSize: "0.8125rem",
        fontWeight: 500,
        letterSpacing: "0.04em",
        padding: "0.35rem 0.8rem",
        borderRadius: 0,
        whiteSpace: "nowrap",
        cursor: "pointer"
      }
    }, h.name);
  }));
}
Object.assign(__ds_scope, { HouseTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/HouseTabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabNav.jsx
try { (() => {
function TabNav({
  tabs = [],
  active,
  onSelect,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: "0.25rem",
      background: "var(--sand)",
      padding: "0.25rem",
      borderRadius: "999px",
      overflowX: "auto",
      maxWidth: "100%",
      minWidth: 0,
      ...style
    }
  }, tabs.map(t => {
    const isActive = t.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => onSelect && onSelect(t.id),
      style: {
        border: "none",
        background: isActive ? "var(--cream)" : "transparent",
        color: isActive ? "var(--terracotta)" : "var(--brown-mid)",
        boxShadow: "none",
        fontFamily: "var(--font-sans)",
        fontSize: "0.8125rem",
        fontWeight: 500,
        letterSpacing: "0.04em",
        padding: "0.45rem 0.85rem",
        borderRadius: "999px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        flexShrink: 0
      }
    }, t.label);
  }));
}
Object.assign(__ds_scope, { TabNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabNav.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Modal.jsx
try { (() => {
function Modal({
  title,
  onClose,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    },
    style: {
      position: "fixed",
      inset: 0,
      background: "var(--scrim)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface)",
      width: "100%",
      maxWidth: "38rem",
      maxHeight: "85vh",
      overflowY: "auto",
      borderRadius: 0,
      border: "1px solid var(--sand-deep)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "sticky",
      top: 0,
      background: "var(--surface)",
      padding: "1.25rem 1.75rem",
      borderBottom: "1px solid var(--sand)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "0.6rem",
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 400,
      fontSize: "1.25rem",
      letterSpacing: "-0.01em"
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: "none",
      border: "none",
      fontSize: "1.3rem",
      color: "var(--text-faint)",
      cursor: "pointer",
      lineHeight: 1,
      padding: "0.2rem 0.4rem"
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "1.75rem"
    }
  }, children)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Modal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/AboutPage.jsx
try { (() => {
const {
  Eyebrow,
  PullQuote,
  SandBlock,
  TextLink
} = window.ClubLuceDesignSystem_b992b6;
function AboutPage() {
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 1160,
      margin: "0 auto",
      padding: "0 2.5rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "7rem 0 6rem",
      maxWidth: 700
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: "1.5rem"
    }
  }, "About"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "clamp(2.5rem,5.5vw,4.25rem)",
      fontWeight: 400,
      lineHeight: 1.08,
      letterSpacing: "-0.025em",
      color: "var(--brown)",
      marginBottom: "2rem"
    }
  }, "Making things", /*#__PURE__*/React.createElement("br", null), "is worth ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: "italic",
      color: "var(--terracotta)"
    }
  }, "doing well.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "1.1875rem",
      color: "var(--brown-mid)",
      lineHeight: 1.75,
      maxWidth: 560
    }
  }, "Club Luce is a small collection of plans for building and making at home. Thoughtfully designed, honestly priced, and meant to be used.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 380px",
      gap: "6rem",
      padding: "6rem 0 7rem",
      borderTop: "1px solid var(--sand)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Section, {
    title: "What this is",
    paras: ["Club Luce is a one-person project. I make things — furniture, soft furnishings, small objects — and I write down how I did it. The plans here are the ones I'd want to find when I'm starting a new build: clear enough to follow, honest about the materials, and designed for real homes rather than workshops.", "Every plan starts as something I've built or made myself. I don't publish anything I haven't put in front of my own saw or sewn on my own table."]
  }), /*#__PURE__*/React.createElement(PullQuote, null, "\u201CI believe in buying fewer things and making them better.\u201D"), /*#__PURE__*/React.createElement(Section, {
    title: "The approach",
    paras: ["I'm interested in things that last. Not perfect things — things that are well-considered. Solid timber over MDF. Linen over polyester. A joint that's cut right rather than filled with caulk.", "The plans are written for people who are reasonably handy but not professionals. If you can follow a recipe, you can follow these."]
  })), /*#__PURE__*/React.createElement("aside", {
    style: {
      position: "sticky",
      top: 88
    }
  }, /*#__PURE__*/React.createElement(SandBlock, {
    title: "Find me here",
    style: {
      marginBottom: "1.25rem"
    }
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      display: "flex",
      flexDirection: "column",
      gap: "0.625rem",
      margin: 0,
      padding: 0
    }
  }, ["Pinterest →", "All plans →", "Ko-fi shop →"].map(l => /*#__PURE__*/React.createElement("li", {
    key: l,
    style: {
      paddingLeft: "1.25rem",
      position: "relative",
      lineHeight: 1.55
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      color: "var(--brass)",
      fontSize: "0.75rem",
      top: "0.2em"
    }
  }, "\u2014"), /*#__PURE__*/React.createElement(TextLink, {
    style: {
      fontSize: "0.9rem",
      color: "var(--brown-mid)",
      fontWeight: 300
    }
  }, l))))), /*#__PURE__*/React.createElement(SandBlock, {
    title: "Stay in the loop"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: "1.25rem"
    }
  }, "New plans, making notes, and the occasional honest update \u2014 straight to your inbox."), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1.5px dashed var(--brown-light)",
      padding: "2.5rem 2rem",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      display: "block",
      fontWeight: 500,
      color: "var(--brown-light)",
      marginBottom: "0.5rem",
      letterSpacing: "0.05em",
      fontSize: "0.7rem",
      textTransform: "uppercase"
    }
  }, "Email signup"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "0.875rem",
      fontStyle: "italic",
      lineHeight: 1.65
    }
  }, "Paste your Kit / ConvertKit embed code here."))))));
}
function Section({
  title,
  paras
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "4.5rem"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "clamp(1.5rem,2.5vw,2rem)",
      fontWeight: 400,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
      color: "var(--brown)",
      marginBottom: "1.25rem"
    }
  }, title), paras.map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i,
    style: {
      fontSize: "1rem",
      color: "var(--brown-mid)",
      lineHeight: 1.8,
      marginBottom: "1.5rem",
      maxWidth: 580
    }
  }, p)));
}
Object.assign(window, {
  AboutPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/AboutPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/HomePage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Button,
  Eyebrow,
  SectionHeading,
  TextLink,
  PlanCard
} = window.ClubLuceDesignSystem_b992b6;
function HomePage({
  site,
  onNav
}) {
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      minHeight: "82vh",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "6rem 3rem 5rem clamp(1.25rem, calc((100vw - 1160px) / 2 + 2.5rem), 8rem)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "brass",
    style: {
      marginBottom: "1.75rem"
    }
  }, "Woodwork \xB7 Textiles \xB7 Home"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "clamp(2.5rem,4.5vw,4.25rem)",
      fontWeight: 400,
      lineHeight: 1.06,
      letterSpacing: "-0.025em",
      color: "var(--brown)",
      marginBottom: "2rem"
    }
  }, "Plans for building", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: "italic",
      color: "var(--terracotta)"
    }
  }, "a life you love.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "1.125rem",
      color: "var(--brown-mid)",
      maxWidth: 420,
      lineHeight: 1.75,
      marginBottom: "2.75rem"
    }
  }, "Downloadable plans for furniture, soft furnishings, and things worth making. Designed for real homes \u2014 not showrooms."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => onNav("plans")
  }, "Browse all plans"))), /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: "hidden",
      background: "var(--sand)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/photos/long-low-shelves-wide-view.png",
    alt: "A warm, light-filled living room",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      maxWidth: "none"
    }
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "7rem 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1160,
      margin: "0 auto",
      padding: "0 2.5rem"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    label: "Featured",
    action: /*#__PURE__*/React.createElement(TextLink, {
      onClick: e => {
        e.preventDefault();
        onNav("plans");
      }
    }, "View all \u2192")
  }, "Recent plans"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "3rem 2.25rem"
    }
  }, site.plans.map(p => /*#__PURE__*/React.createElement(PlanCard, _extends({
    key: p.id
  }, p)))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--sand)",
      padding: "7rem 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1160,
      margin: "0 auto",
      padding: "0 2.5rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 580
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "clamp(1.875rem,3.5vw,2.875rem)",
      fontWeight: 400,
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
      color: "var(--brown)",
      marginBottom: "1.125rem"
    }
  }, "New plans, straight to your inbox."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--brown-mid)",
      fontSize: "1rem",
      marginBottom: "2.5rem",
      lineHeight: 1.7
    }
  }, "Join the list for early access to new plans, making notes, and the occasional honest home update."), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1.5px dashed var(--brown-light)",
      padding: "3rem 2.5rem",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      display: "block",
      fontWeight: 500,
      color: "var(--brown-light)",
      marginBottom: "0.375rem",
      letterSpacing: "0.04em",
      fontSize: "0.75rem",
      textTransform: "uppercase"
    }
  }, "Email signup"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "0.875rem",
      color: "var(--brown-mid)",
      fontStyle: "italic",
      lineHeight: 1.7
    }
  }, "Paste your Kit / ConvertKit embed code here to replace this placeholder."))))));
}
Object.assign(window, {
  HomePage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/HomePage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/PlansPage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Eyebrow,
  PlanCard
} = window.ClubLuceDesignSystem_b992b6;
function PlansPage({
  site
}) {
  const all = [...site.plans, ...site.plans.map(p => ({
    ...p,
    id: p.id + "-2",
    image: null
  }))];
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 1160,
      margin: "0 auto",
      padding: "0 2.5rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "7rem 0 4rem",
      maxWidth: 700
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: "1.5rem"
    }
  }, "Plans"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "clamp(2.5rem,5.5vw,4.25rem)",
      fontWeight: 400,
      lineHeight: 1.08,
      letterSpacing: "-0.025em",
      color: "var(--brown)",
      marginBottom: "2rem"
    }
  }, "Everything worth", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: "italic",
      color: "var(--terracotta)"
    }
  }, "making.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "1.1875rem",
      color: "var(--brown-mid)",
      lineHeight: 1.75,
      maxWidth: 560
    }
  }, "Each plan includes a cut list, a materials list with rough costs, step-by-step instructions, and reference images.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "3rem 2.25rem",
      paddingBottom: "7rem",
      borderTop: "1px solid var(--sand)",
      paddingTop: "4rem"
    }
  }, all.map(p => /*#__PURE__*/React.createElement(PlanCard, _extends({
    key: p.id
  }, p)))));
}
Object.assign(window, {
  PlansPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/PlansPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/data.js
try { (() => {
window.CLUB_LUCE_SITE = {
  nav: [{
    id: "plans",
    label: "Plans"
  }, {
    id: "about",
    label: "About"
  }, {
    id: "shop",
    label: "Shop"
  }, {
    id: "pinterest",
    label: "Pinterest"
  }],
  plans: [{
    id: "low-long-shelf",
    tag: "Woodwork",
    title: "Low Long Shelf",
    description: "A low, long shelf that lines a wall. Solid timber, clean lines, built to last and look like it always belonged there.",
    image: "../../assets/photos/basic-finished-image.png"
  }, {
    id: "linen-curtain",
    tag: "Textiles",
    title: "Linen Curtain Panel",
    description: "Unfussy linen curtains that drape beautifully. No sewing machine required.",
    image: null
  }, {
    id: "entryway-bench",
    tag: "Woodwork",
    title: "Entryway Bench",
    description: "A low, solid bench for your hallway. Built to hold bags, shoes, and everything in between.",
    image: null
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/data.js", error: String((e && e.message) || e) }); }

// ui_kits/studio/AppShell.jsx
try { (() => {
const {
  TabNav,
  Fab
} = window.ClubLuceDesignSystem_b992b6;
const TABS = [{
  id: "houses",
  label: "Houses"
}, {
  id: "inbox",
  label: "Inbox"
}, {
  id: "projects",
  label: "Projects"
}, {
  id: "receipts",
  label: "Receipts"
}, {
  id: "lookbook",
  label: "Lookbook"
}, {
  id: "overview",
  label: "Overview"
}];
function AppShell({
  tab,
  onTab,
  onCapture,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "62rem",
      margin: "0 auto",
      padding: "1rem 1rem 6rem"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: "var(--bg)",
      padding: "1.25rem 0 1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "0.75rem",
      borderBottom: "1px solid var(--border)",
      marginBottom: "1rem"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "site-title",
    style: {
      fontSize: "1.375rem",
      margin: 0,
      flexShrink: 0,
      whiteSpace: "nowrap"
    }
  }, "Club Luce | Studio"), /*#__PURE__*/React.createElement(TabNav, {
    tabs: TABS,
    active: tab,
    onSelect: onTab
  })), children, /*#__PURE__*/React.createElement(Fab, {
    onClick: onCapture
  }));
}
Object.assign(window, {
  AppShell,
  TABS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/studio/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/studio/DetailScreen.jsx
try { (() => {
const {
  Button,
  PanelCard,
  ListItem,
  BudgetBar,
  ProgressBar,
  ChecklistItem,
  SectionTitle,
  Select,
  TextInput,
  StatusPill
} = window.ClubLuceDesignSystem_b992b6;
const STATUS_COLOR = {
  not_started: "var(--text-faint)",
  in_progress: "var(--warn)",
  done: "var(--good)",
  on_hold: "var(--danger)"
};
const CHECK_LABELS = ["Measure the run", "Order tile samples", "Book the tiler", "Pick grout colour", "Seal and clean"];
function DetailScreen({
  detail,
  data,
  onBack
}) {
  const [checks, setChecks] = React.useState(detail.checklist);
  const room = data.rooms.find(r => r.id === detail.roomId);
  const house = data.houses.find(h => h.id === detail.houseId);
  const materials = data.materials.filter(m => m.detailId === detail.id);
  const spend = data.spend.filter(s => s.detailId === detail.id);
  const act = spend.reduce((s, x) => s + x.amount, 0);
  const est = detail.est;
  const max = Math.max(est, act, 1);
  const donePct = checks.length ? checks.filter(Boolean).length / checks.length * 100 : 0;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "0.7rem"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    onClick: onBack,
    style: {
      fontWeight: 700,
      fontSize: "0.88rem",
      textDecoration: "none"
    }
  }, "\u2190 Back")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      overflow: "hidden",
      padding: "2rem 2rem 2rem 2.25rem",
      marginBottom: "1.2rem",
      background: "var(--sand)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 6,
      background: STATUS_COLOR[detail.status]
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "0.7rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--brown-light)"
    }
  }, house.name, " \u203A ", room ? room.name : "No room"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "2rem",
      fontWeight: 400,
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
      marginTop: "0.25rem"
    }
  }, detail.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0.5rem",
      flexWrap: "wrap",
      marginTop: "0.6rem"
    }
  }, /*#__PURE__*/React.createElement(Select, {
    defaultValue: detail.status,
    style: {
      width: "auto",
      fontSize: "0.82rem",
      padding: "0.35rem 0.6rem",
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "not_started"
  }, "Not started"), /*#__PURE__*/React.createElement("option", {
    value: "in_progress"
  }, "In progress"), /*#__PURE__*/React.createElement("option", {
    value: "on_hold"
  }, "On hold"), /*#__PURE__*/React.createElement("option", {
    value: "done"
  }, "Done")), /*#__PURE__*/React.createElement(TextInput, {
    defaultValue: detail.timeframe,
    style: {
      width: "auto",
      fontSize: "0.82rem",
      padding: "0.35rem 0.6rem"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "1.15rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.55rem",
      background: "var(--cream)",
      padding: "1.125rem 1.25rem"
    }
  }, /*#__PURE__*/React.createElement(BudgetBar, {
    label: "Estimated",
    value: est,
    max: max,
    amount: money(est)
  }), /*#__PURE__*/React.createElement(BudgetBar, {
    label: "Actual",
    value: act,
    max: max,
    amount: money(act),
    over: act > est
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem"
    }
  }, /*#__PURE__*/React.createElement(PanelCard, {
    title: "Materials plan"
  }, materials.map(m => /*#__PURE__*/React.createElement(ListItem, {
    key: m.id,
    main: m.description,
    sub: m.qty,
    right: /*#__PURE__*/React.createElement(StatusPill, {
      status: m.status === "have" ? "done" : m.status === "ordered" ? "in_progress" : "not_started",
      label: m.status.replace(/_/g, " ")
    })
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    style: {
      marginTop: "0.4rem"
    }
  }, "+ Add material")), /*#__PURE__*/React.createElement(PanelCard, {
    title: "Actual spend"
  }, spend.map(s => /*#__PURE__*/React.createElement(ListItem, {
    key: s.id,
    main: s.description,
    sub: s.vendor,
    right: /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: "0.85rem"
      }
    }, money(s.amount))
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    style: {
      marginTop: "0.4rem"
    }
  }, "+ Log spend")), /*#__PURE__*/React.createElement(PanelCard, {
    title: "Checklist"
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    pct: donePct,
    showPct: true,
    style: {
      marginBottom: "0.5rem"
    }
  }), checks.map((c, i) => /*#__PURE__*/React.createElement(ChecklistItem, {
    key: i,
    checked: c,
    onChange: () => setChecks(checks.map((v, j) => j === i ? !v : v))
  }, CHECK_LABELS[i] || "Task " + (i + 1)))), /*#__PURE__*/React.createElement(PanelCard, {
    title: "Notes"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "0.88rem",
      color: "var(--text-muted)"
    }
  }, "Warm grey grout, not white. Samples at ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "ottotiles.co.uk"), ".")), /*#__PURE__*/React.createElement(PanelCard, {
    title: "Mood board & reference",
    span2: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem,1fr))",
      gap: "0.6rem"
    }
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      aspectRatio: "1",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--border)",
      background: "var(--surface-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-faint)",
      fontSize: "0.68rem",
      textAlign: "center",
      padding: 6
    }
  }, "image"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "0.72rem",
      color: "var(--text-faint)",
      marginTop: "0.5rem",
      fontStyle: "italic"
    }
  }, "Photo slots are intentionally blank \u2014 Studio stores user photos in Blob storage."))));
}
Object.assign(window, {
  DetailScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/studio/DetailScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/studio/HousesScreen.jsx
try { (() => {
const {
  StatusPill,
  Button,
  ProgressBar
} = window.ClubLuceDesignSystem_b992b6;
function money(n) {
  return "$" + Math.round(n).toLocaleString();
}
function RoomCard({
  room,
  details,
  onOpen
}) {
  const [open, setOpen] = React.useState(true);
  const done = details.filter(d => d.status === "done").length;
  const pct = details.length ? done / details.length * 100 : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      border: "1px solid var(--sand)",
      overflow: "hidden",
      position: "relative",
      alignSelf: open ? "stretch" : undefined,
      display: open ? "flex" : undefined,
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      background: "var(--accent)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    onClick: () => setOpen(!open),
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.65rem 0.75rem 0.65rem 0.9rem",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-faint)",
      fontSize: "0.85rem",
      transform: open ? "rotate(90deg)" : "none",
      transition: "transform .15s"
    }
  }, "\u25B8"), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "0.7rem",
      fontWeight: 400,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--brown-mid)"
    }
  }, room.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.75rem",
      color: "var(--brown-mid)",
      marginTop: "0.25rem"
    }
  }, details.length, " details \xB7 ", money(details.reduce((s, d) => s + d.act, 0)), " spent"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "0.35rem",
      borderRadius: 999,
      overflow: "hidden",
      background: "var(--border)",
      marginTop: "0.45rem"
    }
  }, details.map(d => /*#__PURE__*/React.createElement("span", {
    key: d.id,
    style: {
      flex: 1,
      background: d.status === "done" ? "var(--good)" : d.status === "in_progress" ? "var(--warn)" : d.status === "on_hold" ? "var(--danger)" : "var(--text-faint)"
    }
  }))), /*#__PURE__*/React.createElement(ProgressBar, {
    pct: pct,
    showPct: true,
    style: {
      marginTop: "0.3rem"
    }
  }))), open ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0.6rem 0.75rem 0.75rem 0.9rem",
      borderTop: "1px solid var(--border)",
      flex: 1
    }
  }, details.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.id,
    onClick: () => onOpen(d),
    onMouseEnter: e => e.currentTarget.style.background = "var(--sand-deep)",
    onMouseLeave: e => e.currentTarget.style.background = "var(--sand)",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "0.6rem",
      padding: "0.55rem 0.7rem",
      background: "var(--sand)",
      marginBottom: "0.4rem",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 500,
      fontSize: "0.9375rem"
    }
  }, d.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.8125rem",
      color: "var(--brown-mid)",
      marginTop: "0.15rem"
    }
  }, d.timeframe, " \xB7 ", money(d.act), " of ", money(d.est))), /*#__PURE__*/React.createElement(StatusPill, {
    status: d.status
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0.5rem",
      flexWrap: "wrap",
      marginTop: "0.6rem"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "+ Add detail"))) : null);
}
function HousesScreen({
  data,
  onOpen
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, data.houses.map(h => {
    const rooms = data.rooms.filter(r => r.houseId === h.id);
    const details = data.details.filter(d => d.houseId === h.id);
    return /*#__PURE__*/React.createElement("div", {
      key: h.id,
      style: {
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        marginBottom: "1.25rem"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.9rem 1rem",
        gap: "0.6rem",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        flex: "1 1 20rem",
        maxWidth: "20rem"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)",
        transform: "rotate(90deg)"
      }
    }, "\u25B8"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 400,
        fontSize: "1.375rem",
        letterSpacing: "-0.01em"
      }
    }, h.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: "0.8125rem",
        color: "var(--brown-light)",
        marginTop: "0.2rem"
      }
    }, h.address))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: "0.8125rem",
        color: "var(--brown-mid)",
        textAlign: "right",
        minWidth: "9rem"
      }
    }, details.length, " details \xB7 ", money(details.reduce((s, d) => s + d.act, 0)), " spent")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 1rem 1rem",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(15rem,1fr))",
        gap: "0.7rem",
        marginTop: "0.9rem",
        alignItems: "start"
      }
    }, rooms.map(r => /*#__PURE__*/React.createElement(RoomCard, {
      key: r.id,
      room: r,
      details: details.filter(d => d.roomId === r.id),
      onOpen: onOpen
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "0.5rem",
        marginTop: "0.6rem"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost"
    }, "+ Add room"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost"
    }, "+ Add detail"))));
  }));
}
Object.assign(window, {
  HousesScreen,
  money
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/studio/HousesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/studio/InboxScreen.jsx
try { (() => {
const {
  Card,
  Button,
  Textarea,
  Field,
  Select,
  SectionTitle,
  EmptyState
} = window.ClubLuceDesignSystem_b992b6;
function InboxScreen({
  items,
  onFile,
  onDiscard,
  onAdd
}) {
  const [text, setText] = React.useState("");
  const [filing, setFiling] = React.useState(null);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      marginBottom: "1rem"
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, null, "Quick capture"), /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement(Textarea, {
    rows: 2,
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: "A stray thought, a material, a link\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0.4rem",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "Add a photo or video"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => {
      if (text.trim()) {
        onAdd(text);
        setText("");
      }
    }
  }, "Add to inbox"))), !items.length ? /*#__PURE__*/React.createElement(EmptyState, {
    glyph: "\uD83D\uDCE5"
  }, "Inbox is empty. Whatever you capture on the fly lands here until you\u2019re ready to file it.") : /*#__PURE__*/React.createElement(Card, null, items.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: item.id,
    style: {
      display: "flex",
      gap: "0.7rem",
      padding: "0.7rem",
      borderBottom: i === items.length - 1 ? "none" : "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "3.2rem",
      height: "3.2rem",
      background: "var(--sand)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      border: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "0.7rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--brown-light)"
    }
  }, item.photo ? "Photo" : "Note")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "0.9375rem",
      lineHeight: 1.6
    }
  }, item.text || /*#__PURE__*/React.createElement("i", {
    style: {
      color: "var(--text-faint)"
    }
  }, "(photo only)")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.8125rem",
      color: "var(--brown-light)",
      marginTop: "0.35rem"
    }
  }, item.time), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0.5rem",
      marginTop: "0.5rem",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setFiling(filing === item.id ? null : item.id)
  }, "File\u2026"), /*#__PURE__*/React.createElement(Button, {
    variant: "icon",
    onClick: () => onDiscard(item.id)
  }, "Discard")), filing === item.id ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "0.6rem",
      background: "var(--sand)",
      padding: "1rem"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "File to existing detail"
  }, /*#__PURE__*/React.createElement(Select, {
    defaultValue: "",
    onChange: e => e.target.value && onFile(item.id, e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Choose a detail\u2026"), /*#__PURE__*/React.createElement("option", {
    value: "d1"
  }, "Rosewood \u203A Kitchen \u203A Backsplash tile"), /*#__PURE__*/React.createElement("option", {
    value: "d3"
  }, "Rosewood \u203A Entry hall \u203A Stair runner"), /*#__PURE__*/React.createElement("option", {
    value: "d5"
  }, "Rosewood \u203A Studio \u203A Pegboard wall"))), /*#__PURE__*/React.createElement(Button, {
    variant: "link"
  }, "+ or create a new detail for this")) : null)))));
}
Object.assign(window, {
  InboxScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/studio/InboxScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/studio/LoginScreen.jsx
try { (() => {
const {
  Card,
  Field,
  TextInput,
  Button
} = window.ClubLuceDesignSystem_b992b6;
function LoginScreen({
  onEnter
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onEnter();
    },
    style: {
      width: "100%",
      maxWidth: "22rem",
      padding: "1.5rem",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow)"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "site-title",
    style: {
      fontSize: "1.2rem",
      margin: "0 0 1rem"
    }
  }, "Club Luce | Studio"), /*#__PURE__*/React.createElement(Field, {
    label: "Passphrase",
    htmlFor: "pass"
  }, /*#__PURE__*/React.createElement(TextInput, {
    id: "pass",
    type: "password",
    autoFocus: true
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    type: "submit",
    style: {
      width: "100%",
      marginTop: "0.75rem"
    }
  }, "Enter")));
}
Object.assign(window, {
  LoginScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/studio/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/studio/LookbookScreen.jsx
try { (() => {
const {
  Card,
  HouseTabs,
  EmptyState
} = window.ClubLuceDesignSystem_b992b6;
function Thumb() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "4/3",
      background: "var(--sand)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-faint)",
      fontSize: "0.68rem"
    }
  }, "photo");
}
function LookbookScreen({
  data,
  houseId,
  onHouse
}) {
  const [openId, setOpenId] = React.useState(null);
  const details = data.details.filter(d => d.houseId === houseId && d.act > 0);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(HouseTabs, {
    houses: data.houses,
    active: houseId,
    onSelect: onHouse
  }), !details.length ? /*#__PURE__*/React.createElement(EmptyState, {
    glyph: ""
  }, "No photos or inspiration in this house yet.") : details.map(d => {
    const room = data.rooms.find(r => r.id === d.roomId);
    return /*#__PURE__*/React.createElement(Card, {
      key: d.id,
      pad: true,
      style: {
        marginBottom: "0.9rem"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "0.6rem",
        marginBottom: "0.8rem"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 400,
        fontSize: "1.375rem",
        letterSpacing: "-0.01em"
      }
    }, d.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: "0.8125rem",
        color: "var(--brown-mid)"
      }
    }, room ? room.name : "Not in a specific room")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(9rem,1fr))",
        gap: "0.8rem"
      }
    }, ["Before", "During", "After"].map(p => /*#__PURE__*/React.createElement("div", {
      key: p
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "0.7rem",
        fontWeight: 400,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: "var(--brown-light)",
        marginBottom: "0.4rem"
      }
    }, p), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem,1fr))",
        gap: "0.4rem"
      }
    }, /*#__PURE__*/React.createElement(Thumb, null), /*#__PURE__*/React.createElement(Thumb, null))))), /*#__PURE__*/React.createElement("details", {
      onToggle: e => setOpenId(e.currentTarget.open ? d.id : null),
      style: {
        marginTop: "0.9rem",
        paddingTop: "0.8rem",
        borderTop: "1px solid var(--sand)"
      }
    }, /*#__PURE__*/React.createElement("summary", {
      style: {
        cursor: "pointer",
        listStyle: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.7rem",
        fontWeight: 400,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: "var(--brown-mid)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-block",
        color: "var(--brown-light)",
        fontSize: "0.78rem",
        transform: openId === d.id ? "rotate(90deg)" : "none",
        transition: "transform .15s"
      }
    }, "\u25B8"), "Inspiration (4)"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem,1fr))",
        gap: "0.6rem",
        marginTop: "0.6rem"
      }
    }, /*#__PURE__*/React.createElement(Thumb, null), /*#__PURE__*/React.createElement(Thumb, null), /*#__PURE__*/React.createElement(Thumb, null), /*#__PURE__*/React.createElement(Thumb, null))));
  }));
}
Object.assign(window, {
  LookbookScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/studio/LookbookScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/studio/OverviewScreen.jsx
try { (() => {
const {
  StatCard,
  PanelCard,
  ListItem,
  TotalsStrip,
  HouseTabs,
  StatusPill
} = window.ClubLuceDesignSystem_b992b6;
function OverviewScreen({
  data,
  houseId,
  onHouse,
  onOpen
}) {
  const house = data.houses.find(h => h.id === houseId);
  const details = data.details.filter(d => d.houseId === houseId);
  const rooms = data.rooms;
  const spent = details.reduce((s, d) => s + d.act, 0);
  const projected = details.reduce((s, d) => s + Math.max(d.est, d.act), 0);
  const over = details.filter(d => d.act > d.est && d.est > 0);
  const overTotal = over.reduce((s, d) => s + (d.act - d.est), 0);
  const remaining = details.filter(d => d.est > d.act).reduce((s, d) => s + (d.est - d.act), 0);
  const sourcing = data.materials.filter(m => m.status === "need_to_source" && details.some(d => d.id === m.detailId));
  const path = d => {
    const r = rooms.find(x => x.id === d.roomId);
    return house.name + (r ? " › " + r.name : "") + " › " + d.name;
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(HouseTabs, {
    houses: data.houses,
    active: houseId,
    onSelect: onHouse
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(7rem,1fr))",
      gap: "0.7rem",
      marginBottom: "1rem"
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    value: details.filter(d => d.status === "in_progress").length,
    label: "Active details"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: money(spent),
    label: "Total spent"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: money(projected),
    label: "Total projected"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: money(overTotal),
    label: "Over budget",
    tone: overTotal ? "danger" : "default"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: money(remaining),
    label: "Left to spend (budgeted)"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: sourcing.length,
    label: "Need sourcing"
  })), /*#__PURE__*/React.createElement(PanelCard, {
    title: "All-in value — " + house.name,
    style: {
      marginBottom: "1rem"
    }
  }, /*#__PURE__*/React.createElement(TotalsStrip, {
    style: {
      marginBottom: 0
    },
    items: [{
      label: "Purchase price",
      value: money(house.purchasePrice)
    }, {
      label: "+ Spent on projects",
      value: money(spent)
    }, {
      label: "All-in so far",
      value: money(house.purchasePrice + spent),
      emphasis: true
    }, {
      label: "All-in if fully spent as planned",
      value: money(house.purchasePrice + projected),
      emphasis: true
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem"
    }
  }, /*#__PURE__*/React.createElement(PanelCard, {
    title: "Over budget"
  }, over.length ? over.map(d => /*#__PURE__*/React.createElement(ListItem, {
    key: d.id,
    onClick: () => onOpen(d),
    main: path(d),
    right: /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--danger)",
        fontWeight: 700,
        fontSize: "0.85rem"
      }
    }, money(d.act), " / ", money(d.est))
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-faint)",
      fontSize: "0.85rem",
      fontStyle: "italic"
    }
  }, "Nothing over budget.")), /*#__PURE__*/React.createElement(PanelCard, {
    title: "Materials needing sourcing"
  }, sourcing.length ? sourcing.map(m => {
    const d = details.find(x => x.id === m.detailId);
    return /*#__PURE__*/React.createElement(ListItem, {
      key: m.id,
      onClick: () => onOpen(d),
      main: m.description,
      sub: path(d)
    });
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-faint)",
      fontSize: "0.85rem",
      fontStyle: "italic"
    }
  }, "Nothing waiting on sourcing.")), /*#__PURE__*/React.createElement(PanelCard, {
    title: "Coming up",
    span2: true
  }, details.filter(d => d.status !== "done").map(d => /*#__PURE__*/React.createElement(ListItem, {
    key: d.id,
    onClick: () => onOpen(d),
    main: path(d),
    right: /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
      }
    }, /*#__PURE__*/React.createElement(StatusPill, {
      status: d.status
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "0.78rem",
        color: "var(--text-muted)"
      }
    }, d.timeframe))
  })))));
}
Object.assign(window, {
  OverviewScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/studio/OverviewScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/studio/ProjectsScreen.jsx
try { (() => {
const {
  StatusPill
} = window.ClubLuceDesignSystem_b992b6;
function HorizonRow({
  d,
  path,
  onOpen
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => onOpen(d),
    onMouseEnter: e => e.currentTarget.style.background = "var(--sand-deep)",
    onMouseLeave: e => e.currentTarget.style.background = "var(--sand)",
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.55rem 0.7rem",
      background: "var(--sand)",
      marginBottom: "0.4rem",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 500,
      fontSize: "0.9375rem"
    }
  }, d.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.8125rem",
      color: "var(--brown-mid)"
    }
  }, path)), /*#__PURE__*/React.createElement(StatusPill, {
    status: d.status
  }));
}
function ProjectsScreen({
  data,
  onOpen
}) {
  const [doneOpen, setDoneOpen] = React.useState(false);
  const path = d => {
    const h = data.houses.find(x => x.id === d.houseId);
    const r = data.rooms.find(x => x.id === d.roomId);
    return [h && h.name, r && r.name].filter(Boolean).join(" › ");
  };
  const active = data.details.filter(d => d.status !== "done");
  const done = data.details.filter(d => d.status === "done");
  const groups = {};
  active.forEach(d => {
    (groups[d.timeframe] = groups[d.timeframe] || []).push(d);
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, Object.keys(groups).map(label => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      marginBottom: "1.1rem"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.7rem",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--brown-light)",
      margin: "0 0 0.75rem",
      fontWeight: 400
    }
  }, label), groups[label].map(d => /*#__PURE__*/React.createElement(HorizonRow, {
    key: d.id,
    d: d,
    path: path(d),
    onOpen: onOpen
  })))), /*#__PURE__*/React.createElement("details", {
    onToggle: e => setDoneOpen(e.currentTarget.open),
    style: {
      marginTop: "1.4rem",
      paddingTop: "1rem",
      borderTop: "1px solid var(--sand)"
    }
  }, /*#__PURE__*/React.createElement("summary", {
    style: {
      cursor: "pointer",
      listStyle: "none",
      display: "flex",
      alignItems: "center",
      gap: "0.4rem",
      fontSize: "0.7rem",
      fontWeight: 400,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--brown-mid)",
      padding: "0.3rem 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      color: "var(--brown-light)",
      fontSize: "0.78rem",
      transform: doneOpen ? "rotate(90deg)" : "none",
      transition: "transform .15s"
    }
  }, "\u25B8"), "Done (", done.length, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "0.9rem"
    }
  }, done.map(d => /*#__PURE__*/React.createElement(HorizonRow, {
    key: d.id,
    d: d,
    path: path(d),
    onOpen: onOpen
  })))));
}
Object.assign(window, {
  ProjectsScreen
});

// Matches globals.css: summary::-webkit-details-marker { display:none }
const marker = document.createElement("style");
marker.textContent = "summary::-webkit-details-marker{display:none}summary::marker{content:''}";
document.head.appendChild(marker);
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/studio/ProjectsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/studio/ReceiptsScreen.jsx
try { (() => {
const {
  Card,
  HouseTabs,
  Button,
  StatusPill,
  ListItem,
  SectionTitle
} = window.ClubLuceDesignSystem_b992b6;
const RECEIPTS = [{
  id: "r1",
  vendor: "Otto Tiles",
  date: "12 Sep 2026",
  total: 620,
  pending: 1,
  items: [{
    d: "Zellige 4×4 oatmeal, 38 sq ft",
    a: 560,
    s: "assigned"
  }, {
    d: "Delivery",
    a: 60,
    s: "pending"
  }]
}, {
  id: "r2",
  vendor: "Lowe's",
  date: "3 Sep 2026",
  total: 320,
  pending: 2,
  items: [{
    d: "Tile adhesive, 2 bags",
    a: 84,
    s: "pending"
  }, {
    d: "Sanded grout, warm grey",
    a: 36,
    s: "pending"
  }, {
    d: "Spacers + trowel",
    a: 200,
    s: "assigned"
  }]
}];
function ReceiptsScreen({
  data,
  houseId,
  onHouse
}) {
  const [open, setOpen] = React.useState("r1");
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(HouseTabs, {
    houses: data.houses,
    active: houseId,
    onSelect: onHouse
  }), /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      marginBottom: "1rem",
      display: "flex",
      gap: "0.5rem",
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    style: {
      marginBottom: 0,
      flex: 1
    }
  }, "Add a receipt"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "Photo or PDF"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary"
  }, "Scan receipt")), RECEIPTS.map(r => /*#__PURE__*/React.createElement(Card, {
    key: r.id,
    style: {
      marginBottom: "0.9rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setOpen(open === r.id ? null : r.id),
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.7rem",
      padding: "0.8rem 0.9rem",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-faint)",
      fontSize: "0.85rem",
      transform: open === r.id ? "rotate(90deg)" : "none",
      transition: "transform .15s"
    }
  }, "\u25B8"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "3.4rem",
      height: "3.4rem",
      background: "var(--sand)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "0.65rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--brown-light)"
    }
  }, "PDF")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 400,
      fontSize: "1.25rem",
      letterSpacing: "-0.01em"
    }
  }, r.vendor), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.8125rem",
      color: "var(--brown-mid)",
      marginTop: "0.25rem"
    }
  }, r.date, " \xB7 ", money(r.total), " \xB7 ", r.pending, " item", r.pending === 1 ? "" : "s", " pending")), /*#__PURE__*/React.createElement(StatusPill, {
    status: r.pending ? "in_progress" : "done",
    label: r.pending ? "Pending" : "Filed"
  })), open === r.id ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0.7rem 0.9rem 0.9rem",
      borderTop: "1px solid var(--border)"
    }
  }, r.items.map((it, i) => /*#__PURE__*/React.createElement(ListItem, {
    key: i,
    main: it.d,
    sub: it.s === "assigned" ? "Assigned to Kitchen › Backsplash tile" : "Unassigned",
    right: /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: "0.85rem"
      }
    }, money(it.a)), it.s === "pending" ? /*#__PURE__*/React.createElement(Button, {
      variant: "link"
    }, "Assign\u2026") : null)
  }))) : null)));
}
Object.assign(window, {
  ReceiptsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/studio/ReceiptsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/studio/data.js
try { (() => {
window.CLUB_LUCE_DATA = {
  houses: [{
    id: "rosewood",
    name: "Rosewood",
    address: "41 Rosewood Lane",
    purchasePrice: 412000
  }, {
    id: "cabin",
    name: "The Cabin",
    address: "Tatton Forest",
    purchasePrice: 96000
  }],
  rooms: [{
    id: "kitchen",
    houseId: "rosewood",
    name: "Kitchen"
  }, {
    id: "hall",
    houseId: "rosewood",
    name: "Entry hall"
  }, {
    id: "studio",
    houseId: "rosewood",
    name: "Studio"
  }, {
    id: "porch",
    houseId: "cabin",
    name: "Porch"
  }],
  details: [{
    id: "d1",
    houseId: "rosewood",
    roomId: "kitchen",
    name: "Backsplash tile",
    status: "in_progress",
    timeframe: "Sep '26",
    est: 800,
    act: 940,
    checklist: [true, true, false, false, false]
  }, {
    id: "d2",
    houseId: "rosewood",
    roomId: "kitchen",
    name: "Open shelving",
    status: "not_started",
    timeframe: "Oct '26",
    est: 220,
    act: 0,
    checklist: [false, false]
  }, {
    id: "d3",
    houseId: "rosewood",
    roomId: "hall",
    name: "Stair runner",
    status: "on_hold",
    timeframe: "Q1 '27",
    est: 640,
    act: 120,
    checklist: [true, false, false]
  }, {
    id: "d4",
    houseId: "rosewood",
    roomId: "studio",
    name: "Paint — lime wash",
    status: "done",
    timeframe: "Aug '26",
    est: 300,
    act: 265,
    checklist: [true, true, true]
  }, {
    id: "d5",
    houseId: "rosewood",
    roomId: "studio",
    name: "Pegboard wall",
    status: "in_progress",
    timeframe: "Sep '26",
    est: 150,
    act: 88,
    checklist: [true, false]
  }, {
    id: "d6",
    houseId: "cabin",
    roomId: "porch",
    name: "Re-hang the door",
    status: "not_started",
    timeframe: "Someday",
    est: 0,
    act: 0,
    checklist: []
  }],
  materials: [{
    id: "m1",
    detailId: "d1",
    description: "Zellige tile, 4×4, oatmeal",
    status: "need_to_source",
    qty: "38 sq ft"
  }, {
    id: "m2",
    detailId: "d1",
    description: "Tile adhesive + grout",
    status: "ordered",
    qty: "2 bags"
  }, {
    id: "m3",
    detailId: "d3",
    description: "Sisal runner, 27in",
    status: "need_to_source",
    qty: "14 ft"
  }, {
    id: "m4",
    detailId: "d5",
    description: "Birch ply, 12mm",
    status: "have",
    qty: "1 sheet"
  }],
  spend: [{
    id: "s1",
    detailId: "d1",
    description: "Zellige tile — deposit",
    vendor: "Otto Tiles",
    amount: 620
  }, {
    id: "s2",
    detailId: "d1",
    description: "Adhesive, grout, spacers",
    vendor: "Lowe's",
    amount: 320
  }, {
    id: "s3",
    detailId: "d3",
    description: "Runner samples",
    vendor: "Sisal Co",
    amount: 120
  }, {
    id: "s4",
    detailId: "d5",
    description: "Birch ply sheet",
    vendor: "Timber Yard",
    amount: 88
  }],
  inbox: [{
    id: "i1",
    text: "Tile grout colour — try the warm grey, not white",
    time: "Today, 9:14",
    photo: false
  }, {
    id: "i2",
    text: "",
    time: "Yesterday, 18:02",
    photo: true
  }, {
    id: "i3",
    text: "https://ottotiles.co.uk/zellige-oatmeal",
    time: "Yesterday, 11:47",
    photo: false
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/studio/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.PlanCard = __ds_scope.PlanCard;

__ds_ns.PullQuote = __ds_scope.PullQuote;

__ds_ns.SandBlock = __ds_scope.SandBlock;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.SiteFooter = __ds_scope.SiteFooter;

__ds_ns.SiteNav = __ds_scope.SiteNav;

__ds_ns.TextLink = __ds_scope.TextLink;

__ds_ns.BadgeCount = __ds_scope.BadgeCount;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Fab = __ds_scope.Fab;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.BudgetBar = __ds_scope.BudgetBar;

__ds_ns.ListItem = __ds_scope.ListItem;

__ds_ns.PanelCard = __ds_scope.PanelCard;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.SectionTitle = __ds_scope.SectionTitle;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.TotalsStrip = __ds_scope.TotalsStrip;

__ds_ns.ChecklistItem = __ds_scope.ChecklistItem;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TextInput = __ds_scope.TextInput;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.HouseTabs = __ds_scope.HouseTabs;

__ds_ns.TabNav = __ds_scope.TabNav;

__ds_ns.Modal = __ds_scope.Modal;

})();
