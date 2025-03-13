function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }
  const playlistId = getQueryParam('playlist_id');
  const accessToken = getQueryParam('access_token');

  fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('playlistName').textContent = data.name;
    document.getElementById('playlistImage').src = (data.images && data.images.length) ? data.images[0].url : '';
    document.getElementById('playlistDescription').textContent = data.description || 'Sin descripción';
    
    const tracksList = document.getElementById('tracksList');
    data.tracks.items.forEach(item => {
      const track = item.track;
      const li = document.createElement('li');
      li.classList.add('track-item');
      li.innerHTML = `
        <img src="${(track.album.images && track.album.images.length) ? track.album.images[0].url : 'https://via.placeholder.com/50'}" alt="Album cover" class="track-image">
        <div class="track-info">
        <span class="track-name">${track.name}</span>
          <span class="track-artists">${track.artists.map(a => a.name).join(', ')}</span>
        </div>
        <button class="track-play-button">Play</button>
      `;
       // Evento para reproducir la pista al hacer click en el botón (llama a la nueva API del backend)
      li.querySelector('.track-play-button').addEventListener('click', (e) => {
        e.stopPropagation();
        fetch(`https://api.broslunas.com/spotify/play-track?access_token=${accessToken}&track_uri=${encodeURIComponent(track.uri)}`, {
          method: 'PUT'
        })
        .then(res => {
          if (res.status === 204) {
            console.log("Reproduciendo pista:", track.name);
          } else {
            return res.json();
          }
        })
        .then(data => console.log('Respuesta de reproducción:', data))
        .catch(err => console.error('Error al reproducir la pista:', err));
      });
      tracksList.appendChild(li);
    });
    
    // Asignar el comportamiento del botón "Play" para reproducir la playlist completa
    document.getElementById('playButton').addEventListener('click', () => {
      const contextUri = data.uri;
      fetch(`https://api.broslunas.com/spotify/play-playlist?access_token=${accessToken}&context_uri=${encodeURIComponent(contextUri)}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(result => {
        console.log('Reproduciendo playlist:', result);
      })
      .catch(err => console.error('Error al reproducir la playlist:', err));
    });
  })
  .catch(err => {
    console.error(err);
    document.getElementById('playlistName').textContent = "Error al cargar la playlist";
  });
  function updateMiniPlayer() {
  fetch(`https://api.broslunas.com/spotify/currently-playing?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      if(data && data.is_playing && data.item) {
        document.getElementById('miniPlayerImage').src = data.item.album.images[0]?.url || '';
        document.getElementById('miniPlayerTrackName').textContent = data.item.name;
        document.getElementById('miniPlayerArtists').textContent = data.item.artists.map(a => a.name).join(', ');
        document.getElementById('miniPlayerPlayPause').innerHTML = `<i class="fas fa-pause"></i>`;
      } else {
        document.getElementById('miniPlayerImage').src = '';
        document.getElementById('miniPlayerTrackName').textContent = 'Nada reproduciéndose';
        document.getElementById('miniPlayerArtists').textContent = '';
        document.getElementById('miniPlayerPlayPause').innerHTML = `<i class="fas fa-play"></i>`;
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById('miniPlayerTrackName').textContent = 'Error';
    });
}

setInterval(updateMiniPlayer, 5000);
updateMiniPlayer();

document.getElementById('miniPlayerPlayPause').addEventListener('click', () => {
  fetch(`https://api.broslunas.com/spotify/currently-playing?access_token=${accessToken}`)
    .then(res => res.json())
    .then(data => {
      if(data.is_playing) {
        fetch(`https://api.broslunas.com/spotify/pause?access_token=${accessToken}`, { method: 'PUT' })
          .then(() => updateMiniPlayer())
          .catch(console.error);
      } else {
        fetch(`https://api.broslunas.com/spotify/play?access_token=${accessToken}`, { method: 'PUT' })
          .then(() => updateMiniPlayer())
          .catch(console.error);
      }
    });
});