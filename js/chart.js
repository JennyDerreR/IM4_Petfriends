// chart.js

(function () {
    "use strict";

    const init = () => {
        setTimeout(evaluateCurrentPageAndLoad, 400);
    };

    if (document.readyState === "complete" || document.readyState === "interactive") {
        init();
    } else {
        window.addEventListener("load", init);
    }
})();

function evaluateCurrentPageAndLoad() {
    const detailFeedingCanvas = document.getElementById("feedingChart");
    const isDetail = !!detailFeedingCanvas;

    if (isDetail) {
        setupRangeButtons("feeding-range-btns", "feedingRange");
        setupRangeButtons("humidity-range-btns", "humidityRange");
        fetchChartData();
    }
}

function setupRangeButtons(groupClass, stateKey) {
    const buttons = document.querySelectorAll(`.${groupClass} .chart-range-btn`);
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            window[stateKey] = parseInt(btn.dataset.range);
            fetchChartData();
        });
    });
}

function fetchChartData() {
    const urlParams   = new URLSearchParams(window.location.search);
    const animalId    = urlParams.get('id') || 0;
    const feedingRange  = window.feedingRange  || 1;
    const humidityRange = window.humidityRange || 1;

    fetch(`api/registeranimal.php?feedingRange=${feedingRange}&humidityRange=${humidityRange}&id=${animalId}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.status === "error") {
                console.error("API-Fehler beim Laden der Charts:", data.message);
                return;
            }
            createLineChart("feedingChart",  data.gewicht.labels,      data.gewicht.values,      "Futter-Füllstand (g)", "#e67e22", "rgba(230, 126, 34, 0.1)", "#d35400");
            createLineChart("humidityChart", data.feuchtigkeit.labels,  data.feuchtigkeit.values, "Feuchtigkeit",         "#3498db", "rgba(52, 152, 219, 0.1)", "#2980b9");
        })
        .catch(error => {
            console.error("Fehler beim Abrufen der Diagramm-Daten:", error);
        });
}

function createLineChart(canvasId, labels, values, labelText, borderColor, bgColor, pointColor) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (window[`instance_${canvasId}`]) {
        window[`instance_${canvasId}`].destroy();
    }

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
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 12,
                        font: { size: 12, family: "'Nunito', sans-serif" }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: "'Nunito', sans-serif", size: 11 }, color: "#7A7899" }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "#F0EFF8" },
                    ticks: {
                        precision: 0,
                        font: { family: "'Nunito', sans-serif", size: 11 },
                        color: "#7A7899"
                    }
                }
            }
        }
    });
}