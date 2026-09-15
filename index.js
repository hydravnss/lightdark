import {
    extension_settings,
    renderExtensionTemplateAsync
} from "../../../extensions.js";

import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "lightdark";

const defaultSettings = {
    mode: "dark"
};

let observer = null;
let interval = null;
let applying = false;


/* ==========================================================
   GET MODE
   ========================================================== */

function getMode() {
    return extension_settings[extensionName]?.mode || "dark";
}


/* ==========================================================
   FORCE COLORS
   ========================================================== */

function forceColors(mode) {
    const light = mode === "light";

    const colors = light
        ? {
            bg: "#f5f5f7",
            bg2: "#ffffff",
            bg3: "#eeeeF2",
            text: "#111111",
            text2: "#555555",
            muted: "#888888",
            border: "#d2d2d7",
            input: "#ffffff"
        }
        : {
            bg: "#000000",
            bg2: "#0b0b0b",
            bg3: "#151515",
            text: "#f5f5f5",
            text2: "#b9b9b9",
            muted: "#777777",
            border: "#292929",
            input: "#111111"
        };


    /* ------------------------------------------------------
       ÉLÉMENTS PRINCIPAUX
       ------------------------------------------------------ */

    const elements = [
        document.documentElement,
        document.body,

        document.querySelector("#main"),
        document.querySelector("#background"),
        document.querySelector("#sheld"),
        document.querySelector("#chat"),

        document.querySelector("#top-bar"),
        document.querySelector("#top-bar-wrapper"),

        document.querySelector("#left-nav-panel"),
        document.querySelector("#right-nav-panel"),

        document.querySelector("#left-nav-panel-holder"),
        document.querySelector("#right-nav-panel-holder"),

        document.querySelector("#form_sheld"),
        document.querySelector("#send_form"),
        document.querySelector("#send_textarea")
    ].filter(Boolean);


    /* ------------------------------------------------------
       FORCE INLINE
       ------------------------------------------------------ */

    elements.forEach(element => {

        element.style.setProperty(
            "background-color",
            element.id === "send_textarea"
                ? colors.input
                : colors.bg,
            "important"
        );

        element.style.setProperty(
            "color",
            colors.text,
            "important"
        );

        element.style.setProperty(
            "border-color",
            colors.border,
            "important"
        );
    });


    /* ------------------------------------------------------
       FORMULAIRE — SUPPRESSION DE LA LIGNE
       ------------------------------------------------------ */

    const formSheld = document.querySelector("#form_sheld");

    if (formSheld) {

        formSheld.style.setProperty(
            "border",
            "none",
            "important"
        );

        formSheld.style.setProperty(
            "border-top",
            "none",
            "important"
        );

        formSheld.style.setProperty(
            "border-bottom",
            "none",
            "important"
        );

        formSheld.style.setProperty(
            "box-shadow",
            "none",
            "important"
        );

        formSheld.style.setProperty(
            "outline",
            "none",
            "important"
        );
    }


    /* ------------------------------------------------------
       SEND FORM — SUPPRESSION DE LA LIGNE
       ------------------------------------------------------ */

    const sendForm = document.querySelector("#send_form");

    if (sendForm) {

        sendForm.style.setProperty(
            "border",
            "none",
            "important"
        );

        sendForm.style.setProperty(
            "border-top",
            "none",
            "important"
        );

        sendForm.style.setProperty(
            "border-bottom",
            "none",
            "important"
        );

        sendForm.style.setProperty(
            "box-shadow",
            "none",
            "important"
        );

        sendForm.style.setProperty(
            "outline",
            "none",
            "important"
        );
    }


    /* ------------------------------------------------------
       BODY / HTML
       ------------------------------------------------------ */

    document.documentElement.style.setProperty(
        "background-color",
        colors.bg,
        "important"
    );

    document.body?.style.setProperty(
        "background-color",
        colors.bg,
        "important"
    );


    /* ------------------------------------------------------
       VARIABLES SILLYTAVERN
       ------------------------------------------------------ */

    const root = document.documentElement;

    root.style.setProperty(
        "--SmartThemeBodyColor",
        colors.text,
        "important"
    );

    root.style.setProperty(
        "--SmartThemeBodyColorLight",
        colors.text2,
        "important"
    );

    root.style.setProperty(
        "--SmartThemeBodyColorDark",
        colors.text,
        "important"
    );

    root.style.setProperty(
        "--SmartThemeBlurTintColor",
        colors.bg2,
        "important"
    );

    root.style.setProperty(
        "--SmartThemeChatTintColor",
        colors.bg,
        "important"
    );

    root.style.setProperty(
        "--SmartThemeUserMesBlurTintColor",
        colors.bg2,
        "important"
    );

    root.style.setProperty(
        "--SmartThemeBotMesBlurTintColor",
        colors.bg2,
        "important"
    );

    root.style.setProperty(
        "--SmartThemeBorderColor",
        colors.border,
        "important"
    );

    root.style.setProperty(
        "--SmartThemeEmColor",
        colors.text2,
        "important"
    );

    root.style.setProperty(
        "--SmartThemeQuoteColor",
        colors.text2,
        "important"
    );

    root.style.setProperty(
        "color-scheme",
        mode,
        "important"
    );
}


/* ==========================================================
   APPLY MODE
   ========================================================== */

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


    forceColors(mode);


    /* Extension UI */

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


/* ==========================================================
   CHANGE MODE
   ========================================================== */

function setMode(mode) {

    extension_settings[extensionName].mode = mode;

    saveSettingsDebounced();

    applyMode(mode);
}


/* ==========================================================
   INIT
   ========================================================== */

async function init() {

    extension_settings[extensionName] ??= {};

    extension_settings[extensionName].mode ??=
        defaultSettings.mode;


    /* Settings */

    try {

        const html =
            await renderExtensionTemplateAsync(
                `third-party/${extensionName}`,
                "settings"
            );

        $("#extensions_settings").append(html);

    } catch (error) {

        console.error(
            "[LightDark]",
            error
        );
    }


    /* Initialisation */

    applyMode(getMode());


    /* Bouton */

    $(document).off(
        "click.lightdark",
        "#lightdark_switch"
    );

    $(document).on(
        "click.lightdark",
        "#lightdark_switch",
        function () {

            const newMode =
                getMode() === "dark"
                    ? "light"
                    : "dark";

            setMode(newMode);
        }
    );


    /* ------------------------------------------------------
       SURVEILLE SILLYTAVERN
       ------------------------------------------------------ */

    if (observer) {
        observer.disconnect();
    }


    observer = new MutationObserver(() => {

        const expected =
            getMode() === "light"
                ? "lightdark-light"
                : "lightdark-dark";


        if (
            !document.documentElement.classList.contains(
                expected
            )
        ) {

            applyMode(getMode());

        }
    });


    observer.observe(
        document.documentElement,
        {
            attributes: true,
            attributeFilter: ["class"]
        }
    );


    /* ------------------------------------------------------
       FORCE RÉGULIÈREMENT
       Utile quand ST reconstruit son interface.
       ------------------------------------------------------ */

    if (interval) {
        clearInterval(interval);
    }

    interval = setInterval(() => {

        forceColors(getMode());

    }, 700);
}


/* ==========================================================
   START
   ========================================================== */

jQuery(async () => {
    await init();
});