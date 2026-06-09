// js/chart.js
document.addEventListener("DOMContentLoaded", () => {
    // Kurze Verzögerung, damit das DOM sicher bereit ist
    setTimeout(() => {
        loadSensorChartData();
    }, 400);
});

function loadSensorChartData() {
    fetch('../api/registeranimal.php')
        .then(response => {
            if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok');
            return response.json();
        })
        .then(data => {
            if (data.status === "error") {
                console.error('API Fehler:', data.message);
                return;
            }
            // Übergibt die Arrays getrennt an die Zeichen-Funktionen
            renderWeightChart(data.gewicht.labels, data.gewicht.values);
            renderHumidityChart(data.feuchtigkeit.labels, data.feuchtigkeit.values);
        })
        .catch(error => console.error('Fehler beim Laden der Charts:', error));
}

function renderWeightChart(labels, values) {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, // Uhrzeiten auf der X-Achse
            datasets: [{
                label: 'Füllstand (in Gramm)',
                data: values, // Die echten Werte auf der Y-Achse
                borderColor: '#e67e22',
                backgroundColor: 'rgba(230, 126, 34, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#d35400',
                pointRadius: 4,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true,
                    title: { display: true, text: 'Gramm (g)' }
                }
            }
        }
    });
}

function renderHumidityChart(labels, values) {
    const canvas = document.getElementById('humidityChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, // Uhrzeiten auf der X-Achse
            datasets: [{
                label: 'Feuchtigkeit',
                data: values, // Die echten Werte auf der Y-Achse
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#2980b9',
                pointRadius: 4,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true,
                    title: { display: true, text: 'Wert' }
                }
            }
        }
    });
}