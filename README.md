# 🦄 Mixer – Das Reise-Pferd (v3.3)

**Mixer** ist ein interaktives Reise-Begleiter-Spiel (Tamagotchi-Stil), das deinen realen Standort nutzt, um Belohnungen zu generieren. Je weiter du dich von deinem Heimatort entfernst, desto wertvoller werden die Interaktionen mit Mixer!

## ✨ Kern-Features

* **📍 Geo-Location Engine:** Ein dynamischer Multiplikator (bis zu 10x), der auf der Haversine-Distanz zwischen deinem Heimatort und deinem aktuellen Standort basiert.
* **🎭 Interaktives Drag-and-Drop:** Tools (Apfel, Wasser, Bürste) müssen physisch auf Mixer gezogen werden, um Aktionen auszulösen.
* **📈 Level-System (1–4):** Schalte neue Tools wie die Bürste (Level 2) oder das "Deep Talk"-Feature (Level 4) frei.
* **🌗 Dynamische Farbmodi:** "Fokus auf Mixer" bei Tag und ein augenschonender "Deep Dark" Modus bei Nacht (22:00 – 07:00 Uhr).
* **💬 Conversation Engine:** Mixer reagiert auf deine Level-Progression mit individuellen Dialogen und Emoji-Feedback.
* **🧼 Dirty-Mechanik:** Ab Level 2 kann Mixer schmutzig werden und benötigt aktive Pflege (Dirt-Overlay-System).

## 🚀 Tech Stack

* **Framework:** [Expo](https://expo.dev/) (React Native)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand) (mit Persistence Middleware)
* **Animationen:** React Native Reanimated & Lottie
* **Storage:** AsyncStorage
* **Location:** Expo Location (GPS & Reverse Geocoding)

## 🛠️ Installation & Setup

Stelle sicher, dass du **Node.js (v22.11.0+)** und **npm** installiert hast.

1.  **Repository klonen:**
    ```bash
    git clone [https://github.com/DEIN_USERNAME/MixerApp.git](https://github.com/DEIN_USERNAME/MixerApp.git)
    cd MixerApp
    ```

2.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```

3.  **Projekt starten:**
    ```bash
    npx expo start
    ```
    *Scanne den QR-Code mit der **Expo Go** App auf deinem Smartphone.*

## 📐 Mathematisches Framework

Die Kern-Logik des Geo-Multiplikators $M(d)$:

$$M(d) = \min\left(10, 1 + \left(\frac{d}{250}\right)^2\right)$$

* $d$ = Distanz in km.
* **Cap:** Maximum 10.0x (ab ca. 750 km).

## 🎨 Asset-Pipeline

Die App erwartet transparente PNGs im `@3x` Format im Ordner `./assets/`:
* `mixer_idle.png`, `mixer_happy.png`, `mixer_sleep.png`
* `tool_apple.png`, `tool_water.png`, `tool_hand.png`, `tool_brush.png`, `tool_chat.png`
* `dirt_overlay.png` (Transparente Matschflecken für das Level-2 Feature)

## 📜 Lizenz

Dieses Projekt ist unter der **GNU General Public License v3.0 (GPL-3.0)** lizenziert. Weitere Details findest du in der `LICENSE` Datei.
