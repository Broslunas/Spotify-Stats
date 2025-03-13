function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}
const type = getQueryParam('type');
const accessToken = getQueryParam('access_token');

// Configurar el botón de volver y el enlace del navbar
if (accessToken) {
    document.getElementById('homeLink').href = `/?access_token=${accessToken}`;
} else {
    document.getElementById('homeLink').href = `/`;
}

const pageTitle = document.getElementById('pageTitle');
const itemsContainer = document.getElementById('itemsContainer');

if (!accessToken) {
    itemsContainer.innerHTML = '<p>Error: No se proporcionó el access token</p>';
} else {
    let endpoint = '';
    let title = '';
    if (type === 'top-tracks') {
        endpoint = `https://api.broslunas.com/spotify/top-tracks?access_token=${accessToken}`;
        title = 'Tus canciones más escuchadas';
    } else if (type === 'top-artists') {
        endpoint = `https://api.broslunas.com/spotify/top-artists?access_token=${accessToken}`;
        title = 'Tus artistas más escuchados';
    } else if (type === 'recently-played') {
        endpoint = `https://api.broslunas.com/spotify/recently-played?access_token=${accessToken}`;
        title = 'Últimas canciones escuchadas';
    } else if (type === 'genres') {
        endpoint = `https://api.broslunas.com/spotify/top-artists?access_token=${accessToken}`;
        title = 'Tus géneros más escuchados';
    } else {
        itemsContainer.innerHTML = '<p>Error: Tipo desconocido</p>';
    }
    pageTitle.innerText = title;

    fetch(endpoint)
        .then(res => res.json())
        .then(data => {
        let items = [];
        if (type === 'top-tracks') {
            items = data.items || [];
            items.forEach(track => {
                const col = document.createElement('div');
                col.className = 'col-6 col-md-4 col-lg-3 mb-3';
                const imgSrc = track.album.images[0]?.url || '';
                col.innerHTML = `
                    <div class="card">
                        <img src="${imgSrc}" class="card-img-top" alt="Track">
                        <div class="card-body">
                            <h2 class="card-title" title="${track.name}">${track.name}</h2>
                            <p class="card-text" title="${track.artists[0].name}">${track.artists[0].name}</p>
                            <a href="${track.external_urls.spotify}" target="_blank" class="btn btn-primary btn-sm">Escuchar</a>
                        </div>
                    </div>
                `;
                itemsContainer.appendChild(col);
            });
        } else if (type === 'top-artists') {
            items = data.items || [];
            items.forEach(artist => {
                const col = document.createElement('div');
                col.className = 'col-6 col-md-4 col-lg-3 mb-3';
                const imgSrc = (artist.images && artist.images.length) ? artist.images[0].url : 'https://via.placeholder.com/150';
                col.innerHTML = `
                    <div class="card">
                        <img src="${imgSrc}" class="card-img-top" alt="Artist">
                        <div class="card-body">
                            <h2 class="card-title" title="${artist.name}">${artist.name}</h2>
                            <a href="${artist.external_urls.spotify}" target="_blank" class="btn btn-primary btn-sm">Ver en Spotify</a>
                        </div>
                    </div>
                `;
                itemsContainer.appendChild(col);
            });
        } else if (type === 'recently-played') {
            items = data.items || [];
            items.forEach(item => {
                const track = item.track;
                const col = document.createElement('div');
                col.className = 'col-6 col-md-4 col-lg-3 mb-3';
                const imgSrc = track.album.images[0]?.url || '';
                col.innerHTML = `
                    <div class="card">
                        <img src="${imgSrc}" class="card-img-top" alt="Track">
                        <div class="card-body">
                            <h2 class="card-title" title="${track.name}">${track.name}</h2>
                            <p class="card-text" title="${track.artists[0].name}">${track.artists[0].name}</p>
                            <a href="${track.external_urls.spotify}" target="_blank" class="btn btn-primary btn-sm">Escuchar</a>
                        </div>
                    </div>
                `;
                itemsContainer.appendChild(col);
            });
        } else if (type === 'genres') {
            items = data.items || [];
            let genreCounts = {};
            items.forEach(artist => {
            artist.genres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                });
            });
            const sortedGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);
            sortedGenres.forEach(genre => {
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3 mb-3';
            col.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <h2 class="card-title">${genre}</h2>
                        <p class="card-text">Repeticiones: ${genreCounts[genre]}</p>
                    </div>
                </div>
            `;
            itemsContainer.appendChild(col);
            });
        }
        })
        .catch(err => {
            itemsContainer.innerHTML = '<p>Error al obtener los datos.</p>';
            console.error(err);
        });
}