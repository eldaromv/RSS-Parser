import onChange from 'on-change';

const clearMessage = (paragraph) => {
  paragraph.classList.remove('text-danger');
  paragraph.classList.remove('text-success');
  // eslint-disable-next-line no-param-reassign
  paragraph.textContent = '';
};

const showMessage = (paragraph, message) => {
  // eslint-disable-next-line no-param-reassign
  paragraph.textContent = message;
};

const showErrorMessage = (paragraph, error, i18nextInstance) => {
  const message = i18nextInstance.t(error.message);
  clearMessage(paragraph);
  showMessage(paragraph, message);
  paragraph.classList.add('text-danger');
};

const processHandler = (entities, processStatus, i18nextInstance) => {
  switch (processStatus) {
    case 'wait':
      clearMessage(entities.feedback);
      break;
    case 'added':
      clearMessage(entities.feedback);
      entities.feedback.classList.add('text-success');
      showMessage(entities.feedback, i18nextInstance.t('rss.added'));
      entities.form.objectForm.reset();
      entities.form.input.focus();
      break;
    case 'loading':
      break;
    case 'failed':
      entities.feedback.classList.add('text-danger');
      showMessage(entities.feedback, i18nextInstance.t('rss.invalid'));
      entities.form.input.focus();
      break;
    default:
      throw new Error(`Unknown 'sendingProcess.status': ${processStatus}`);
  }
};

const createCardUl = (buttonName, entityType, i18nextInstance) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = i18nextInstance.t(buttonName);
  cardBody.append(title);
  const ul = document.createElement('ul');
  ul.setAttribute('id', entityType);
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(cardBody, ul);
  return card;
};

const clearDiv = (div) => {
  // eslint-disable-next-line no-param-reassign
  div.innerHTML = '';
};

const showFeeds = (div, state, i18nextInstance) => {
  clearDiv(div);
  const entityType = 'ulFeeds';
  div.append(createCardUl('feeds.title', entityType, i18nextInstance));
  const ul = document.querySelector(`#${entityType}`);
  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    li.append(h3);
    const tagP = document.createElement('p');
    tagP.classList.add('m-0', 'small', 'text-black-50');
    tagP.textContent = feed.description;
    li.append(tagP);
    ul.append(li);
  });
};

const isViewedPosts = (postId, viewedPosts) => viewedPosts.find((post) => post.id === postId);

const setPost = (post, buttonName, state) => {
  const li = document.createElement('li');
  li.classList.add(
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-items-start',
    'border-0',
    'border-end-0',
  );
  const linkTag = document.createElement('a');
  const fontClass = !isViewedPosts(post.id, state.openedPosts) ? 'fw-bold' : 'fw-normal';
  linkTag.classList.add(fontClass);
  linkTag.setAttribute('href', post.link);
  linkTag.setAttribute('data-id', post.id);
  linkTag.setAttribute('target', '_blank');
  linkTag.setAttribute('rel', 'noopener noreferrer');
  linkTag.textContent = post.title;
  li.append(linkTag);

  const button = document.createElement('button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.setAttribute('type', 'button');
  button.setAttribute('data-id', post.id);
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  button.textContent = buttonName;
  li.append(button);
  return li;
};

const showPosts = (div, state, i18nextInstance) => {
  clearDiv(div);
  const entityType = 'ulPosts';
  div.append(createCardUl('posts.title', 'ulPosts', i18nextInstance));
  const ul = document.querySelector(`#${entityType}`);
  const buttonName = i18nextInstance.t('posts.button');
  state.posts.forEach((post) => ul.append(setPost(post, buttonName, state)));
};

const openModal = (post, modalDiv) => {
  const modal = modalDiv;
  modal.querySelector('.modal-title').textContent = post.title;
  modal.querySelector('.modal-body').textContent = post.description;
};

const showModalPost = (postId, entities, state) => {
  const post = state.posts.find((currentPost) => currentPost.id === postId);
  Array.from(entities.postsDiv.querySelector('ul').children)
    .forEach((li) => {
      const link = li.firstChild;
      if (link.getAttribute('data-id') === post.id) {
        link.classList.remove('fw-bold');
        link.classList.add('fw-normal', 'link-secondary');
      }
    });
  openModal(post, entities.modal);
};

export default (state, entities, i18nextInstance) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.isValid':
      entities.form.input.classList.toggle('is-invalid', !value);
      entities.form.input.focus();
      break;
    case 'sendingProcess.status':
      processHandler(entities, state.sendingProcess.status, i18nextInstance);
      break;
    case 'sendingProcess.errors':
      showErrorMessage(entities.feedback, state.sendingProcess.errors, i18nextInstance);
      break;
    case 'form.errors':
      showErrorMessage(entities.feedback, value, i18nextInstance);
      break;
    case 'loading':
      break;
    case 'feeds':
      showFeeds(entities.feedsDiv, state, i18nextInstance);
      break;
    case 'posts':
      showPosts(entities.postsDiv, state, i18nextInstance);
      break;
    case 'openedPosts':
      break;
    case 'openedPostInModal':
      showModalPost(value, entities, state);
      break;
    default:
      throw new Error(`Unknown 'path': ${path}`);
  }
});