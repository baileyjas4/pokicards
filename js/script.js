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