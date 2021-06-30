let elem = document.querySelector('.infinite-scroll-container');
let infScroll = new InfiniteScroll( elem, {
  path: 'campgrounds/page-{{#}}',
  append: '.infinite-card',
  history: false,
  status: '.page-load-status'
});