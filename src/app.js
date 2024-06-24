import i18next from 'i18next';
import watch from './view';
import validator from './validator';
import resources from './lang/langs.js';

const language = 'ru';

const app = (entities, initState, i18nextInstance) => {
  const state = { ...initState };
  const watchedState = watch(state, entities, i18nextInstance);

  const sendingForm = (e) => {
    e.preventDefault();

    const url = new FormData(e.target).get('url');
    validator(url, state.feeds).then((result) => {
      if (result) {
        watchedState.form.errors = result;
        watchedState.form.isValid = false;
        watchedState.sendingProcess.status = 'failed';
        return;
      }
      watchedState.sendingProcess.status = 'loading';
      // отправка формы
      watchedState.feeds = [...watchedState.feeds, url];
      watchedState.sendingProcess.status = 'added';
    });
  };

  entities.form.objectForm.addEventListener('submit', sendingForm);
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
    language,
  };

  const i18nextInstance = i18next.createInstance();
  console.log(initState.language);
  i18nextInstance
    .init({
      debug: false,
      resources,
      fallbackLng: initState.language,
    })
    .then(() => {
      app(entities, initState, i18nextInstance);
    })
    .catch((error) => { throw error.message; });
};