(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/cpl/nextjs/src/app/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CPLPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/cpl/nextjs/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/cpl/nextjs/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/cpl/nextjs/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/cpl/nextjs/node_modules/next/image.js [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module 'lucide-react'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/data/cplTeams'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/data/cplFixtures'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@/data/cplRules'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function CPLPage() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(25);
    if ($[0] !== "24480d29c82daa6c0e23913c163d2410d20e21fd361e691b122b0bf508c2cb57") {
        for(let $i = 0; $i < 25; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "24480d29c82daa6c0e23913c163d2410d20e21fd361e691b122b0bf508c2cb57";
    }
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("TEAMS");
    const [showRulesModal, setShowRulesModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedTeam, setSelectedTeam] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 pointer-events-none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-amber-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse duration-[5000ms]"
                }, void 0, false, {
                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                    lineNumber: 27,
                    columnNumber: 64
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"
                }, void 0, false, {
                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                    lineNumber: 27,
                    columnNumber: 242
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute inset-0 bg-grid-pattern opacity-[0.03]"
                }, void 0, false, {
                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                    lineNumber: 27,
                    columnNumber: 351
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 27,
            columnNumber: 10
        }, this);
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    let t1;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-3 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full backdrop-blur-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Flame, {
                    className: "w-4 h-4 text-amber-500 animate-bounce"
                }, void 0, false, {
                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                    lineNumber: 34,
                    columnNumber: 136
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest",
                    children: "Season 03 is Here"
                }, void 0, false, {
                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                    lineNumber: 34,
                    columnNumber: 195
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 34,
            columnNumber: 10
        }, this);
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    let t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
            className: "text-8xl md:text-[10rem] font-tech font-bold uppercase leading-[0.8] tracking-tight drop-shadow-2xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-white",
                    children: "Campus"
                }, void 0, false, {
                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                    lineNumber: 42,
                    columnNumber: 126
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                    lineNumber: 42,
                    columnNumber: 168
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-600",
                    children: "League"
                }, void 0, false, {
                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                    lineNumber: 42,
                    columnNumber: 174
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 42,
            columnNumber: 10
        }, this);
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-white/50 text-lg font-clean max-w-xl mx-auto border-l-2 border-amber-500/30 pl-6 text-left md:text-center md:border-l-0 md:border-t-2 md:pt-6 md:pl-0",
            children: "Witness the clash of 8 elite franchises battling for the ultimate glory. Strategy, passion, and skill collide in Season 3."
        }, void 0, false, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 43,
            columnNumber: 10
        }, this);
        $[3] = t2;
        $[4] = t3;
    } else {
        t2 = $[3];
        t3 = $[4];
    }
    let t4;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = ({
            "CPLPage[<button>.onClick]": ()=>setShowRulesModal(true)
        })["CPLPage[<button>.onClick]"];
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "relative h-[80vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden",
            children: [
                t0,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative z-10 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000",
                    children: [
                        t1,
                        t2,
                        t3,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4 mt-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: t4,
                                className: "group px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BookOpen, {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                        lineNumber: 61,
                                        columnNumber: 533
                                    }, this),
                                    " Rule Book"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 61,
                                columnNumber: 293
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                            lineNumber: 61,
                            columnNumber: 260
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                    lineNumber: 61,
                    columnNumber: 128
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 61,
            columnNumber: 10
        }, this);
        $[6] = t5;
    } else {
        t5 = $[6];
    }
    let t6;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = [
            "TEAMS",
            "FIXTURES"
        ];
        $[7] = t6;
    } else {
        t6 = $[7];
    }
    let t7;
    let t8;
    if ($[8] !== activeTab) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center mb-16",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md flex gap-2",
                children: t6.map({
                    "CPLPage[(anonymous)()]": (tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: {
                                "CPLPage[(anonymous)() > <button>.onClick]": ()=>setActiveTab(tab)
                            }["CPLPage[(anonymous)() > <button>.onClick]"],
                            className: `px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-white/40 hover:text-white hover:bg-white/5"}`,
                            children: tab
                        }, tab, false, {
                            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                            lineNumber: 77,
                            columnNumber: 44
                        }, this)
                }["CPLPage[(anonymous)()]"])
            }, void 0, false, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 76,
                columnNumber: 53
            }, this)
        }, void 0, false, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 76,
            columnNumber: 10
        }, this);
        t8 = activeTab === "TEAMS" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500",
            children: CPL_TEAMS.map({
                "CPLPage[CPL_TEAMS.map()]": (team, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "group relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 overflow-hidden hover:border-amber-500/50 transition-colors duration-500 flex flex-col h-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 82,
                                columnNumber: 245
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative z-10 flex flex-col items-center text-center gap-6 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500 shadow-2xl overflow-hidden",
                                        style: {
                                            borderColor: `${team.color}33`
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: team.logo,
                                                alt: team.name,
                                                fill: true,
                                                className: "object-cover",
                                                onError: _CPLPageCPL_TEAMSMapImageOnError
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                lineNumber: 84,
                                                columnNumber: 16
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Shield, {
                                                className: "w-10 h-10 absolute z-[-1]",
                                                style: {
                                                    color: team.color
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                lineNumber: 84,
                                                columnNumber: 137
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute -bottom-3 -right-3 w-8 h-8 bg-white text-black font-tech font-bold flex items-center justify-center rounded-lg shadow-lg text-sm z-10",
                                                children: [
                                                    "0",
                                                    i + 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                lineNumber: 86,
                                                columnNumber: 20
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                        lineNumber: 82,
                                        columnNumber: 468
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-2xl font-tech font-bold text-white uppercase leading-none mb-2 break-words",
                                                children: team.name
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                lineNumber: 86,
                                                columnNumber: 205
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-white/40 uppercase tracking-widest mb-1",
                                                children: team.desc
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                lineNumber: 86,
                                                columnNumber: 317
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-px w-12 bg-white/10 mx-auto my-3"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                lineNumber: 86,
                                                columnNumber: 404
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-mono text-white/60 uppercase tracking-widest",
                                                children: [
                                                    "Cap: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white font-bold",
                                                        children: team.captain
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                        lineNumber: 86,
                                                        columnNumber: 536
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                lineNumber: 86,
                                                columnNumber: 458
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                        lineNumber: 86,
                                        columnNumber: 200
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-auto w-full pt-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: {
                                                "CPLPage[CPL_TEAMS.map() > <button>.onClick]": ()=>setSelectedTeam(team)
                                            }["CPLPage[CPL_TEAMS.map() > <button>.onClick]"],
                                            className: "w-full py-3 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Users, {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                    lineNumber: 88,
                                                    columnNumber: 290
                                                }, this),
                                                " View Squad"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                            lineNumber: 86,
                                            columnNumber: 643
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                        lineNumber: 86,
                                        columnNumber: 606
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 82,
                                columnNumber: 385
                            }, this)
                        ]
                    }, team.id, true, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 82,
                        columnNumber: 50
                    }, this)
            }["CPLPage[CPL_TEAMS.map()]"])
        }, void 0, false, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 81,
            columnNumber: 35
        }, this);
        $[8] = activeTab;
        $[9] = t7;
        $[10] = t8;
    } else {
        t7 = $[9];
        t8 = $[10];
    }
    let t9;
    if ($[11] !== activeTab) {
        t9 = activeTab === "FIXTURES" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-4xl mx-auto space-y-4 animate-in slide-in-from-bottom-8 duration-500",
            children: [
                CPL_FIXTURES.map(_CPLPageCPL_FIXTURESMap),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-12 p-8 border border-white/10 border-dashed rounded-2xl text-center bg-white/[0.02]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Clock, {
                            className: "w-6 h-6 text-white/20 mx-auto mb-3"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                            lineNumber: 99,
                            columnNumber: 277
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-white/40 font-mono uppercase tracking-widest",
                            children: "More fixtures to be announced post-auction"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                            lineNumber: 99,
                            columnNumber: 333
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                    lineNumber: 99,
                    columnNumber: 173
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 99,
            columnNumber: 38
        }, this);
        $[11] = activeTab;
        $[12] = t9;
    } else {
        t9 = $[12];
    }
    let t10;
    if ($[13] !== t7 || $[14] !== t8 || $[15] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            id: "content-grid",
            className: "max-w-[1400px] mx-auto px-6 py-24 relative z-10",
            children: [
                t7,
                t8,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 107,
            columnNumber: 11
        }, this);
        $[13] = t7;
        $[14] = t8;
        $[15] = t9;
        $[16] = t10;
    } else {
        t10 = $[16];
    }
    let t11;
    if ($[17] !== showRulesModal) {
        t11 = showRulesModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-3xl h-[85vh] flex flex-col relative shadow-2xl animate-in zoom-in-95 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 border-b border-white/10 bg-[#0f0f11] flex justify-between items-center shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-tech font-bold text-white uppercase flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BookOpen, {
                                        className: "w-6 h-6 text-amber-500"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                        lineNumber: 117,
                                        columnNumber: 521
                                    }, this),
                                    " Official Rule Book ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-white/20 text-sm font-mono",
                                        children: "v3.0"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                        lineNumber: 117,
                                        columnNumber: 588
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 117,
                                columnNumber: 431
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: {
                                    "CPLPage[<button>.onClick]": ()=>setShowRulesModal(false)
                                }["CPLPage[<button>.onClick]"],
                                className: "p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(X, {
                                    className: "w-6 h-6"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                    lineNumber: 119,
                                    columnNumber: 150
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 117,
                                columnNumber: 654
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 117,
                        columnNumber: 329
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto p-8 bg-[#050505] custom-scrollbar space-y-8",
                        children: [
                            CPL_RULES.map(_CPLPageCPL_RULESMap),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-center text-[10px] text-white/30 uppercase tracking-widest font-mono pt-4",
                                children: "Umpire's decision is final in all situations."
                            }, void 0, false, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 119,
                                columnNumber: 311
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 119,
                        columnNumber: 190
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 117,
                columnNumber: 166
            }, this)
        }, void 0, false, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 117,
            columnNumber: 29
        }, this);
        $[17] = showRulesModal;
        $[18] = t11;
    } else {
        t11 = $[18];
    }
    let t12;
    if ($[19] !== selectedTeam) {
        t12 = selectedTeam && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#0f0f11] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[80vh] flex flex-col relative shadow-2xl animate-in zoom-in-95 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 border-b border-white/10 bg-[#0a0a0a] flex justify-between items-center shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden",
                                        style: {
                                            borderColor: selectedTeam.color
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative w-full h-full",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: selectedTeam.logo,
                                                alt: selectedTeam.name,
                                                fill: true,
                                                className: "object-cover"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                lineNumber: 129,
                                                columnNumber: 56
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                            lineNumber: 129,
                                            columnNumber: 16
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                        lineNumber: 127,
                                        columnNumber: 471
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-2xl font-tech font-bold text-white uppercase leading-none",
                                                children: selectedTeam.name
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                lineNumber: 129,
                                                columnNumber: 167
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-white/40 uppercase tracking-widest mt-1",
                                                children: "Full Squad Roster"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                                lineNumber: 129,
                                                columnNumber: 270
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                        lineNumber: 129,
                                        columnNumber: 162
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 127,
                                columnNumber: 430
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: {
                                    "CPLPage[<button>.onClick]": ()=>setSelectedTeam(null)
                                }["CPLPage[<button>.onClick]"],
                                className: "p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(X, {
                                    className: "w-6 h-6"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                    lineNumber: 131,
                                    columnNumber: 150
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 129,
                                columnNumber: 375
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 127,
                        columnNumber: 328
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto p-6 bg-[#050505] custom-scrollbar",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                            children: selectedTeam.squad.map(_CPLPageSelectedTeamSquadMap)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                            lineNumber: 131,
                            columnNumber: 264
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 131,
                        columnNumber: 190
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-t border-white/10 bg-[#0a0a0a] text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] text-white/30 uppercase tracking-widest font-mono",
                            children: [
                                "Total Players: ",
                                selectedTeam.squad.length
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                            lineNumber: 131,
                            columnNumber: 456
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 131,
                        columnNumber: 385
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 127,
                columnNumber: 161
            }, this)
        }, void 0, false, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 127,
            columnNumber: 27
        }, this);
        $[19] = selectedTeam;
        $[20] = t12;
    } else {
        t12 = $[20];
    }
    let t13;
    if ($[21] !== t10 || $[22] !== t11 || $[23] !== t12) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#030303] text-white selection:bg-amber-500/30 font-sans",
            children: [
                t5,
                t10,
                t11,
                t12
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
            lineNumber: 139,
            columnNumber: 11
        }, this);
        $[21] = t10;
        $[22] = t11;
        $[23] = t12;
        $[24] = t13;
    } else {
        t13 = $[24];
    }
    return t13;
}
_s(CPLPage, "WJAINDR6y0S8qaAHNL6vTNDv0hg=");
_c = CPLPage;
function _CPLPageSelectedTeamSquadMap(player, idx) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-4 p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.06] transition-colors",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 font-mono",
                children: idx + 1
            }, void 0, false, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 150,
                columnNumber: 154
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm font-medium text-white",
                children: player
            }, void 0, false, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 150,
                columnNumber: 298
            }, this)
        ]
    }, idx, true, {
        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
        lineNumber: 150,
        columnNumber: 10
    }, this);
}
function _CPLPageCPL_RULESMap(rule) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: `${rule.color} font-bold uppercase tracking-widest text-sm mb-4 border-b border-white/10 pb-2`,
                children: rule.title
            }, void 0, false, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 153,
                columnNumber: 33
            }, this),
            rule.content && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                children: rule.content.map(_CPLPageCPL_RULESMapRuleContentMap)
            }, void 0, false, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 153,
                columnNumber: 178
            }, this),
            rule.list && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "space-y-3 text-sm text-white/70 font-clean",
                children: rule.list.map(_CPLPageCPL_RULESMapRuleListMap)
            }, void 0, false, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 153,
                columnNumber: 308
            }, this),
            rule.cards && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: rule.cards.map(_CPLPageCPL_RULESMapRuleCardsMap)
            }, void 0, false, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 153,
                columnNumber: 436
            }, this)
        ]
    }, rule.id, true, {
        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
        lineNumber: 153,
        columnNumber: 10
    }, this);
}
function _CPLPageCPL_RULESMapRuleCardsMap(card, i_2) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-start gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-lg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(card.icon, {
                className: `w-5 h-5 ${card.iconColor} shrink-0 mt-0.5`
            }, void 0, false, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 156,
                columnNumber: 113
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `text-sm font-bold ${card.titleColor}`,
                        children: card.title
                    }, void 0, false, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 156,
                        columnNumber: 187
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-white/50 mt-1",
                        children: card.desc
                    }, void 0, false, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 156,
                        columnNumber: 261
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 156,
                columnNumber: 182
            }, this)
        ]
    }, i_2, true, {
        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
        lineNumber: 156,
        columnNumber: 10
    }, this);
}
function _CPLPageCPL_RULESMapRuleListMap(li, i_1) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
        className: "flex gap-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckCircle, {
                className: "w-4 h-4 text-green-500 shrink-0"
            }, void 0, false, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 159,
                columnNumber: 47
            }, this),
            " ",
            li
        ]
    }, i_1, true, {
        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
        lineNumber: 159,
        columnNumber: 10
    }, this);
}
function _CPLPageCPL_RULESMapRuleContentMap(item, i_0) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 bg-white/[0.03] rounded-xl border border-white/5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xl font-bold text-white",
                children: item.label
            }, void 0, false, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 162,
                columnNumber: 90
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[10px] text-white/40 uppercase",
                children: item.sub
            }, void 0, false, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 162,
                columnNumber: 154
            }, this)
        ]
    }, i_0, true, {
        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
        lineNumber: 162,
        columnNumber: 10
    }, this);
}
function _CPLPageCPL_FIXTURESMap(fix) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "group relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-orange-500/30 transition-all hover:bg-white/[0.01]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-row md:flex-col items-center gap-2 md:gap-1 min-w-[100px] border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-6 border-dashed",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Calendar, {
                        className: "w-5 h-5 text-orange-500 mb-1"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 165,
                        columnNumber: 409
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block text-xl font-bold text-white uppercase",
                                children: fix.date
                            }, void 0, false, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 165,
                                columnNumber: 491
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block text-[10px] font-mono text-white/40",
                                children: fix.time
                            }, void 0, false, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 165,
                                columnNumber: 571
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 165,
                        columnNumber: 462
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 165,
                columnNumber: 239
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col md:flex-row items-center justify-center gap-6 w-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xl md:text-3xl font-tech font-bold text-white uppercase text-center",
                        children: fix.teamA
                    }, void 0, false, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 165,
                        columnNumber: 751
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-bold text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full uppercase tracking-widest",
                        children: "VS"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 165,
                        columnNumber: 860
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xl md:text-3xl font-tech font-bold text-white uppercase text-center",
                        children: fix.teamB
                    }, void 0, false, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 165,
                        columnNumber: 987
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 165,
                columnNumber: 660
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-w-[140px] text-center md:text-right pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 border-dashed",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center md:justify-end gap-2 mb-1 opacity-50 group-hover:opacity-100 transition-opacity",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapPin, {
                                className: "w-3 h-3"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 165,
                                columnNumber: 1379
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-bold uppercase tracking-wider",
                                children: "Venue"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                                lineNumber: 165,
                                columnNumber: 1409
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 165,
                        columnNumber: 1249
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$cpl$2f$nextjs$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-medium text-white",
                        children: fix.venue
                    }, void 0, false, {
                        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                        lineNumber: 165,
                        columnNumber: 1492
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
                lineNumber: 165,
                columnNumber: 1102
            }, this)
        ]
    }, fix.id, true, {
        fileName: "[project]/Desktop/cpl/nextjs/src/app/page.js",
        lineNumber: 165,
        columnNumber: 10
    }, this);
}
function _CPLPageCPL_TEAMSMapImageOnError(e) {
    e.target.style.display = "none";
}
var _c;
__turbopack_context__.k.register(_c, "CPLPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_cpl_nextjs_src_app_page_aee19ae2.js.map