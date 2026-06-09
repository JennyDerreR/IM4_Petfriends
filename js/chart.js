/**
 * PetCare - Chart Management System
 * Steuert die Diagramme für das Dashboard und die Tierdetailseite.
 */

(function () {
    "use strict";

    // Startet die Initialisierung, sobald das DOM vollständig geladen ist
    const init = () => {
        // Kurze Verzögerung, um Asynchronität mit anderen DOM-Skripten (z.B. protectedDOM.js) abzufangen
        setTimeout(evaluateCurrentPageAndLoad, 400);
    };

    if (document.readyState === "complete" || document.readyState === "interactive") {
        init();
    } else {
        window.addEventListener("load", init);
    }
})();

/**
 * Prüft, welche Chart-Elemente auf der aktuellen Seite vorhanden sind,
 * und stößt den Daten-Fetch an.
 */
function evaluateCurrentPageAndLoad() {
    const dashboardWeightCanvas = document.getElementById("weightChart");
    const dashboardHumidityCanvas = document.getElementById("humidityChart");
    const detailFeedingCanvas = document.getElementById("feedingChart");

    const isDashboard = dashboardWeightCanvas && dashboardHumidityCanvas;
    const isDetail = !!detailFeedingCanvas;

    if (isDashboard || isDetail) {
        fetchChartData(isDashboard, isDetail);
    }
}

/**
 * Holt die Sensordaten aus dem Backend
 * @param {boolean} isDashboard 
 * @param {boolean} isDetail 
 */
function fetchChartData(isDashboard, isDetail) {
    fetch("../api/registeranimal.php")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "error") {
                console.error("API-Fehler beim Laden der Charts:", data.message);
                return;
            }

            // Dashboard-Ansicht: Futterstand und Feuchtigkeit rendern
            if (isDashboard) {
                createLineChart("weightChart", data.gewicht.labels, data.gewicht.values, "Füllstand (in Gramm)", "#e67e22", "rgba(230, 126, 34, 0.1)", "#d35400");
                createLineChart("humidityChart", data.feuchtigkeit.labels, data.feuchtigkeit.values, "Feuchtigkeit", "#3498db", "rgba(52, 152, 219, 0.1)", "#2980b9");
            }

            // Detail-Ansicht: Nur den Futter-Verlauf rendern
            if (isDetail) {
                createLineChart("feedingChart", data.gewicht.labels, data.gewicht.values, "Futter-Füllstand (g)", "#e67e22", "rgba(230, 126, 34, 0.1)", "#d35400");
            }
        })
        .catch(error => {
            console.error("Fehler beim Abrufen der Diagramm-Daten:", error);
        });
}

/**
 * Universelle Funktion zum Erstellen eines Chart.js-Liniendiagramms
 * @param {string} canvasId - Die ID des Canvas-Elements im HTML
 * @param {Array} labels - X-Achsen Beschriftungen (Uhrzeiten)
 * @param {Array} values - Y-Achsen Werte (Messergebnisse)
 * @param {string} labelText - Titel des Datensatzes
 * @param {string} borderColor - Hex-Farbe der Linie
 * @param {string} bgColor - Hex- oder RGBA-Farbe der Flächenfüllung
 * @param {string} pointColor - Farbe der Datenpunkte
 */
function createLineChart(canvasId, labels, values, labelText, borderColor, bgColor, pointColor) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Falls auf diesem globalen Fenster-Objekt bereits eine Instanz existiert, löschen (behebt Canvas-Überlagerungen)
    if (window[`instance_${canvasId}`]) {
        window[`instance_${canvasId}`].destroy();
    }

    // Chart-Instanz im globalen Namespace speichern, um sie reaktiv verwalten zu können
    window[`instance_${canvasId}`] = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: labelText,
                data: values,
                borderColor: borderColor,
                backgroundColor: bgColor,
                borderWidth: 3,
                pointBackgroundColor: pointColor,
                pointBorderColor: "#ffffff",
                pointBorderWidth: 1.5,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.15,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Wichtig, damit CSS die Höhe im .canvas-wrapper kontrolliert
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 12,
                        font: { size: 12, family: "'Segoe UI', sans-serif" }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false } // Verhindert störende vertikale Gitterlinien
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0 // Keine Kommastellen bei Ganzzahlen erzeugen
                    }
                }
            }
        }
    });
}