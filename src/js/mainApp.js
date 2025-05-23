const API_BASE_URL = 'https://api.broslunas.com';

function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}
const accessToken = getQueryParam('access_token');

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

const recentList = document.getElementById('recentList');
const recentPlayedTitle = document.getElementById('recentPlayedTitle');

const verMasTopTracks = document.getElementById('verMasTopTracks');
const verMasTopArtists = document.getElementById('verMasTopArtists');
const verMasGenres = document.getElementById('verMasGenres');
const verMasRecentlyPlayed = document.getElementById('verMasRecentlyPlayed');

const tracksLeftBtn = document.getElementById('tracksLeft');
const tracksRightBtn = document.getElementById('tracksRight');
const artistsLeftBtn = document.getElementById('artistsLeft');
const artistsRightBtn = document.getElementById('artistsRight');
const genresLeftBtn = document.getElementById('genresLeft');
const genresRightBtn = document.getElementById('genresRight');

const playbackControls = document.getElementById('playbackControls');

const playlistsTitle = document.getElementById('playlistsTitle');
const playlistsSlider = document.getElementById('playlistsSlider');
const playlistsItems = document.getElementById('playlistsItems');
const playlistsLeftBtn = document.getElementById('playlistsLeft');
const playlistsRightBtn = document.getElementById('playlistsRight');

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
playlistsLeftBtn.addEventListener('click', () => slide(playlistsItems, -150));
playlistsRightBtn.addEventListener('click', () => slide(playlistsItems, 150));

if (accessToken) {
  loginDiv.style.display = 'none';
  topBar.style.display = 'flex';
  timeRangeNote.style.display = 'block';
  playbackControls.style.display = 'block';

  const handleResponse = (endpoint, method = 'PUT') => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return Promise.resolve();
      }
      return response.json();
    })
    .catch(err => {
      console.error('Error en la petición', err);
      throw err;
    });
  };

  // --- Botón de Repetir ---
  const repeatBtn = document.getElementById('repeatBtn');
  let repeatMode = 'off';
  repeatBtn.addEventListener('click', () => {
    if (repeatMode === 'off') {
      repeatMode = 'context';
    } else if (repeatMode === 'context') {
      repeatMode = 'track';
    } else {
      repeatMode = 'off';
    }
  
    handleResponse(`/spotify/repeat?access_token=${accessToken}&state=${repeatMode}`, 'PUT')
      .then(() => {
        if (repeatMode === 'off') {
          repeatBtn.innerHTML = `<i class="fas fa-redo" style="color: gray"></i>`;
        } else if (repeatMode === 'context') {
          repeatBtn.innerHTML = `<i class="fas fa-redo" style="color: white"></i>`;
        } else if (repeatMode === 'track') {
          repeatBtn.innerHTML = `
            <div class="repeat-container">
              <i class="fas fa-redo" style="color: white;"></i>
              <span class="repeat-indicator">1</span>
            </div>
          `;
        }
      })
      .catch(err => console.error("Error ajustando el modo de repetición:", err));
  });

  // --- Botón de Aleatorio (Shuffle) ---
  const shuffleBtn = document.getElementById('shuffleBtn');
  let shuffleActive = false;
  shuffleBtn.addEventListener('click', () => {
    shuffleActive = !shuffleActive;
    const state = shuffleActive ? 'true' : 'false';
    handleResponse(`/spotify/shuffle?access_token=${accessToken}&state=${state}`, 'PUT')
      .then(data => {
        console.log("Modo aleatorio ajustado:", state, data);
        if (shuffleActive) {
          shuffleBtn.innerHTML = `<i class="fas fa-random" style="color: white"></i>`;
        } else {
          shuffleBtn.innerHTML = `<i class="fas fa-random" style="color: gray"></i>`;
        }
      })
      .catch(err => console.error("Error ajustando el modo aleatorio:", err));
  });

  let isPlaying = false;
  function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }

  function updateCurrentlyPlaying() {
    fetch(`${API_BASE_URL}/spotify/currently-playing?access_token=${accessToken}`)
      .then(res => res.json())
      .then(data => {
        if (data.is_playing && data.item) {
          isPlaying = true;
          currentlyPlayingSection.style.display = 'block';
          let artists = data.item.artists.map(artist => artist.name).join(' • ');
          const progress = data.progress_ms || 0;
          const duration = data.item.duration_ms || 1;
          const progressPercent = (progress / duration * 100).toFixed(2);
          
          nowPlayingInfo.innerHTML = `
            <div class="np-card">
              <img class="np-album" src="${data.item.album.images[0]?.url || ''}" alt="Cover">
              <div class="np-info">
                <div class="np-text">
                  <h3 class="np-title">${data.item.name}</h3>
                  <p class="np-artists">${artists}</p>
                </div>
                <div class="np-progress">
                  <div class="progress-container">
                    <div class="progress-bar" id="progressBar" style="width: ${progressPercent}%"></div>
                  </div>
                  <div class="time-info">
                    <span id="currentTime">${formatTime(progress)}</span>
                    <span id="duration">${formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
          document.getElementById('playPauseBtn').innerHTML = `<i style="color: white" class="fas fa-pause"></i>`;
          setTimeout(updateCurrentlyPlaying, 750);
        } else {
          isPlaying = false;
          currentlyPlayingSection.style.display = 'block';
          document.getElementById('playPauseBtn').innerHTML = `<i style="color: white" class="fas fa-play"></i>`;
          setTimeout(updateCurrentlyPlaying, 2000);
        }
      })
      .catch(() => {
        isPlaying = false;
        document.getElementById('playPauseBtn').innerHTML = `<i style="color: white" class="fas fa-play"></i>`;
        currentlyPlayingSection.style.display = 'block';
        setTimeout(updateCurrentlyPlaying, 2000);
      });
  }
  
  const playPauseBtn = document.getElementById('playPauseBtn');
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      handleResponse(`/spotify/pause?access_token=${accessToken}`, 'PUT')
        .catch(console.error);
      isPlaying = false;
      playPauseBtn.innerHTML = `<i style="color: white" class="fas fa-play"></i>`;
    } else {
      handleResponse(`/spotify/play?access_token=${accessToken}`, 'PUT')
        .catch(console.error);
      isPlaying = true;
      playPauseBtn.innerHTML = `<i style="color: white" class="fas fa-pause"></i>`;
    }
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    handleResponse(`/spotify/next?access_token=${accessToken}`, 'POST')
      .catch(console.error);
  });

  document.getElementById('prevBtn').addEventListener('click', () => {
    handleResponse(`/spotify/previous?access_token=${accessToken}`, 'POST')
      .catch(console.error);
  });

  fetch(`${API_BASE_URL}/spotify/profile?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      userImg.src = (data.images && data.images.length) ? data.images[0].url : 'https://cdn.broslunas.com/img/user.png';
      userName.textContent = data.display_name || 'Usuario Spotify';
    })
    .catch(console.error);

  fetch(`${API_BASE_URL}/spotify/currently-playing?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      if (data.is_playing && data.item) {
        currentlyPlayingSection.style.display = 'block';
        let artists = data.item.artists.map(artist => artist.name).join(' • ');
        const progress = data.progress_ms || 0;
        const duration = data.item.duration_ms || 1;
        const progressPercent = (progress / duration * 100).toFixed(2);
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
        if (data.is_playing) {
          setTimeout(updateCurrentlyPlaying, 1000);
        }
      } else {
        currentlyPlayingSection.style.display = 'none';
      }
    })
    .catch(() => currentlyPlayingSection.style.display = 'none');

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
        if (data.total > 20) {
          verMasTopTracks.style.display = 'block';
          verMasTopTracks.href = `/more/?type=top-tracks&access_token=${accessToken}`;
        } else {
          verMasTopTracks.style.display = 'none';
        }
      }
    })
    .catch(console.error);

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

  fetch(`${API_BASE_URL}/spotify/recently-played?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      const recentTracks = data.items || [];
      if (recentTracks.length) {
        recentList.style.display = 'block';
        recentList.innerHTML = '';
        recentPlayedTitle.style.display = 'block';
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

  // --- Cargar playlists y redirigir al hacer click en la playlist ---
  fetch(`${API_BASE_URL}/spotify/playlists?access_token=${accessToken}`)
    .then(res => res.json())
    .then(playlistData => {
      let playlists = playlistData.items || [];
      if (playlists.length) {
        playlistsTitle.style.display = 'block';
        playlistsSlider.style.display = 'block';
        playlistsItems.innerHTML = '';
        playlists.forEach(playlist => {
          const div = document.createElement('div');
          div.className = 'item';
          div.innerHTML = `
            <div class="playlist-card" data-context-uri="${playlist.uri}">
              <img src="${(playlist.images && playlist.images.length) ? playlist.images[0].url : 'https://via.placeholder.com/150'}" alt="Playlist">
              <div class="playlist-info">
                <div class="title" title="${playlist.name}">${playlist.name}</div>
              </div>
            </div>
          `;
          playlistsItems.appendChild(div);
          
          // Extraer el playlist_id del URI (formato: spotify:playlist:<playlist_id>)
          const contextUri = playlist.uri;
          const parts = contextUri.split(':');
          const playlistId = parts[2];
          div.querySelector('.playlist-card').addEventListener('click', () => {
            window.location.href = `/playlist/?playlist_id=${playlistId}&access_token=${accessToken}`;
          });
        });
      }
    })
    .catch(err => console.error('Error al cargar playlists:', err));
}
