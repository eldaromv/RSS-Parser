import i18next from 'i18next';
import axios from 'axios';
import watch from './view';
import validator from './validator';
import parseRss from './rssParser';
import resources from './lang/langs.js';

const language = 'ru';
const allOriginsProxyUrl = 'https://allorigins.hexlet.app/get';
const errorsCodes = {
  ERR_NETWORK: new Error('network_error'),
  ECONNABORTED: new Error('request_timed_out'),
};

const getRssData = (url) => {
  const objectUrl = new URL(allOriginsProxyUrl);
  objectUrl.searchParams.set('disableCache', 'true');
  objectUrl.searchParams.set('url', url);
  return objectUrl.href;
};

const app = (entities, initState, i18nextInstance, axiosInstance) => {
  const state = { ...initState };
  const watchedState = watch(state, entities, i18nextInstance);

  const feedRequest = (url) => {
    axiosInstance.get(getRssData(url))
      .then(({ data }) => {
        const { feed, posts } = parseRss(data.contents);
        watchedState.feeds = [...watchedState.feeds, { url, ...feed }];
        watchedState.posts = [...watchedState.posts, ...posts];
        watchedState.sendingProcess.status = 'added';
      })
      .catch((error) => {
        watchedState.sendingProcess.errors = errorsCodes[error.code] ?? error;
        watchedState.sendingProcess.status = 'failed';
      });
  };

  const onSubmittedForm = (e) => {
    e.preventDefault();

    const url = new FormData(e.target).get('url');
    const urls = state.feeds.map((feed) => feed.url);
    validator(url, urls).then((result) => {
      if (result) {
        watchedState.form.errors = result;
        watchedState.form.isValid = false;
        return;
      }
      watchedState.sendingProcess.status = 'loading';
      feedRequest(url);
    });
  };

  entities.form.objectForm.addEventListener('submit', onSubmittedForm);
};

export default () => {
  const entities = {
    form: {
      objectForm: document.querySelector('.rss-form'),
      input: document.querySelector('#url-input'),
      btnSubmit: document.querySelector('button[type="submit"]'),
    },
    feedback: document.querySelector('.feedback'),
    feedsDiv: document.querySelector('.feeds'),
    postsDiv: document.querySelector('.posts'),
  };

  const initState = {
    form: {
      isValid: true,
      errors: null,
    },
    sendingProcess: {
      status: 'wait',
      errors: null,
    },
    feeds: [],
    posts: [],
    language,
  };

  const i18nextInstance = i18next.createInstance();
  const axiosInstance = axios.create({
    timeout: 10000,
  });

  i18nextInstance
    .init({
      debug: false,
      resources,
      fallbackLng: initState.language,
    })
    .then(() => {
      app(entities, initState, i18nextInstance, axiosInstance);
    })
    .catch((error) => { throw error.message; });
};