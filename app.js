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

const recentTitle = document.getElementById('recentTitle');
const recentSlider = document.getElementById('recentSlider');
const recentItems = document.getElementById('recentItems');

// Botones "Ver más" (ocultos por defecto en el HTML)
const verMasTopTracks = document.getElementById('verMasTopTracks');
const verMasTopArtists = document.getElementById('verMasTopArtists');
const verMasGenres = document.getElementById('verMasGenres');
const verMasRecentlyPlayed = document.getElementById('verMasRecentlyPlayed');

// Botones de control para los sliders
const tracksLeftBtn = document.getElementById('tracksLeft');
const tracksRightBtn = document.getElementById('tracksRight');
const artistsLeftBtn = document.getElementById('artistsLeft');
const artistsRightBtn = document.getElementById('artistsRight');
const genresLeftBtn = document.getElementById('genresLeft');
const genresRightBtn = document.getElementById('genresRight');
const recentLeftBtn = document.getElementById('recentLeft');
const recentRightBtn = document.getElementById('recentRight');

// Evento para cerrar sesión
logoutBtn.addEventListener('click', () => {
  window.location.href = '/';
});

// Función para desplazar el slider
function slide(container, amount) {
  container.scrollBy({ left: amount, behavior: 'smooth' });
}
tracksLeftBtn.addEventListener('click', () => slide(tracksItems, -150));
tracksRightBtn.addEventListener('click', () => slide(tracksItems, 150));
artistsLeftBtn.addEventListener('click', () => slide(artistsItems, -150));
artistsRightBtn.addEventListener('click', () => slide(artistsItems, 150));
genresLeftBtn.addEventListener('click', () => slide(genresItems, -150));
genresRightBtn.addEventListener('click', () => slide(genresItems, 150));
recentLeftBtn.addEventListener('click', () => slide(recentItems, -150));
recentRightBtn.addEventListener('click', () => slide(recentItems, 150));

// Si existe el access token, mostramos la info
if (accessToken) {
  loginDiv.style.display = 'none';
  topBar.style.display = 'flex';
  timeRangeNote.style.display = 'block';

  // Perfil del usuario
  fetch(`https://api.broslunas.com/spotify/profile?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      userImg.src = (data.images && data.images.length) ? data.images[0].url : 'https://via.placeholder.com/50';
      userName.textContent = data.display_name || 'Usuario Spotify';
    })
    .catch(console.error);

  // Canción actualmente reproduciéndose
  fetch(`https://api.broslunas.com/spotify/currently-playing?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      if (data.is_playing && data.item) {
        currentlyPlayingSection.style.display = 'block';
        let artists = data.item.artists.map(artist => artist.name).join(' • ');
        nowPlayingInfo.innerHTML = `
          <img src="${data.item.album.images[0]?.url || ''}" alt="Cover">
          <div class="np-info">
            <p style="margin: 0; font-weight: bold;">${data.item.name}</p>
            <p style="margin: 0; color: #b3b3b3;">${artists}</p>
          </div>
        `;
      } else {
        currentlyPlayingSection.style.display = 'none';
      }
    })
    .catch(() => currentlyPlayingSection.style.display = 'none');

  // Top Tracks
  fetch(`https://api.broslunas.com/spotify/top-tracks?access_token=${accessToken}`)
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
        // Mostrar botón "Ver más" solo si hay más de 20 elementos
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
  fetch(`https://api.broslunas.com/spotify/top-artists?access_token=${accessToken}`)
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
        // Mostrar botón "Ver más" solo si hay más de 20 elementos
        if (data.total > 20) {
          verMasTopArtists.style.display = 'block';
          verMasTopArtists.href = `/more/?type=top-artists&access_token=${accessToken}`;
        } else {
          verMasTopArtists.style.display = 'none';
        }
      }
    })
    .catch(console.error);

  // Últimas canciones reproducidas (Recently Played)
  fetch(`https://api.broslunas.com/spotify/recently-played?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      const recentTracks = data.items || [];
      if (recentTracks.length) {
        recentTitle.style.display = 'block';
        recentSlider.style.display = 'block';
        recentItems.innerHTML = '';
        recentTracks.slice(0, 20).forEach(item => {
          const track = item.track;
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
          recentItems.appendChild(div);
        });
        // Para recently played, si hay una siguiente página (data.next) mostramos "Ver más"
        if (data.next) {
          verMasRecentlyPlayed.style.display = 'block';
          verMasRecentlyPlayed.href = `/more/?type=recently-played&access_token=${accessToken}`;
        } else {
          verMasRecentlyPlayed.style.display = 'none';
        }
      }
    })
    .catch(console.error);

  // Géneros: calculamos a partir de los artistas
  fetch(`https://api.broslunas.com/spotify/top-artists?access_token=${accessToken}`)
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
            // Usamos la clase "item no-img" para elementos sin imagen
            div.className = 'item no-img';
            div.innerHTML = `<div title="${genre}">${genre}</div>`;
            genresItems.appendChild(div);
          });
          // Mostrar botón "Ver más" solo si hay más de 20 géneros
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