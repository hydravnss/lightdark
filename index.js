import {
    extension_settings,
    renderExtensionTemplateAsync
} from "../../../extensions.js";

import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "lightdark";

const defaultSettings = {
    mode: "dark"
};

async function init() {
    extension_settings[extensionName] ??= {
        ...defaultSettings
    };

    extension_settings[extensionName].mode ??= "dark";

    const html = await renderExtensionTemplateAsync(
        `third-party/${extensionName}`,
        "settings"
    );

    $("#extensions_settings").append(html);

    updateMode(extension_settings[extensionName].mode);

    $("#lightdark_switch").on("click", function () {
        const current = extension_settings[extensionName].mode;

        const newMode =
            current === "dark"
                ? "light"
                : "dark";

        extension_settings[extensionName].mode = newMode;

        saveSettingsDebounced();

        updateMode(newMode);
    });
}

function updateMode(mode) {
    const isLight = mode === "light";

    // Nettoyage
    document.documentElement.classList.remove(
        "lightdark-light",
        "lightdark-dark"
    );

    document.body.classList.remove(
        "lightdark-light",
        "lightdark-dark"
    );

    // Nouveau mode
    const className = isLight
        ? "lightdark-light"
        : "lightdark-dark";

    document.documentElement.classList.add(className);
    document.body.classList.add(className);

    // Bouton
    $("#lightdark_switch").text(
        isLight
            ? "🌙 Mode sombre"
            : "☀️ Mode clair"
    );

    $("#lightdark_status").text(
        isLight
            ? "Mode clair activé"
            : "Mode sombre activé"
    );
}

jQuery(async () => {
    try {
        await init();
    } catch (error) {
        console.error("[LightDark] Erreur:", error);
    }
});