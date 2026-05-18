module.exports = [
"[project]/app/styleguide/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StyleGuidePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
// ── Token data — sourced from tokens.json (Figma: Tenengroup — Design System) ──
const THEMES = {
    TGR: {
        label: 'TGR — Theo Grace',
        fontMain: "'Lato', system-ui, sans-serif",
        fontMainName: 'Lato',
        fontSecondary: "'Big Caslon', Georgia, serif",
        fontSecondaryName: 'Big Caslon',
        textTransform: 'capitalize',
        btnLetterSpacing: 0,
        colors: {
            background: '#ffffff',
            brandPrimary: '#1e1e1e',
            brandSecondary: '#ffffff',
            textPrimary: '#1e1e1e',
            textSecondary: '#808080',
            textDisabled: '#f8f8f8',
            surfacePrimary: '#f8f8f8',
            surfaceSecondary: '#f4f1ee',
            surfaceDisabled: '#808080',
            error: '#b6475f',
            warning: '#f36641',
            success: '#478978',
            info: '#e6f0f8',
            border: '#ebebeb',
            inputBg: '#ffffff',
            inputBorder: '#ebebeb',
            inputText: '#1e1e1e',
            inputPlaceholder: '#808080',
            cardImageBg: '#f6f8fa'
        },
        buttons: [
            {
                label: 'Primary',
                bg: '#1e1e1e',
                text: '#ffffff',
                border: 'transparent'
            },
            {
                label: 'Secondary',
                bg: '#ffffff',
                text: '#1e1e1e',
                border: '#1e1e1e'
            },
            {
                label: 'Add to Cart',
                bg: '#1e1e1e',
                text: '#ffffff',
                border: 'transparent'
            },
            {
                label: 'Preview',
                bg: '#e6f0f8',
                text: '#1e1e1e',
                border: '#e6f0f8'
            },
            {
                label: 'Disabled',
                bg: '#808080',
                text: '#f8f8f8',
                border: '#808080'
            },
            {
                label: 'Danger',
                bg: '#8e0000',
                text: '#ffffff',
                border: '#8e0000'
            },
            {
                label: 'Success',
                bg: '#2b8b68',
                text: '#ffffff',
                border: '#2b8b68'
            },
            {
                label: 'Link',
                bg: 'transparent',
                text: '#1e1e1e',
                border: 'transparent',
                link: true
            }
        ],
        radius: {
            button: 100,
            ribbon: 100,
            input: 4,
            lg: 12
        },
        ribbons: [
            {
                label: 'Default',
                bg: '#bedff7',
                text: '#1e1e1e'
            },
            {
                label: 'Bundle',
                bg: '#478978',
                text: '#ffffff'
            },
            {
                label: 'OOS',
                bg: '#808080',
                text: '#ffffff'
            },
            {
                label: 'Secondary',
                bg: '#1e1e1e',
                text: '#ffffff'
            }
        ],
        price: {
            selling: '#1e1e1e',
            crossed: '#808080',
            discountText: '#1e1e1e',
            discountBg: '#f8f8f8'
        }
    },
    OAL: {
        label: 'OAL — Oak and Luna',
        fontMain: "GillSans, 'Gill Sans MT', 'Century Gothic', sans-serif",
        fontMainName: 'Gill Sans',
        fontSecondary: "'Bebas Neue', sans-serif",
        fontSecondaryName: 'Bebas Neue',
        fontTertiary: "'Akatab', sans-serif",
        fontTertiaryName: 'Akatab',
        ribbonFont: "'Bebas Neue', sans-serif",
        textTransform: 'uppercase',
        boldWeight: 600,
        colors: {
            background: '#ffffff',
            brandPrimary: '#000000',
            brandSecondary: '#ffffff',
            textPrimary: '#000000',
            textSecondary: '#808080',
            textDisabled: '#9b9b9b',
            surfacePrimary: '#f8f8f8',
            surfaceSecondary: '#f8f8f8',
            surfaceDisabled: '#f8f8f8',
            error: '#8e0000',
            warning: '#cd644c',
            success: '#2b8b68',
            info: '#393781',
            border: '#ebebeb',
            inputBg: '#ffffff',
            inputBorder: '#000000',
            inputText: '#000000',
            inputPlaceholder: '#808080',
            cardImageBg: '#ffffff'
        },
        buttons: [
            {
                label: 'Primary',
                bg: '#000000',
                text: '#ffffff',
                border: 'transparent'
            },
            {
                label: 'Secondary',
                bg: 'transparent',
                text: '#000000',
                border: '#000000'
            },
            {
                label: 'Add to Cart',
                bg: '#f8f8f8',
                text: '#000000',
                border: 'transparent'
            },
            {
                label: 'Preview',
                bg: '#f8f8f8',
                text: '#000000',
                border: '#000000'
            },
            {
                label: 'Disabled',
                bg: '#f5f5f5',
                text: '#989898',
                border: '#f5f5f5'
            },
            {
                label: 'Danger',
                bg: '#8e0000',
                text: '#ffffff',
                border: '#8e0000'
            },
            {
                label: 'Success',
                bg: '#2b8b68',
                text: '#ffffff',
                border: '#2b8b68'
            },
            {
                label: 'Link',
                bg: 'transparent',
                text: '#000000',
                border: 'transparent',
                link: true
            }
        ],
        radius: {
            button: 0,
            ribbon: 0,
            input: 4,
            lg: 16
        },
        ribbons: [
            {
                label: 'Default',
                bg: '#ffffff',
                text: '#000000'
            },
            {
                label: 'Bundle',
                bg: '#000000',
                text: '#ffffff'
            },
            {
                label: 'OOS',
                bg: '#808080',
                text: '#ffffff'
            },
            {
                label: 'Secondary',
                bg: '#000000',
                text: '#ffffff'
            }
        ],
        price: {
            selling: '#000000',
            crossed: '#808080',
            discountText: '#000000',
            discountBg: '#f8f8f8'
        },
        typeOverrides: {
            headline4: {
                family: 'secondary'
            },
            headline5: {
                family: 'secondary'
            },
            headline7: {
                family: 'main'
            },
            headline8: {
                family: 'tertiary'
            }
        }
    },
    LAL: {
        label: 'LAL — Lime and Lou',
        fontMain: "'Poppins', system-ui, sans-serif",
        fontMainName: 'Poppins',
        fontSecondary: "'EB Garamond', Georgia, serif",
        fontSecondaryName: 'EB Garamond',
        textTransform: 'uppercase',
        colors: {
            background: '#ffffff',
            brandPrimary: '#e8ff36',
            brandSecondary: '#000000',
            textPrimary: '#000000',
            textSecondary: '#989898',
            textDisabled: '#f5f5f5',
            surfacePrimary: '#f5f5f5',
            surfaceSecondary: '#ebe2de',
            surfaceDisabled: '#e3e3e3',
            error: '#8e0000',
            warning: '#f36641',
            success: '#2b8b68',
            info: '#000000',
            border: '#e3e3e3',
            inputBg: '#ffffff',
            inputBorder: '#e3e3e3',
            inputText: '#000000',
            inputPlaceholder: '#989898',
            cardImageBg: '#ffffff'
        },
        buttons: [
            {
                label: 'Primary',
                bg: '#000000',
                text: '#ffffff',
                border: 'transparent'
            },
            {
                label: 'Secondary',
                bg: 'transparent',
                text: '#000000',
                border: '#000000'
            },
            {
                label: 'Add to Cart',
                bg: '#e8ff36',
                text: '#000000',
                border: 'transparent'
            },
            {
                label: 'Preview',
                bg: '#ebe2de',
                text: '#000000',
                border: '#ebe2de'
            },
            {
                label: 'Disabled',
                bg: '#f5f5f5',
                text: '#989898',
                border: '#f5f5f5'
            },
            {
                label: 'Danger',
                bg: '#8e0000',
                text: '#ffffff',
                border: '#8e0000'
            },
            {
                label: 'Success',
                bg: '#2b8b68',
                text: '#ffffff',
                border: '#2b8b68'
            },
            {
                label: 'Link',
                bg: 'transparent',
                text: '#000000',
                border: 'transparent',
                link: true
            }
        ],
        radius: {
            button: 0,
            ribbon: 0,
            input: 8,
            lg: 16
        },
        ribbons: [
            {
                label: 'Default',
                bg: '#000000',
                text: '#ffffff'
            },
            {
                label: 'Bundle',
                bg: '#e8ff36',
                text: '#000000'
            },
            {
                label: 'OOS',
                bg: '#808080',
                text: '#ffffff'
            },
            {
                label: 'Secondary',
                bg: '#e8ff36',
                text: '#000000'
            }
        ],
        price: {
            selling: '#8e0000',
            crossed: '#989898',
            discountText: '#000000',
            discountBg: '#f8f8f8'
        }
    },
    IB: {
        label: 'IB — Israel Blessing',
        fontMain: "'Assistant', system-ui, sans-serif",
        fontMainName: 'Assistant',
        fontSecondary: "'Assistant', system-ui, sans-serif",
        fontSecondaryName: 'Assistant',
        textTransform: 'uppercase',
        colors: {
            background: '#ffffff',
            brandPrimary: '#122f4f',
            brandSecondary: '#ffffff',
            textPrimary: '#122f4f',
            textSecondary: '#bebebe',
            textDisabled: '#f8f8f8',
            surfacePrimary: '#f3f5f6',
            surfaceSecondary: '#f9f8f7',
            surfaceDisabled: '#e0dcd5',
            error: '#bc0000',
            warning: '#f36641',
            success: '#2b8b68',
            info: '#4a5f7f',
            border: '#ebebeb',
            inputBg: '#f3f5f6',
            inputBorder: '#ebebeb',
            inputText: '#122f4f',
            inputPlaceholder: '#bebebe',
            cardImageBg: '#f9f8f7'
        },
        buttons: [
            {
                label: 'Primary',
                bg: '#8e9279',
                text: '#ffffff',
                border: '#8e9279'
            },
            {
                label: 'Secondary',
                bg: '#ffffff',
                text: '#122f4f',
                border: '#122f4f'
            },
            {
                label: 'Add to Cart',
                bg: '#122f4f',
                text: '#ffffff',
                border: '#122f4f'
            },
            {
                label: 'Preview',
                bg: '#f9f8f7',
                text: '#122f4f',
                border: '#f9f8f7'
            },
            {
                label: 'Disabled',
                bg: '#f8f8f8',
                text: '#bebebe',
                border: '#f8f8f8'
            },
            {
                label: 'Danger',
                bg: '#bc0000',
                text: '#ffffff',
                border: '#bc0000'
            },
            {
                label: 'Success',
                bg: '#2b8b68',
                text: '#ffffff',
                border: '#2b8b68'
            },
            {
                label: 'Link',
                bg: 'transparent',
                text: '#122f4f',
                border: 'transparent',
                link: true
            }
        ],
        radius: {
            button: 4,
            ribbon: 0,
            input: 4,
            lg: 16
        },
        ribbons: [
            {
                label: 'Default',
                bg: '#8e9279',
                text: '#ffffff'
            },
            {
                label: 'Bundle',
                bg: '#a3754d',
                text: '#ffffff'
            },
            {
                label: 'OOS',
                bg: '#808080',
                text: '#ffffff'
            },
            {
                label: 'Secondary',
                bg: '#8e9279',
                text: '#ffffff'
            }
        ],
        price: {
            selling: '#122f4f',
            crossed: '#122f4f',
            discountText: '#122f4f',
            discountBg: '#f3f5f6'
        }
    },
    MNN: {
        label: 'MNN — MYKA',
        fontMain: "'Ano', 'Arial Narrow', sans-serif",
        fontMainName: 'Ano',
        fontSecondary: "'Ano', 'Arial Narrow', sans-serif",
        fontSecondaryName: 'Ano (Mafra)',
        btnFontSize: 14,
        textTransform: 'uppercase',
        colors: {
            background: '#ffffff',
            brandPrimary: '#000000',
            brandSecondary: '#ffffff',
            textPrimary: '#000000',
            textSecondary: '#808080',
            textDisabled: '#f8f8f8',
            surfacePrimary: '#f7f7f4',
            surfaceSecondary: '#f4eee9',
            surfaceDisabled: '#808080',
            error: '#bc0000',
            warning: '#ef7d60',
            success: '#2b8b68',
            info: '#548fcb',
            border: '#ebebeb',
            inputBg: '#f7f7f4',
            inputBorder: '#ebebeb',
            inputText: '#000000',
            inputPlaceholder: '#808080',
            cardImageBg: '#f7f7f4'
        },
        buttons: [
            {
                label: 'Primary',
                bg: '#000000',
                text: '#ffffff',
                border: '#000000'
            },
            {
                label: 'Secondary',
                bg: 'transparent',
                text: '#000000',
                border: '#000000'
            },
            {
                label: 'Add to Cart',
                bg: '#e6c379',
                text: '#000000',
                border: 'transparent'
            },
            {
                label: 'Preview',
                bg: '#f7f7f4',
                text: '#000000',
                border: '#000000'
            },
            {
                label: 'Disabled',
                bg: '#f8f8f8',
                text: '#808080',
                border: '#f8f8f8'
            },
            {
                label: 'Danger',
                bg: '#8e0000',
                text: '#ffffff',
                border: '#8e0000'
            },
            {
                label: 'Success',
                bg: '#2b8b68',
                text: '#ffffff',
                border: '#2b8b68'
            },
            {
                label: 'Link',
                bg: 'transparent',
                text: '#000000',
                border: 'transparent',
                link: true
            }
        ],
        radius: {
            button: 4,
            ribbon: 100,
            input: 4,
            lg: 12
        },
        ribbons: [
            {
                label: 'Default',
                bg: '#ffffff',
                text: '#000000'
            },
            {
                label: 'Bundle',
                bg: '#09391e',
                text: '#ffffff'
            },
            {
                label: 'OOS',
                bg: '#808080',
                text: '#ffffff'
            },
            {
                label: 'Secondary',
                bg: '#000000',
                text: '#ffffff'
            }
        ],
        price: {
            selling: '#bc0000',
            crossed: '#808080',
            discountText: '#000000',
            discountBg: '#f7f7f4'
        }
    }
};
const TYPE_SCALE = {
    headlines: [
        {
            token: 'headline1',
            fs: 40,
            lh: 48,
            fw: 400,
            family: 'secondary',
            mob: '30px mob'
        },
        {
            token: 'headline2',
            fs: 28,
            lh: 36,
            fw: 400,
            family: 'secondary',
            mob: '20px mob'
        },
        {
            token: 'headline3',
            fs: 28,
            lh: 36,
            fw: 400,
            family: 'secondary',
            mob: '20px mob'
        },
        {
            token: 'headline4',
            fs: 24,
            lh: 28,
            fw: 400,
            family: 'main'
        },
        {
            token: 'headline5',
            fs: 20,
            lh: 24,
            fw: 300,
            family: 'main'
        },
        {
            token: 'headline6',
            fs: 16,
            lh: 20,
            fw: 400,
            family: 'secondary'
        },
        {
            token: 'headline7',
            fs: 14,
            lh: 20,
            fw: 400,
            family: 'tertiary'
        },
        {
            token: 'headline8',
            fs: 16,
            lh: 20,
            fw: 400,
            family: 'main',
            transform: 'uppercase'
        },
        {
            token: 'headline9',
            fs: 24,
            lh: 28,
            fw: 400,
            family: 'secondary',
            mob: '16px mob'
        }
    ],
    paragraphs: [
        {
            token: 'paragraph1',
            fs: 18,
            lh: 22,
            fw: 400,
            family: 'main'
        },
        {
            token: 'paragraph2',
            fs: 18,
            lh: 22,
            fw: 700,
            family: 'main'
        },
        {
            token: 'paragraph3',
            fs: 16,
            lh: 22,
            fw: 700,
            family: 'main'
        },
        {
            token: 'paragraph4',
            fs: 16,
            lh: 22,
            fw: 400,
            family: 'main'
        }
    ],
    body: [
        {
            token: 'text1',
            fs: 14,
            lh: 20,
            fw: 400,
            family: 'main'
        },
        {
            token: 'text2',
            fs: 14,
            lh: 20,
            fw: 700,
            family: 'main'
        },
        {
            token: 'text3',
            fs: 12,
            lh: 16,
            fw: 400,
            family: 'main'
        },
        {
            token: 'text4',
            fs: 12,
            lh: 16,
            fw: 700,
            family: 'main'
        },
        {
            token: 'text7',
            fs: 14,
            lh: 20,
            fw: 300,
            family: 'main'
        },
        {
            token: 'text8',
            fs: 10,
            lh: 14,
            fw: 400,
            family: 'main'
        },
        {
            token: 'text9',
            fs: 10,
            lh: 14,
            fw: 700,
            family: 'main'
        }
    ],
    ui: [
        {
            token: 'caption1',
            fs: 12,
            lh: 16,
            fw: 400,
            family: 'main'
        },
        {
            token: 'caption2',
            fs: 12,
            lh: 16,
            fw: 700,
            family: 'main'
        },
        {
            token: 'disclaimer1',
            fs: 10,
            lh: 14,
            fw: 400,
            family: 'main'
        },
        {
            token: 'disclaimer2',
            fs: 10,
            lh: 14,
            fw: 700,
            family: 'main'
        },
        {
            token: 'button',
            fs: 16,
            lh: 24,
            fw: 700,
            family: 'tertiary'
        },
        {
            token: 'button2',
            fs: 14,
            lh: 20,
            fw: 400,
            family: 'main'
        },
        {
            token: 'link',
            fs: 14,
            lh: 20,
            fw: 500,
            family: 'main',
            decoration: 'underline'
        },
        {
            token: 'ribbon',
            fs: 14,
            lh: 20,
            fw: 400,
            family: 'secondary',
            mob: '12px mob'
        }
    ]
};
// ── Helpers ───────────────────────────────────────────────────────────────────
function resolveFont(family, theme) {
    if (family === 'secondary') return theme.fontSecondary;
    if (family === 'tertiary') return theme.fontTertiary ?? theme.fontMain;
    return theme.fontMain;
}
function resolveFontName(family, theme) {
    if (family === 'secondary') return theme.fontSecondaryName;
    if (family === 'tertiary') return theme.fontTertiaryName ?? theme.fontMainName;
    return theme.fontMainName;
}
// ── Sub-components ────────────────────────────────────────────────────────────
function SwatchCard({ name, hex }) {
    const display = hex === 'transparent' ? 'rgba(0,0,0,0)' : hex;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: 'max-content',
            minWidth: 64
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: '1px solid #ebebeb',
                    background: display,
                    marginBottom: 6
                }
            }, void 0, false, {
                fileName: "[project]/app/styleguide/page.tsx",
                lineNumber: 285,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: 10,
                    fontWeight: 600,
                    lineHeight: 1.4
                },
                children: name
            }, void 0, false, {
                fileName: "[project]/app/styleguide/page.tsx",
                lineNumber: 286,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: 10,
                    color: '#808080',
                    fontFamily: 'monospace'
                },
                children: hex
            }, void 0, false, {
                fileName: "[project]/app/styleguide/page.tsx",
                lineNumber: 287,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/styleguide/page.tsx",
        lineNumber: 284,
        columnNumber: 5
    }, this);
}
function TypeRow({ entry, theme }) {
    const override = theme.typeOverrides?.[entry.token];
    const family = override?.family ?? entry.family;
    const ff = resolveFont(family, theme);
    const ffName = resolveFontName(family, theme);
    const fw = entry.fw === 700 && entry.family !== 'secondary' ? theme.boldWeight ?? 700 : entry.fw;
    const details = `${entry.fs}px / ${entry.lh}px · w${fw} · ${ffName}${entry.mob ? ' · ' + entry.mob : ''}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            alignItems: 'center',
            gap: 20,
            padding: '10px 0',
            borderBottom: '1px solid #ebebeb'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                        style: {
                            fontSize: 10,
                            background: '#f8f8f8',
                            padding: '2px 7px',
                            borderRadius: 4,
                            fontFamily: 'monospace',
                            display: 'inline-block',
                            marginBottom: 4
                        },
                        children: entry.token
                    }, void 0, false, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 302,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 10,
                            color: '#808080',
                            fontFamily: 'monospace'
                        },
                        children: details
                    }, void 0, false, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 305,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/styleguide/page.tsx",
                lineNumber: 301,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    fontFamily: ff,
                    fontSize: Math.min(entry.fs, 34),
                    lineHeight: `${entry.lh}px`,
                    fontWeight: fw,
                    textTransform: entry.transform ?? 'none',
                    textDecoration: entry.decoration ?? 'none'
                },
                children: "The quick brown fox jumps over the lazy dog"
            }, void 0, false, {
                fileName: "[project]/app/styleguide/page.tsx",
                lineNumber: 307,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/styleguide/page.tsx",
        lineNumber: 300,
        columnNumber: 5
    }, this);
}
// ── Page ──────────────────────────────────────────────────────────────────────
const THEME_KEYS = [
    'TGR',
    'OAL',
    'LAL',
    'IB',
    'MNN'
];
const NAV_SECTIONS = [
    {
        id: 'colors',
        label: 'Colors'
    },
    {
        id: 'buttons',
        label: 'Buttons'
    },
    {
        id: 'ribbons',
        label: 'Ribbons & Price'
    },
    {
        id: 'inputs',
        label: 'Inputs'
    },
    {
        id: 'typography',
        label: 'Typography'
    },
    {
        id: 'spacing',
        label: 'Spacing'
    },
    {
        id: 'radius',
        label: 'Radius'
    },
    {
        id: 'shadows',
        label: 'Shadows'
    },
    {
        id: 'breakpoints',
        label: 'Breakpoints'
    }
];
function StyleGuidePage() {
    const [activeTheme, setActiveTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('TGR');
    const [activeSection, setActiveSection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('colors');
    const theme = THEMES[activeTheme];
    const c = theme.colors;
    const r = theme.radius;
    // Sticky nav highlight via IntersectionObserver
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const sections = document.querySelectorAll('section[data-section]');
        const io = new IntersectionObserver((entries)=>{
            entries.forEach((e)=>{
                if (e.isIntersecting) setActiveSection(e.target.dataset.section ?? '');
            });
        }, {
            threshold: 0.25
        });
        sections.forEach((s)=>io.observe(s));
        return ()=>io.disconnect();
    }, []);
    const btnType = TYPE_SCALE.ui.find((e)=>e.token === 'button');
    const ribbonType = TYPE_SCALE.ui.find((e)=>e.token === 'ribbon');
    const btnFs = theme.btnFontSize ?? btnType.fs;
    const btnFw = theme.boldWeight ?? btnType.fw;
    const colorGroups = [
        {
            group: 'Brand',
            tokens: [
                [
                    'brand/primary',
                    c.brandPrimary
                ],
                [
                    'brand/secondary',
                    c.brandSecondary
                ],
                [
                    'background',
                    c.background
                ]
            ]
        },
        {
            group: 'Text',
            tokens: [
                [
                    'text/primary',
                    c.textPrimary
                ],
                [
                    'text/secondary',
                    c.textSecondary
                ],
                [
                    'text/disabled',
                    c.textDisabled
                ]
            ]
        },
        {
            group: 'Surface',
            tokens: [
                [
                    'surface/primary',
                    c.surfacePrimary
                ],
                [
                    'surface/secondary',
                    c.surfaceSecondary
                ],
                [
                    'surface/disabled',
                    c.surfaceDisabled
                ]
            ]
        },
        {
            group: 'Feedback',
            tokens: [
                [
                    'error',
                    c.error
                ],
                [
                    'warning',
                    c.warning
                ],
                [
                    'success',
                    c.success
                ],
                [
                    'info',
                    c.info
                ]
            ]
        },
        {
            group: 'UI',
            tokens: [
                [
                    'border',
                    c.border
                ],
                [
                    'card/image-bg',
                    c.cardImageBg
                ]
            ]
        }
    ];
    const showSecondary = theme.fontSecondaryName !== theme.fontMainName;
    const showTertiary = theme.fontTertiaryName && theme.fontTertiaryName !== theme.fontMainName && theme.fontTertiaryName !== theme.fontSecondaryName;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: theme.fontMain,
            color: c.textPrimary,
            background: '#ffffff',
            minHeight: '100vh',
            margin: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                style: {
                    background: '#ffffff',
                    color: '#111',
                    padding: '28px 64px 24px',
                    borderBottom: '1px solid #ebebeb'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 11,
                            letterSpacing: '0.08em',
                            opacity: 0.45,
                            marginBottom: 5
                        },
                        children: "Tenengroup Design System · 5 Brand Themes · Source: Figma → Tenengroup — Design System → tokens.json"
                    }, void 0, false, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 381,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            fontSize: 34,
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            margin: 0
                        },
                        children: "Style Guide"
                    }, void 0, false, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 384,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 12,
                            opacity: 0.4,
                            fontFamily: 'monospace',
                            marginTop: 5
                        },
                        children: "tokens.json extracted 2026-05-18 · 4 Figma variable collections · Color · Radius · Spacing · Fonts"
                    }, void 0, false, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 385,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/styleguide/page.tsx",
                lineNumber: 380,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#ffffff',
                    borderBottom: '1px solid #ebebeb',
                    padding: '10px 64px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    position: 'sticky',
                    top: 0,
                    zIndex: 101
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'rgba(0,0,0,0.35)',
                            marginRight: 4
                        },
                        children: "Theme"
                    }, void 0, false, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 392,
                        columnNumber: 9
                    }, this),
                    THEME_KEYS.map((key)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setActiveTheme(key),
                            style: {
                                padding: '5px 14px',
                                borderRadius: 100,
                                border: '1px solid',
                                borderColor: activeTheme === key ? '#111' : 'rgba(0,0,0,0.2)',
                                background: activeTheme === key ? '#111' : 'transparent',
                                color: activeTheme === key ? '#fff' : 'rgba(0,0,0,0.45)',
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: 'all 0.15s'
                            },
                            children: key
                        }, key, false, {
                            fileName: "[project]/app/styleguide/page.tsx",
                            lineNumber: 394,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/app/styleguide/page.tsx",
                lineNumber: 391,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                style: {
                    background: '#f8f8f8',
                    borderBottom: '1px solid #ebebeb',
                    padding: '0 64px',
                    display: 'flex',
                    gap: 0,
                    position: 'sticky',
                    top: 46,
                    zIndex: 100,
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                },
                children: NAV_SECTIONS.map(({ id, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: `#${id}`,
                        style: {
                            display: 'block',
                            whiteSpace: 'nowrap',
                            padding: '13px 16px',
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            textDecoration: 'none',
                            color: activeSection === id ? c.textPrimary : '#808080',
                            borderBottom: activeSection === id ? `2px solid ${c.brandPrimary}` : '2px solid transparent',
                            transition: 'color 0.15s, border-color 0.15s',
                            fontFamily: theme.fontMain
                        },
                        children: label
                    }, id, false, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 418,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/styleguide/page.tsx",
                lineNumber: 412,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 64px 80px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "data-section": "colors",
                        id: "colors",
                        style: {
                            paddingTop: 52
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#808080',
                                    marginBottom: 28
                                },
                                children: "01 — Colors"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 439,
                                columnNumber: 11
                            }, this),
                            colorGroups.map(({ group, tokens })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: '#808080',
                                                margin: '20px 0 10px'
                                            },
                                            children: group
                                        }, void 0, false, {
                                            fileName: "[project]/app/styleguide/page.tsx",
                                            lineNumber: 444,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 10,
                                                marginBottom: 4
                                            },
                                            children: tokens.map(([name, hex])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SwatchCard, {
                                                    name: name,
                                                    hex: hex
                                                }, name, false, {
                                                    fileName: "[project]/app/styleguide/page.tsx",
                                                    lineNumber: 447,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/styleguide/page.tsx",
                                            lineNumber: 445,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, group, true, {
                                    fileName: "[project]/app/styleguide/page.tsx",
                                    lineNumber: 443,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 438,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "data-section": "buttons",
                        id: "buttons",
                        style: {
                            paddingTop: 52,
                            borderTop: '1px solid #ebebeb',
                            marginTop: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#808080',
                                    marginBottom: 28
                                },
                                children: "02 — Button Variants"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 456,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 16,
                                    alignItems: 'flex-start'
                                },
                                children: theme.buttons.filter((btn)=>btn.label !== 'Danger' && btn.label !== 'Success').map((btn)=>{
                                    const br = btn.link ? 0 : r.button;
                                    const fs = btnFs;
                                    const lh = btnType.lh;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 6
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: '#808080',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em'
                                                },
                                                children: btn.label
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 466,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: btn.link ? '8px 4px' : '10px 22px',
                                                    border: btn.link ? 'none' : '1px solid',
                                                    borderColor: btn.border,
                                                    borderRadius: br,
                                                    background: btn.bg,
                                                    color: btn.text,
                                                    fontWeight: btn.link ? 'inherit' : btnFw,
                                                    fontSize: fs,
                                                    lineHeight: `${lh}px`,
                                                    fontFamily: theme.fontMain,
                                                    textTransform: theme.textTransform,
                                                    letterSpacing: theme.btnLetterSpacing !== undefined ? theme.btnLetterSpacing : '0.04em',
                                                    textDecoration: btn.link ? 'underline' : 'none',
                                                    cursor: 'default',
                                                    textAlign: 'center'
                                                },
                                                children: btn.label
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 467,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 9,
                                                    color: '#808080',
                                                    fontFamily: 'monospace'
                                                },
                                                children: [
                                                    fs,
                                                    "px / lh",
                                                    lh,
                                                    " · w",
                                                    btnFw,
                                                    " · bg ",
                                                    btn.bg
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 486,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, btn.label, true, {
                                        fileName: "[project]/app/styleguide/page.tsx",
                                        lineNumber: 465,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 459,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 455,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "data-section": "ribbons",
                        id: "ribbons",
                        style: {
                            paddingTop: 52,
                            borderTop: '1px solid #ebebeb',
                            marginTop: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#808080',
                                    marginBottom: 28
                                },
                                children: "03 — Ribbons & Price"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 497,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#808080',
                                    margin: '0 0 10px'
                                },
                                children: "Ribbons"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 500,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 16,
                                    alignItems: 'flex-start'
                                },
                                children: theme.ribbons.map((rb)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 6
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: '#808080',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em'
                                                },
                                                children: rb.label
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 504,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '4px 12px',
                                                    background: rb.bg,
                                                    color: rb.text,
                                                    borderRadius: r.ribbon,
                                                    fontFamily: theme.ribbonFont ?? theme.fontMain,
                                                    fontSize: ribbonType.fs,
                                                    lineHeight: `${ribbonType.lh}px`,
                                                    fontWeight: ribbonType.fw,
                                                    textTransform: theme.textTransform,
                                                    display: 'inline-block',
                                                    width: 'fit-content'
                                                },
                                                children: rb.label
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 505,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 9,
                                                    color: '#808080',
                                                    fontFamily: 'monospace'
                                                },
                                                children: [
                                                    "bg ",
                                                    rb.bg,
                                                    " · text ",
                                                    rb.text,
                                                    " · r:",
                                                    r.ribbon,
                                                    "px"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 520,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, rb.label, true, {
                                        fileName: "[project]/app/styleguide/page.tsx",
                                        lineNumber: 503,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 501,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#808080',
                                    margin: '28px 0 10px'
                                },
                                children: "Price"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 527,
                                columnNumber: 11
                            }, this),
                            [
                                {
                                    selling: theme.price.selling,
                                    crossed: theme.price.crossed,
                                    discount: true
                                },
                                {
                                    selling: theme.price.selling,
                                    crossed: null,
                                    discount: false
                                }
                            ].map((row, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: 10,
                                        padding: '12px 0',
                                        borderBottom: '1px solid #ebebeb'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: 18,
                                                fontWeight: theme.boldWeight ?? 700,
                                                color: row.selling
                                            },
                                            children: "$99.00"
                                        }, void 0, false, {
                                            fileName: "[project]/app/styleguide/page.tsx",
                                            lineNumber: 533,
                                            columnNumber: 15
                                        }, this),
                                        row.crossed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: 16,
                                                textDecoration: 'line-through',
                                                color: row.crossed
                                            },
                                            children: "$149.00"
                                        }, void 0, false, {
                                            fileName: "[project]/app/styleguide/page.tsx",
                                            lineNumber: 534,
                                            columnNumber: 31
                                        }, this),
                                        row.discount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: 11,
                                                fontWeight: theme.boldWeight ?? 700,
                                                padding: '2px 8px',
                                                borderRadius: 4,
                                                color: theme.price.discountText,
                                                background: theme.price.discountBg
                                            },
                                            children: "–33%"
                                        }, void 0, false, {
                                            fileName: "[project]/app/styleguide/page.tsx",
                                            lineNumber: 536,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: 10,
                                                fontFamily: 'monospace',
                                                color: '#808080',
                                                marginLeft: 8
                                            },
                                            children: row.discount ? 'price/selling · price/crossed · price/discount' : 'price/selling (no discount)'
                                        }, void 0, false, {
                                            fileName: "[project]/app/styleguide/page.tsx",
                                            lineNumber: 538,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/app/styleguide/page.tsx",
                                    lineNumber: 532,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 496,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "data-section": "inputs",
                        id: "inputs",
                        style: {
                            paddingTop: 52,
                            borderTop: '1px solid #ebebeb',
                            marginTop: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#808080',
                                    marginBottom: 28
                                },
                                children: "04 — Form Inputs"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 547,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 24,
                                    maxWidth: 800
                                },
                                children: [
                                    [
                                        {
                                            label: 'Text Input',
                                            placeholder: 'Placeholder text',
                                            value: undefined
                                        },
                                        {
                                            label: 'With Value',
                                            placeholder: undefined,
                                            value: 'user@example.com'
                                        }
                                    ].map(({ label, placeholder, value })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                flex: 1,
                                                minWidth: 220
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        color: c.textSecondary,
                                                        marginBottom: 6,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.06em'
                                                    },
                                                    children: label
                                                }, void 0, false, {
                                                    fileName: "[project]/app/styleguide/page.tsx",
                                                    lineNumber: 556,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    defaultValue: value,
                                                    placeholder: placeholder,
                                                    style: {
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        background: c.inputBg,
                                                        border: `1px solid ${c.inputBorder}`,
                                                        borderRadius: r.input,
                                                        color: c.inputText,
                                                        fontFamily: theme.fontMain,
                                                        fontSize: 14,
                                                        outline: 'none'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/app/styleguide/page.tsx",
                                                    lineNumber: 557,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 9,
                                                        color: c.textSecondary,
                                                        fontFamily: 'monospace',
                                                        marginTop: 4
                                                    },
                                                    children: [
                                                        "bg ",
                                                        c.inputBg,
                                                        " · border ",
                                                        c.inputBorder,
                                                        " · r:",
                                                        r.input,
                                                        "px"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/styleguide/page.tsx",
                                                    lineNumber: 572,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, label, true, {
                                            fileName: "[project]/app/styleguide/page.tsx",
                                            lineNumber: 555,
                                            columnNumber: 15
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1,
                                            minWidth: 220
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    color: c.textSecondary,
                                                    marginBottom: 6,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em'
                                                },
                                                children: "Checkbox"
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 578,
                                                columnNumber: 15
                                            }, this),
                                            [
                                                [
                                                    'Checked state',
                                                    true
                                                ],
                                                [
                                                    'Unchecked state',
                                                    false
                                                ]
                                            ].map(([label, checked], i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        cursor: 'pointer',
                                                        fontFamily: theme.fontMain,
                                                        fontSize: 14,
                                                        color: c.textPrimary,
                                                        marginTop: i > 0 ? 8 : 0
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            defaultChecked: checked,
                                                            style: {
                                                                accentColor: c.brandPrimary,
                                                                width: 16,
                                                                height: 16,
                                                                cursor: 'pointer'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/styleguide/page.tsx",
                                                            lineNumber: 581,
                                                            columnNumber: 19
                                                        }, this),
                                                        label
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/app/styleguide/page.tsx",
                                                    lineNumber: 580,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/styleguide/page.tsx",
                                        lineNumber: 577,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 550,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 546,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "data-section": "typography",
                        id: "typography",
                        style: {
                            paddingTop: 52,
                            borderTop: '1px solid #ebebeb',
                            marginTop: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#808080',
                                    marginBottom: 28
                                },
                                children: "05 — Typography"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 591,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 40,
                                    flexWrap: 'wrap',
                                    marginBottom: 28
                                },
                                children: [
                                    {
                                        label: `Main — ${theme.fontMainName}`,
                                        family: theme.fontMain
                                    },
                                    ...showSecondary ? [
                                        {
                                            label: `Secondary — ${theme.fontSecondaryName}`,
                                            family: theme.fontSecondary
                                        }
                                    ] : [],
                                    ...showTertiary ? [
                                        {
                                            label: `Tertiary — ${theme.fontTertiaryName}`,
                                            family: theme.fontTertiary
                                        }
                                    ] : []
                                ].map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 11,
                                                    color: c.textSecondary,
                                                    marginBottom: 6
                                                },
                                                children: f.label
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 601,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: f.family,
                                                    fontSize: 22,
                                                    fontWeight: 400
                                                },
                                                children: "The quick brown fox"
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 602,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: f.family,
                                                    fontSize: 22,
                                                    fontWeight: theme.boldWeight ?? 700,
                                                    marginTop: 2
                                                },
                                                children: "The quick brown fox"
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 603,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, f.label, true, {
                                        fileName: "[project]/app/styleguide/page.tsx",
                                        lineNumber: 600,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 594,
                                columnNumber: 11
                            }, this),
                            [
                                {
                                    label: 'Headlines',
                                    entries: TYPE_SCALE.headlines
                                },
                                {
                                    label: 'Paragraphs',
                                    entries: TYPE_SCALE.paragraphs
                                },
                                {
                                    label: 'Body Text',
                                    entries: TYPE_SCALE.body
                                },
                                {
                                    label: 'Captions, Disclaimers & UI',
                                    entries: TYPE_SCALE.ui
                                }
                            ].map(({ label, entries })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: '#808080',
                                                margin: '20px 0 10px'
                                            },
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/app/styleguide/page.tsx",
                                            lineNumber: 615,
                                            columnNumber: 15
                                        }, this),
                                        entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TypeRow, {
                                                entry: entry,
                                                theme: theme
                                            }, entry.token, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 617,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, label, true, {
                                    fileName: "[project]/app/styleguide/page.tsx",
                                    lineNumber: 614,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 590,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "data-section": "spacing",
                        id: "spacing",
                        style: {
                            paddingTop: 52,
                            borderTop: '1px solid #ebebeb',
                            marginTop: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#808080',
                                    marginBottom: 28
                                },
                                children: "06 — Spacing"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 625,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    maxWidth: 500
                                },
                                children: [
                                    {
                                        token: 'xxxs',
                                        px: 4,
                                        bar: 12
                                    },
                                    {
                                        token: 'xxs',
                                        px: 8,
                                        bar: 24
                                    },
                                    {
                                        token: 'xs',
                                        px: 12,
                                        bar: 36
                                    },
                                    {
                                        token: 'sm',
                                        px: 16,
                                        bar: 48
                                    },
                                    {
                                        token: 'md',
                                        px: 24,
                                        bar: 72
                                    },
                                    {
                                        token: 'lg',
                                        px: 32,
                                        bar: 96
                                    },
                                    {
                                        token: 'xl',
                                        px: 40,
                                        bar: 120
                                    },
                                    {
                                        token: 'xxl',
                                        px: 60,
                                        bar: 180
                                    },
                                    {
                                        token: 'xxxl',
                                        px: 72,
                                        bar: 216
                                    }
                                ].map(({ token, px, bar })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16,
                                            padding: '8px 0',
                                            borderBottom: '1px solid #ebebeb'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    width: 64,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    fontFamily: 'monospace'
                                                },
                                                children: token
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 641,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    width: 52,
                                                    fontSize: 12,
                                                    color: '#808080',
                                                    fontFamily: 'monospace'
                                                },
                                                children: [
                                                    px,
                                                    "px"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 642,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    height: 20,
                                                    width: bar,
                                                    background: c.brandPrimary,
                                                    borderRadius: 3
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 643,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, token, true, {
                                        fileName: "[project]/app/styleguide/page.tsx",
                                        lineNumber: 640,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 628,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 624,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "data-section": "radius",
                        id: "radius",
                        style: {
                            paddingTop: 52,
                            borderTop: '1px solid #ebebeb',
                            marginTop: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#808080',
                                    marginBottom: 28
                                },
                                children: "07 — Border Radius"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 651,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    color: '#808080',
                                    margin: '0 0 12px'
                                },
                                children: "Base Scale"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 654,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 24,
                                    alignItems: 'flex-end'
                                },
                                children: [
                                    {
                                        token: 'none',
                                        val: 0
                                    },
                                    {
                                        token: 'sm',
                                        val: 4
                                    },
                                    {
                                        token: 'md',
                                        val: 8
                                    },
                                    {
                                        token: 'lg',
                                        val: r.lg
                                    },
                                    {
                                        token: 'xl',
                                        val: 20
                                    },
                                    {
                                        token: 'xxl',
                                        val: 50,
                                        display: '100px'
                                    }
                                ].map(({ token, val, display })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: 80,
                                                    height: 80,
                                                    background: '#f4f1ee',
                                                    border: '2px solid #ebebeb',
                                                    borderRadius: val,
                                                    margin: '0 auto 8px'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 661,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    fontFamily: 'monospace',
                                                    color: c.brandPrimary,
                                                    display: 'block'
                                                },
                                                children: token
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 662,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 10,
                                                    color: '#808080',
                                                    fontFamily: 'monospace'
                                                },
                                                children: display ?? `${val}px`
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 663,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, token, true, {
                                        fileName: "[project]/app/styleguide/page.tsx",
                                        lineNumber: 660,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 655,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    color: '#808080',
                                    margin: '32px 0 12px'
                                },
                                children: "Component Radius — Per Brand"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 668,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 24,
                                    alignItems: 'flex-end'
                                },
                                children: [
                                    {
                                        token: 'button',
                                        val: r.button
                                    },
                                    {
                                        token: 'ribbon',
                                        val: r.ribbon
                                    },
                                    {
                                        token: 'input',
                                        val: r.input
                                    }
                                ].map(({ token, val })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: 80,
                                                    height: 80,
                                                    background: '#f4f1ee',
                                                    border: '2px solid #ebebeb',
                                                    borderRadius: Math.min(val, 40),
                                                    margin: '0 auto 8px'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 678,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    fontFamily: 'monospace',
                                                    color: c.brandPrimary,
                                                    display: 'block'
                                                },
                                                children: token
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 679,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 10,
                                                    color: '#808080',
                                                    fontFamily: 'monospace'
                                                },
                                                children: [
                                                    val,
                                                    "px"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 680,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, token, true, {
                                        fileName: "[project]/app/styleguide/page.tsx",
                                        lineNumber: 677,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 671,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 650,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "data-section": "shadows",
                        id: "shadows",
                        style: {
                            paddingTop: 52,
                            borderTop: '1px solid #ebebeb',
                            marginTop: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#808080',
                                    marginBottom: 28
                                },
                                children: "08 — Shadows"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 688,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 40,
                                    padding: '24px 0'
                                },
                                children: [
                                    {
                                        token: 'sm',
                                        shadow: '0 1px 3px 0 rgba(0,0,0,0.08),0 1px 2px -1px rgba(0,0,0,0.06)'
                                    },
                                    {
                                        token: 'md',
                                        shadow: '0 4px 6px -1px rgba(0,0,0,0.08),0 2px 4px -2px rgba(0,0,0,0.06)'
                                    },
                                    {
                                        token: 'lg',
                                        shadow: '0 10px 15px -3px rgba(0,0,0,0.08),0 4px 6px -4px rgba(0,0,0,0.05)'
                                    },
                                    {
                                        token: 'xl',
                                        shadow: '0 20px 25px -5px rgba(0,0,0,0.08),0 8px 10px -6px rgba(0,0,0,0.05)'
                                    },
                                    {
                                        token: 'xxl',
                                        shadow: '0 25px 50px -12px rgba(0,0,0,0.18)'
                                    }
                                ].map(({ token, shadow })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: 80,
                                                    height: 60,
                                                    background: '#fff',
                                                    borderRadius: 8,
                                                    margin: '0 auto 12px',
                                                    boxShadow: shadow
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 700,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    fontFamily: 'monospace',
                                                    color: c.textPrimary
                                                },
                                                children: token
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 701,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, token, true, {
                                        fileName: "[project]/app/styleguide/page.tsx",
                                        lineNumber: 699,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 691,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 687,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "data-section": "breakpoints",
                        id: "breakpoints",
                        style: {
                            paddingTop: 52,
                            borderTop: '1px solid #ebebeb',
                            marginTop: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#808080',
                                    marginBottom: 28
                                },
                                children: "09 — Breakpoints"
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 709,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    maxWidth: 680
                                },
                                children: [
                                    {
                                        token: 'sm',
                                        val: '640px',
                                        pct: '44.4%'
                                    },
                                    {
                                        token: 'md',
                                        val: '768px',
                                        pct: '53.3%'
                                    },
                                    {
                                        token: 'lg',
                                        val: '1024px',
                                        pct: '71.1%'
                                    },
                                    {
                                        token: 'xl',
                                        val: '1280px',
                                        pct: '88.9%'
                                    },
                                    {
                                        token: '2xl',
                                        val: '1440px',
                                        pct: '100%'
                                    }
                                ].map(({ token, val, pct })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16,
                                            padding: '8px 0',
                                            borderBottom: '1px solid #ebebeb'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    width: 48,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    fontFamily: 'monospace'
                                                },
                                                children: token
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 721,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    width: 56,
                                                    fontSize: 12,
                                                    color: '#808080',
                                                    fontFamily: 'monospace'
                                                },
                                                children: val
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 722,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    flex: 1,
                                                    height: 8,
                                                    background: c.surfacePrimary,
                                                    borderRadius: 4,
                                                    overflow: 'hidden'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        height: '100%',
                                                        width: pct,
                                                        background: c.brandPrimary,
                                                        borderRadius: 4
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/app/styleguide/page.tsx",
                                                    lineNumber: 724,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/styleguide/page.tsx",
                                                lineNumber: 723,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, token, true, {
                                        fileName: "[project]/app/styleguide/page.tsx",
                                        lineNumber: 720,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/styleguide/page.tsx",
                                lineNumber: 712,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/styleguide/page.tsx",
                        lineNumber: 708,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/styleguide/page.tsx",
                lineNumber: 435,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/styleguide/page.tsx",
        lineNumber: 377,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_styleguide_page_tsx_0b.wo.g._.js.map