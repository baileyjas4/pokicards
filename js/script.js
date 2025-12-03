const container = document.getElementById("card-container")
const listContainer = document.getElementById("list-container")
const listView = document.getElementById("list-view")
const searchInput = document.getElementById("search")
const typeFilter = document.getElementById("type-filter")
const loadingBox = document.getElementById("loading")
const errorBox = document.getElementById("error")
const themeToggle = document.getElementById("theme-toggle")
const viewToggle = document.getElementById("view-toggle")

let allPokemon = []
let currentView = 'cards' // 'cards' or 'list'

// ============================================
// DARK/LIGHT MODE (PokéDem style with Pokeball icons)
// ============================================
function initializeTheme() {
    const savedTheme = localStorage.getItem('pokiTheme') || 'light'
    applyTheme(savedTheme)
}

function applyTheme(theme) {
    const body = document.body
    const themeIcon = document.getElementById('theme-icon')

    if (theme === 'dark') {
        body.classList.remove("light-mode")
        body.classList.add("dark-mode")
        // Premier Ball for dark mode (white ball)
        themeIcon.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/premier-ball.png'
        themeIcon.alt = 'Switch to Light Mode'
    } else {
        body.classList.remove("dark-mode")
        body.classList.add("light-mode")
        // Master Ball for light mode (purple ball)
        themeIcon.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png'
        themeIcon.alt = 'Switch to Dark Mode'
    }
    localStorage.setItem('pokiTheme', theme)
}

themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.classList.contains("dark-mode") ? 'dark' : 'light'
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    applyTheme(newTheme)
})

// ============================================
// FETCH POKÉMON
// ============================================
async function getPokemon() {
    loadingBox.classList.remove("hidden")
    errorBox.classList.add("hidden")

    try {
        const requests = []
        for (let i = 1; i <= 150; i++) {
            requests.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`))
        }

        const responses = await Promise.all(requests)

        const failedRequests = responses.filter(r => !r.ok)
        if (failedRequests.length > 0) {
            throw new Error(`Failed to fetch ${failedRequests.length} Pokemon`)
        }

        const pokemon = await Promise.all(responses.map(r => r.json()))

        allPokemon = pokemon
        renderCards(allPokemon)
        populateTypeFilter(allPokemon)

    } catch (err) {
        console.error('Error fetching Pokemon:', err)
        errorBox.classList.remove("hidden")
        errorBox.textContent = `⚠ Failed to load Pokémon: ${err.message}`
    } finally {
        loadingBox.classList.add("hidden")
    }
}

// ============================================
// RENDER CARDS VIEW
// ============================================
function renderCards(list) {
    container.innerHTML = ""

    if (list.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1 text-align: center padding: 40px color: var(--text-color)">
                <p style="font-size: 1.5rem">No Pokémon found matching your search!</p>
                <p style="margin-top: 10px">Try a different name or type filter.</p>
            </div>
        `
        return
    }

    list.forEach(p => {
        const types = p.types.map(t => t.type.name)
        const primaryType = types[0]
        const sprite = p.sprites.other["official-artwork"]?.front_default || p.sprites.front_default
        const animatedSprite = p.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || sprite

        const card = document.createElement("div")
        card.classList.add("card")
        card.dataset.pokemonId = p.id
        card.dataset.pokemonName = p.name

        card.innerHTML = `
            <div class="inner-card type-${primaryType}">
                <div class="card-front">
                    <img src="${sprite}" data-static="${sprite}" data-animated="${animatedSprite}" alt="${p.name}">
                    <div class="poke-name">${p.name}</div>
                    <div class="type-label">${types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" / ")}</div>
                </div>
                <div class="card-back">
                    <div class="poke-name">${p.name}</div>
                    <p><strong>ID:</strong> #${String(p.id).padStart(3, '0')}</p>
                    <p><strong>Height:</strong> ${p.height}</p>
                    <p><strong>Weight:</strong> ${p.weight}</p>
                    <p><strong>Base XP:</strong> ${p.base_experience || 'N/A'}</p>
                    <div class="type-label">Type: ${types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" / ")}</div>
                    <img src="${animatedSprite}" class="back-sprite" alt="${p.name}">
                </div>
            </div>
        `
        container.appendChild(card)

        const img = card.querySelector("img")
        const innerCard = card.querySelector(".inner-card")

        card.addEventListener("mouseenter", () => {
            if (!innerCard.classList.contains("flipped")) {
                img.src = img.dataset.animated
            }
        })

        card.addEventListener("mouseleave", () => {
            if (!innerCard.classList.contains("flipped")) {
                img.src = img.dataset.static
            }
        })

        card.addEventListener("click", () => {
            innerCard.classList.toggle("flipped")

            if (innerCard.classList.contains("flipped")) {
                const audio = new Audio(`https://play.pokemonshowdown.com/audio/cries/${p.name}.mp3`)
                audio.volume = 0.3
                audio.play().catch(err => {
                    console.log(`Could not play cry for ${p.name}:`, err)
                })
            }
        })
    })
}
// ============================================
// RENDER LIST VIEW
// ============================================
function renderListView(list) {
    listContainer.innerHTML = ""

    if (list.length === 0) {
        listContainer.innerHTML = `
            <div class="no-results">
                <p style="font-size: 1.5rem">No Pokémon found matching your search!</p>
                <p style="margin-top: 10px">Try a different name or type filter.</p>
            </div>
        `
        return
    }

    list.forEach(p => {
        const types = p.types.map(t => t.type.name)
        const sprite = p.sprites.other["official-artwork"]?.front_default || p.sprites.front_default

        const listItem = document.createElement("div")
        listItem.classList.add("list-item")
        listItem.dataset.pokemonId = p.id

        listItem.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-image">
                    <img src="${sprite}" alt="${p.name}">
                </div>
                <div class="list-item-info">
                    <div class="list-item-header">
                        <span class="list-item-id">#${String(p.id).padStart(3, '0')}</span>
                        <span class="list-item-name">${p.name}</span>
                    </div>
                    <div class="list-item-types">
                        ${types.map(t => `<span class="type-badge type-${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</span>`).join('')}
                    </div>
                    <div class="list-item-stats">
                        <span><strong>Height:</strong> ${p.height}</span>
                        <span><strong>Weight:</strong> ${p.weight}</span>
                        <span><strong>Base XP:</strong> ${p.base_experience || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `

        // Click to play cry
        listItem.addEventListener('click', () => {
            const audio = new Audio(`https://play.pokemonshowdown.com/audio/cries/${p.name}.mp3`)
            audio.volume = 0.3
            audio.play().catch(err => {
                console.log(`Could not play cry for ${p.name}:`, err)
            })

            // Highlight effect
            listItem.style.transform = 'scale(1.02)'
            setTimeout(() => {
                listItem.style.transform = 'scale(1)'
            }, 200)
        })

        listContainer.appendChild(listItem)
    })
}

// ============================================
// POPULATE TYPE FILTER
// ============================================
function populateTypeFilter(pokemonList) {
    typeFilter.innerHTML = '<option value="">Filter by Type</option>'

    const types = new Set()
    pokemonList.forEach(p => p.types.forEach(t => types.add(t.type.name)))

    const sortedTypes = Array.from(types).sort()

    sortedTypes.forEach(type => {
        const option = document.createElement("option")
        option.value = type
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1)
        typeFilter.appendChild(option)
    })
}

// ============================================
// FILTER FUNCTION
// ============================================
function filterPokemon() {
    const text = searchInput.value.toLowerCase().trim()
    const selectedType = typeFilter.value

    let filtered = allPokemon

    if (text) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(text) ||
            p.id.toString().includes(text)
        )
    }

    if (selectedType) {
        filtered = filtered.filter(p =>
            p.types.some(t => t.type.name === selectedType)
        )
    }

    // Render appropriate view
    if (currentView === 'cards') {
        renderCards(filtered)
    } else {
        renderListView(filtered)
    }
}

searchInput.addEventListener("input", filterPokemon)
typeFilter.addEventListener("change", filterPokemon)

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    // Press 'T' to toggle theme
    if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement !== searchInput) {
            themeToggle.click()
        }
    }

    // Press 'V' to toggle view
    if (e.key.toLowerCase() === 'v' && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement !== searchInput) {
            viewToggle.click()
        }
    }

    // Press '/' to focus search
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        searchInput.focus()
    }

    // Press Escape to clear search
    if (e.key === 'Escape') {
        searchInput.value = ''
        typeFilter.value = ''
        filterPokemon()
        searchInput.blur()
    }
})

// ============================================
// INITIALIZE APP
// ============================================
function initializeApp() {
    console.log('Poki Cards initialized!')
    console.log('Tips:')
    console.log('  - Press "T" to toggle theme')
    console.log('  - Press "V" to toggle view (cards/list)')
    console.log('  - Press "/" to search')
    console.log('  - Press "Esc" to clear')
    initializeTheme()
    getPokemon()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp)
} else {
    initializeApp()
}