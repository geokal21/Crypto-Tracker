let chart;
const modal = document.getElementById('chart-modal');
const ctx = document.getElementById('crypto-chart').getContext('2d');

async function fetchCryptoData() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=100&page=1&sparkline=false'
    );
    const data = await res.json();
    displayCryptos(data);
  } catch (err) {
    console.error('Σφάλμα κατά την ανάκτηση των δεδομένων:', err);
  }
}

function displayCryptos(coins) {
  const container = document.getElementById('crypto-container');
  container.innerHTML = '';

  coins.forEach((coin, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
    <div class="card-header">
      <img src="${coin.image}" alt="${coin.name}">
      <h2 class="crypto-name">${index + 1}. ${coin.name}</h2>
    </div>
    <div class="card-body">  
      <p><strong>Τιμή:</strong> €${coin.current_price.toLocaleString()}</p>
      <p><strong>Αλλαγή 24h:</strong> <span style="color: ${coin.price_change_percentage_24h >= 0 ? 'limegreen' : 'red'};">
        ${coin.price_change_percentage_24h.toFixed(2)}%</span></p>
      <p class="market-cap"><strong>Market Cap:</strong> €${coin.market_cap.toLocaleString()}</p>  
    `;

    card.addEventListener('click', () => {
      showChart(coin.id, coin.name);
    });

    container.appendChild(card);
  });
}

async function showChart(coinId, coinName) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=eur&days=7`);
    const data = await res.json();

    const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString());
    const prices = data.prices.map(p => p[1]);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${coinName} - Τιμή (7 ημέρες σε €)`,
          data: prices,
          borderColor: '#58a6ff',
          backgroundColor: 'rgba(88,166,255,0.2)',
          fill: true,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { display: true },
          y: { display: true }
        }
      }
    });

    modal.classList.remove('hidden');
  } catch (err) {
    alert("Αποτυχία φόρτωσης γραφήματος");
    console.error(err);
  }
}

document.getElementById('close-btn').addEventListener('click', () => {
  modal.classList.add('hidden');
});

document.getElementById('search-input').addEventListener('input', function (e) {
  const searchTerm = e.target.value.toLowerCase();
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    const name = card.querySelector('.crypto-name').innerText.toLowerCase();
    card.style.display = name.includes(searchTerm) ? 'block' : 'none';
  });
});

// Φόρτωσε αρχικά
fetchCryptoData();

// Αυτόματη ανανέωση κάθε 60s
setInterval(fetchCryptoData, 60000);
