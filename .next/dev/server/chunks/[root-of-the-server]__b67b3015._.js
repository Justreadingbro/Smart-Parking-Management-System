module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/parking-data/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
;
/**
 * Robust reader for scripts/parking_data.json
 * - Accepts several shapes and normalizes to: { slots: Array<{slotId,status,licensePlate,entryTime,bill}>, cameras: {} }
 */ function normalizeSlotObjectEntry(slotId, s) {
    const licensePlate = s.licensePlate ?? s.license_plate ?? s.license ?? "";
    const entryTime = s.entryTime ?? s.entry_time ?? s.entry ?? "";
    const bill = typeof s.bill === "number" ? s.bill : typeof s.amount === "number" ? s.amount : s.price ?? 0;
    let status = (s.status ?? "").toString().toLowerCase();
    if (status === "free") status = "available";
    if (status !== "available" && status !== "occupied" && status !== "offline") {
        // fallback to available when unknown
        status = "available";
    }
    return {
        slotId,
        status,
        licensePlate,
        entryTime,
        bill
    };
}
async function GET() {
    try {
        const projectRoot = process.cwd();
        const jsonPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(projectRoot, "scripts", "parking_data.json");
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(jsonPath)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                slots: [],
                cameras: {},
                error: "parking_data.json not found"
            }, {
                status: 404
            });
        }
        const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(jsonPath, "utf8");
        const data = raw ? JSON.parse(raw) : {};
        // 1) If file already contains a `slots` array in the expected normalized format
        if (Array.isArray(data.slots) && data.slots.length > 0) {
            const slots = data.slots.map((s)=>({
                    slotId: s.slotId ?? s.id ?? s.slot ?? "",
                    status: s.status ?? "available",
                    licensePlate: s.licensePlate ?? s.license_plate ?? "",
                    entryTime: s.entryTime ?? s.entry_time ?? "",
                    bill: typeof s.bill === "number" ? s.bill : s.amount ?? 0
                }));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                slots,
                history: data.history ?? [],
                cameras: data.cameras ?? {}
            });
        }
        // 2) If the JSON has a top-level object that maps slotId -> object (A-001 -> {...})
        const topKeys = Object.keys(data || {});
        const looksLikeSlotMap = topKeys.length > 0 && topKeys.every((k)=>/^A-\d{3}$/.test(k));
        if (looksLikeSlotMap) {
            const slots = topKeys.map((k)=>normalizeSlotObjectEntry(k, data[k]));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                slots,
                history: data.history ?? [],
                cameras: data.cameras ?? {}
            });
        }
        // 3) If data contains wrapper names commonly used by backends
        const wrapperCandidates = [
            "parking_data",
            "slots_map",
            "slotsData",
            "data"
        ];
        for (const key of wrapperCandidates){
            if (data[key] && typeof data[key] === "object") {
                const maybe = data[key];
                const maybeKeys = Object.keys(maybe || {});
                if (Array.isArray(maybe)) {
                    // Already array form
                    const slots = maybe.map((s)=>normalizeSlotObjectEntry(s.slotId ?? s.id ?? s.slot ?? "unknown", s));
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        slots,
                        history: data.history ?? [],
                        cameras: data.cameras ?? data[key].cameras ?? {}
                    });
                } else if (maybeKeys.length && maybeKeys.every((k)=>/^A-\d{3}$/.test(k))) {
                    const slots = maybeKeys.map((k)=>normalizeSlotObjectEntry(k, maybe[k]));
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        slots,
                        history: data.history ?? [],
                        cameras: data.cameras ?? maybe.cameras ?? {}
                    });
                }
            }
        }
        // 4) If file contains a single `slots` object stored as first element or different structure,
        // try to salvage: if data.slots is an object keyed by slot id
        if (data.slots && typeof data.slots === "object" && !Array.isArray(data.slots)) {
            const keys = Object.keys(data.slots);
            const slots = keys.map((k)=>normalizeSlotObjectEntry(k, data.slots[k]));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                slots,
                history: data.history ?? [],
                cameras: data.cameras ?? {}
            });
        }
        // 5) If nothing matched, attempt to find any A-### keys at any depth (best-effort)
        const found = [];
        const scan = (obj)=>{
            if (!obj || typeof obj !== "object") return;
            for (const k of Object.keys(obj)){
                if (/^A-\d{3}$/.test(k) && typeof obj[k] === "object") {
                    found.push({
                        id: k,
                        obj: obj[k]
                    });
                } else if (typeof obj[k] === "object") {
                    scan(obj[k]);
                }
            }
        };
        scan(data);
        if (found.length > 0) {
            const slots = found.map((f)=>normalizeSlotObjectEntry(f.id, f.obj));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                slots,
                history: data.history ?? [],
                cameras: data.cameras ?? {}
            });
        }
        // Fallback: return empty slots and the cameras object if present
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            slots: [],
            history: data.history ?? [],
            cameras: data.cameras ?? {}
        });
    } catch (err) {
        console.error("[api/parking-data] read error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            slots: [],
            history: [],
            cameras: {},
            error: "failed reading parking_data.json"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b67b3015._.js.map