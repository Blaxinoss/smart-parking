const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// 1. هات الإعدادات الافتراضية تبعا لمسار المشروع
const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
    "require",
    "react-native",
    "development",
];

const ALIASES = {
    tslib: "tslib/tslib.es6.js",
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
    return context.resolveRequest(
        context,
        ALIASES[moduleName] ?? moduleName,
        platform
    );
};

// 2. اربط NativeWind بالإعدادات دي
// تأكد إن input بيشاور على ملف الـ CSS الرئيسي بتاعك
module.exports = withNativeWind(config, {
    input: "./global.css",
    inlineRem: 16
    // لو عايز تضيف أي إعدادات إضافية لـ Metro (زي SVG مثلا) حطها جوه config فوق
});