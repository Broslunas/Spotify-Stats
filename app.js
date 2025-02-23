// Función para obtener parámetros de la URL
function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}
const accessToken = getQueryParam('access_token');

// Referencias a elementos del DOM
const loginDiv = document.getElementById('login');
const topBar = document.getElementById('topBar');
const userImg = document.getElementById('userImg');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const timeRangeNote = document.getElementById('timeRangeNote');

const currentlyPlayingSection = document.getElementById('currentlyPlayingSection');
const nowPlayingInfo = document.getElementById('nowPlayingInfo');

const tracksTitle = document.getElementById('tracksTitle');
const tracksSlider = document.getElementById('tracksSlider');
const tracksItems = document.getElementById('tracksItems');

const artistsTitle = document.getElementById('artistsTitle');
const artistsSlider = document.getElementById('artistsSlider');
const artistsItems = document.getElementById('artistsItems');

const genresTitle = document.getElementById('genresTitle');
const genresSlider = document.getElementById('genresSlider');
const genresItems = document.getElementById('genresItems');

const recentPlayedTitle = document.getElementById('recentPlayedTitle');

// Botones "Ver más" (ocultos por defecto en el HTML)
const verMasTopTracks = document.getElementById('verMasTopTracks');
const verMasTopArtists = document.getElementById('verMasTopArtists');
const verMasGenres = document.getElementById('verMasGenres');
const verMasRecentlyPlayed = document.getElementById('verMasRecentlyPlayed');

// Botones de control para sliders
const tracksLeftBtn = document.getElementById('tracksLeft');
const tracksRightBtn = document.getElementById('tracksRight');
const artistsLeftBtn = document.getElementById('artistsLeft');
const artistsRightBtn = document.getElementById('artistsRight');
const genresLeftBtn = document.getElementById('genresLeft');
const genresRightBtn = document.getElementById('genresRight');

const PlaybackBtn = document.getElementById('playbackControls');

logoutBtn.addEventListener('click', () => {
  window.location.href = '/';
});

function slide(container, amount) {
  container.scrollBy({ left: amount, behavior: 'smooth' });
}
tracksLeftBtn.addEventListener('click', () => slide(tracksItems, -150));
tracksRightBtn.addEventListener('click', () => slide(tracksItems, 150));
artistsLeftBtn.addEventListener('click', () => slide(artistsItems, -150));
artistsRightBtn.addEventListener('click', () => slide(artistsItems, 150));
genresLeftBtn.addEventListener('click', () => slide(genresItems, -150));
genresRightBtn.addEventListener('click', () => slide(genresItems, 150));

if (accessToken) {
  loginDiv.style.display = 'none';
  topBar.style.display = 'flex';
  timeRangeNote.style.display = 'block';

  // Mostrar controles de reproducción
  const playbackControls = document.getElementById('playbackControls');
  playbackControls.style.display = 'block';

  const API_BASE_URL = 'https://api.broslunas.com';

  // Modificar la función handleResponse para que devuelva la promesa
const handleResponse = (endpoint, method = 'PUT') => {
  return fetch(`${API_BASE_URL}${endpoint}`, { // Añadir return aquí
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return Promise.resolve(); // Devolver promesa resuelta
    }
    return response.json();
  })
  .catch(err => {
    console.error('Error en la petición', err);
    throw err; // Propagar el error
  });
};

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
}

// Modifica la función updateCurrentlyPlaying
function updateCurrentlyPlaying() {
  fetch(`${API_BASE_URL}/spotify/currently-playing?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      if (data.is_playing && data.item) {
        currentlyPlayingSection.style.display = 'block';
        let artists = data.item.artists.map(artist => artist.name).join(' • ');
        
        // Actualizar progreso
        const progress = data.progress_ms || 0;
        const duration = data.item.duration_ms || 1;
        const progressPercent = (progress / duration * 100).toFixed(2);
        
        // Actualizar el DOM
        nowPlayingInfo.innerHTML = `
          <img src="${data.item.album.images[0]?.url || ''}" alt="Cover">
          <div class="np-info">
            <p style="margin: 0; font-weight: bold;">${data.item.name}</p>
            <p style="margin: 0; color: #b3b3b3;">${artists}</p>
            <div class="progress-container">
              <div class="progress-bar" id="progressBar" style="width: ${progressPercent}%"></div>
            </div>
            <div class="time-info">
              <span id="currentTime">${formatTime(progress)}</span>
              <span id="duration">${formatTime(duration)}</span>
            </div>
          </div>
        `;

        // Actualización automática cada segundo si está reproduciéndose
        if (data.is_playing) {
          setTimeout(updateCurrentlyPlaying, 100);
        }
      } else {
        currentlyPlayingSection.style.display = 'none';
      }
    })
    .catch(() => currentlyPlayingSection.style.display = 'none');
}

// Modificar los event listeners para asegurar la secuencia correcta
document.getElementById('pauseBtn').addEventListener('click', () => {
  handleResponse(`/spotify/pause?access_token=${accessToken}`)
    .then(setTimeout(updateCurrentlyPlaying, 100))
    .catch(console.error);
});

document.getElementById('playBtn').addEventListener('click', () => {
  handleResponse(`/spotify/play?access_token=${accessToken}`)
    .then(setTimeout(updateCurrentlyPlaying, 100))
    .catch(console.error);
});

document.getElementById('nextBtn').addEventListener('click', () => {
  handleResponse(`/spotify/next?access_token=${accessToken}`, 'POST')
    .then(setTimeout(updateCurrentlyPlaying, 100))
    .catch(console.error);
});

document.getElementById('prevBtn').addEventListener('click', () => {
  handleResponse(`/spotify/previous?access_token=${accessToken}`, 'POST')
    .then(setTimeout(updateCurrentlyPlaying, 100))
    .catch(console.error);
});

  // Perfil del usuario
  fetch(`${API_BASE_URL}/spotify/profile?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      userImg.src = (data.images && data.images.length) ? data.images[0].url : 'https://cdn.broslunas.com/img/user.png';
      userName.textContent = data.display_name || 'Usuario Spotify';
    })
    .catch(console.error);

  // Canción actualmente en reproducción (carga inicial)
fetch(`${API_BASE_URL}/spotify/currently-playing?access_token=${accessToken}`)
.then(res => res.json())
.then(data => {
  if (data.is_playing && data.item) {
    currentlyPlayingSection.style.display = 'block';
    let artists = data.item.artists.map(artist => artist.name).join(' • ');
    
    // Calcular progreso inicial
    const progress = data.progress_ms || 0;
    const duration = data.item.duration_ms || 1;
    const progressPercent = (progress / duration * 100).toFixed(2);

    // Añadir la barra de progreso al HTML inicial
    nowPlayingInfo.innerHTML = `
      <img src="${data.item.album.images[0]?.url || ''}" alt="Cover">
      <div class="np-info">
        <p style="margin: 0; font-weight: bold;">${data.item.name}</p>
        <p style="margin: 0; color: #b3b3b3;">${artists}</p>
        <div class="progress-container">
          <div class="progress-bar" id="progressBar" style="width: ${progressPercent}%"></div>
        </div>
        <div class="time-info">
          <span id="currentTime">${formatTime(progress)}</span>
          <span id="duration">${formatTime(duration)}</span>
        </div>
      </div>
    `;

    // Iniciar actualizaciones automáticas si está reproduciéndose
    if (data.is_playing) {
      setTimeout(updateCurrentlyPlaying, 1000);
    }
  } else {
    currentlyPlayingSection.style.display = 'none';
  }
})
.catch(() => currentlyPlayingSection.style.display = 'none');

  // Top Tracks (se muestran en slider)
  fetch(`${API_BASE_URL}/spotify/top-tracks?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      const tracks = data.items || [];
      if (tracks.length) {
        tracksTitle.style.display = 'block';
        tracksSlider.style.display = 'block';
        tracksItems.innerHTML = '';
        tracks.slice(0, 20).forEach(track => {
          const div = document.createElement('div');
          div.className = 'item';
          const imgSrc = track.album.images[0]?.url || '';
          div.innerHTML = `
            <a href="${track.external_urls.spotify}" target="_blank">
              <img src="${imgSrc}" alt="Track">
              <div class="title" title="${track.name}">${track.name}</div>
              <div class="subtitle" title="${track.artists[0].name}">${track.artists[0].name}</div>
            </a>
          `;
          tracksItems.appendChild(div);
        });
        // Mostrar "Ver más" si hay más de 20 elementos
        if (data.total > 20) {
          verMasTopTracks.style.display = 'block';
          verMasTopTracks.href = `/more/?type=top-tracks&access_token=${accessToken}`;
        } else {
          verMasTopTracks.style.display = 'none';
        }
      }
    })
    .catch(console.error);

  // Top Artists
  fetch(`${API_BASE_URL}/spotify/top-artists?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      const artists = data.items || [];
      if (artists.length) {
        artistsTitle.style.display = 'block';
        artistsSlider.style.display = 'block';
        artistsItems.innerHTML = '';
        artists.forEach(artist => {
          const div = document.createElement('div');
          div.className = 'item';
          const imgSrc = (artist.images && artist.images.length) ? artist.images[0].url : 'https://via.placeholder.com/150';
          div.innerHTML = `
            <a href="${artist.external_urls.spotify}" target="_blank">
              <img src="${imgSrc}" alt="Artist">
              <div class="title" title="${artist.name}">${artist.name}</div>
            </a>
          `;
          artistsItems.appendChild(div);
        });
        if (data.total > 20) {
          verMasTopArtists.style.display = 'block';
          verMasTopArtists.href = `/more/?type=top-artists&access_token=${accessToken}`;
        } else {
          verMasTopArtists.style.display = 'none';
        }
      }
    })
    .catch(console.error);

  // Últimas canciones reproducidas en LISTA (usando recently-played)
  fetch(`${API_BASE_URL}/spotify/recently-played?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      const recentTracks = data.items || [];
      if (recentTracks.length) {
        recentList.style.display = 'block';
        recentList.innerHTML = '';
        document.getElementById('recentPlayedTitle').style.display = 'block';
        recentTracks.forEach(item => {
          const track = item.track;
          const playedAt = new Date(item.played_at).toLocaleString();
          const li = document.createElement('li');
          li.className = 'recent-item d-flex justify-content-between align-items-center mb-2';
          li.innerHTML = `
            <div class="d-flex align-items-center">
              <img src="${track.album.images[0]?.url || ''}" alt="Cover" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
              <div>
                <div class="track-name">${track.name}</div>
                <div class="track-artists text-muted">${track.artists.map(artist => artist.name).join(', ')}</div>
              </div>
            </div>
            <div class="track-played-at text-muted">${playedAt}</div>
          `;
          recentList.appendChild(li);
        });
        if (data.next) {
          verMasRecentlyPlayed.style.display = 'block';
          verMasRecentlyPlayed.href = `/more/?type=recently-played&access_token=${accessToken}`;
        } else {
          verMasRecentlyPlayed.style.display = 'none';
        }
      }
    })
    .catch(console.error);

  // Géneros (calculados a partir de los top artists)
  fetch(`${API_BASE_URL}/spotify/top-artists?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      const artists = data.items || [];
      if (artists.length) {
        let genreCounts = {};
        artists.forEach(artist => {
          artist.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        });
        const sortedGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);
        if (sortedGenres.length) {
          genresTitle.style.display = 'block';
          genresSlider.style.display = 'block';
          genresItems.innerHTML = '';
          sortedGenres.slice(0, 20).forEach(genre => {
            const div = document.createElement('div');
            div.className = 'item no-img';
            div.innerHTML = `<div title="${genre}">${genre}</div>`;
            genresItems.appendChild(div);
          });
          if (sortedGenres.length > 20) {
            verMasGenres.style.display = 'block';
            verMasGenres.href = `/more/?type=genres&access_token=${accessToken}`;
          } else {
            verMasGenres.style.display = 'none';
          }
        }
      }
    })
    .catch(console.error);
}