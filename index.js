import { extension_settings, renderExtensionTemplateAsync } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "lightdark";

const defaults = {
    mode: "dark",
};

let observer = null;
let applying = false;

function getMode() {
    return extension_settings[extensionName]?.mode || "dark";
}

function applyMode(mode) {
    if (applying) return;
    applying = true;

    const root = document.documentElement;
    const body = document.body;

    root.classList.remove(
        "lightdark-light",
        "lightdark-dark"
    );

    body?.classList.remove(
        "lightdark-light",
        "lightdark-dark"
    );

    const className = mode === "light"
        ? "lightdark-light"
        : "lightdark-dark";

    root.classList.add(className);
    body?.classList.add(className);

    root.style.setProperty(
        "color-scheme",
        mode,
        "important"
    );

    $("#lightdark_status").text(
        mode === "light"
            ? "☀️ Mode clair forcé"
            : "🌑 Mode sombre forcé"
    );

    $("#lightdark_switch").text(
        mode === "light"
            ? "🌙 Passer en mode sombre"
            : "☀️ Passer en mode clair"
    );

    applying = false;
}

function setMode(mode) {
    extension_settings[extensionName].mode = mode;

    saveSettingsDebounced();

    applyMode(mode);
}

async function init() {
    extension_settings[extensionName] ??= {};
    extension_settings[extensionName].mode ??= defaults.mode;

    try {
        const html = await renderExtensionTemplateAsync(
            `third-party/${extensionName}`,
            "settings"
        );

        $("#extensions_settings").append(html);
    } catch (error) {
        console.error(
            "[LightDark] Impossible de charger settings.html",
            error
        );
    }

    applyMode(getMode());

    $(document).off(
        "click.lightdark",
        "#lightdark_switch"
    );

    $(document).on(
        "click.lightdark",
        "#lightdark_switch",
        () => {
            setMode(
                getMode() === "dark"
                    ? "light"
                    : "dark"
            );
        }
    );

    if (observer) {
        observer.disconnect();
    }

    observer = new MutationObserver(() => {
        const root = document.documentElement;

        const expected =
            getMode() === "light"
                ? "lightdark-light"
                : "lightdark-dark";

        if (!root.classList.contains(expected)) {
            applyMode(getMode());
        }
    });

    observer.observe(
        document.documentElement,
        {
            attributes: true,
            attributeFilter: ["class"],
        }
    );
}

jQuery(async () => {
    await init();
});