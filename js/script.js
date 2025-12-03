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
