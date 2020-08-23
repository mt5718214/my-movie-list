const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const MOVIE_PER_PAGE = 12

const movies = []  //電影總清單
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach(item => {
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then(res => {  //藉由id向API,request特定id的資料
    const data = res.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

//產生分頁元素
function renderPaginator(amount) {
  //根據資料量動態產生分頁數量
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE)
  //製作分頁模板 template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="javascript:;" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//取得特定分頁的電影資料
function getMoviesByPage(page) {
  // page 1 -> 0 - 11
  // page 2 -> 12 - 23
  // page 3 -> 24 - 35

  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始 index 
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)  //slice 包含起點不包含終點
}

//加入我的最愛電影
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//監聽分頁事件
paginator.addEventListener('click', function onPageClicked(event) {
  if (event.target.tagName === 'A') {
    const page = Number(event.target.dataset.page)
    renderMovieList(getMoviesByPage(page))
  }
})

//監聽btn事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset.id)
    // showMovieModal(Number(event.target.dataset.id))
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()  //阻止<button type="submit">的預設行為
  const keyword = searchInput.value.trim().toLowerCase()

  if (!keyword) {
    return alert('請輸入有效字串！')
  }

  filteredMovies = movies.filter(movie => {    //加上大括號則需要在裡面加上reutrn
    return movie.title.toLowerCase().includes(keyword)
  })

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword' + keyword)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

//初始化 取得API資料渲覽頁面
axios.get(INDEX_URL).then(res => {
  movies.push(...res.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
}).catch(err => console.log(err))