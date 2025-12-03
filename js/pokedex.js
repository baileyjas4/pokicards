// ============================================
// POKEDEX VIEW STATE
// ============================================

let currentCarouselIndex = 0
let currentView = 'cards'

// Cache DOM elements
const pokedexEl = {
    viewToggle: null,
    pokedexView: null,
    cardContainer: null,
    prevBtn: null,
    nextBtn: null
}

// ============================================
// INITIALIZATION
// ============================================

function initPokedexElements() {
    pokedexEl.viewToggle = document.getElementById('view-toggle')
    pokedexEl.pokedexView = document.getElementById('pokedex-view')
    pokedexEl.cardContainer = document.getElementById('card-container')
    pokedexEl.prevBtn = document.getElementById('prev-pokemon')
    pokedexEl.nextBtn = document.getElementById('next-pokemon')
}

// ============================================
// VIEW SWITCHING
// ============================================

function toggleView() {
    const icon = document.getElementById('view-icon')
    const isCardsView = currentView === 'cards'

    // Update state
    currentView = isCardsView ? 'pokedex' : 'cards'

    // Toggle visibility
    pokedexEl.cardContainer.classList.toggle('hidden', isCardsView)
    pokedexEl.pokedexView.classList.toggle('hidden', !isCardsView)

    // Update icon
    icon.src = isCardsView
        ? '../images/pokemon_card_backside.png'   // moving to Pokédex
        : '../images/pd-icon.png'                 // moving to Cards
    icon.alt = isCardsView
        ? 'Switch to Card View'
        : 'Switch to Pokédex View'

    // When switching *to* Pokédex view, reset and render carousel
    if (isCardsView && displayedPokemon?.length > 0) {
        currentCarouselIndex = 0
        updateCarousel()
    }
}

// ============================================
// CAROUSEL UPDATE
// ============================================

function updateCarousel() {
    // Exit if no Pokemon available
    if (typeof displayedPokemon === 'undefined' || !displayedPokemon.length) return

    const pokemon = displayedPokemon[currentCarouselIndex]

    // Update all carousel elements at once
    const updates = {
        'carousel-image': { src: pokemon.image, alt: pokemon.name },
        'carousel-name': { textContent: pokemon.name },
        'carousel-id': { textContent: `#${String(pokemon.id).padStart(3, '0')}` }
    }

    Object.entries(updates).forEach(([id, props]) => {
        const elem = document.getElementById(id)
        Object.entries(props).forEach(([prop, value]) => elem[prop] = value)
    })

    // // Build type badges
    // document.getElementById('carousel-types').innerHTML = pokemon.types
    //     .map(t => `<span class="type-badge type-${t}">${t}</span>`)
    //     .join('')

    // // Build stats display
    // const statLabels = ['HP', 'ATK', 'DEF', 'SP.A', 'SP.D', 'SPD']
    // const statValues = Object.values(pokemon.stats)

    // document.getElementById('carousel-stats').innerHTML = statLabels
    //     .map((label, i) => `
    //         <div class="carousel-stat-item">
    //             <div class="carousel-stat-label">${label}</div>
    //             <div class="carousel-stat-value">${statValues[i]}</div>
    //         </div>
    //     `).join('')
}

// ============================================
// CAROUSEL NAVIGATION
// ============================================

// Navigate carousel with wrapping
function navigate(direction) {
    if (typeof displayedPokemon === 'undefined' || !displayedPokemon.length) return

    const length = displayedPokemon.length
    currentCarouselIndex = direction === 'next'
        ? (currentCarouselIndex + 1) % length
        : (currentCarouselIndex - 1 + length) % length

    updateCarousel()
}

// ============================================
// EVENT LISTENERS
// ============================================

function initPokedexEvents() {
    pokedexEl.viewToggle?.addEventListener('click', toggleView)
    pokedexEl.prevBtn?.addEventListener('click', () => navigate('prev'))
    pokedexEl.nextBtn?.addEventListener('click', () => navigate('next'))
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    initPokedexElements()
    initPokedexEvents()
}

// Start when DOM is ready
document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init()
