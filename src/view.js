import onChange from 'on-change';

const clearMessage = (paragraph) => {
  paragraph.classList.remove('text-danger');
  paragraph.classList.remove('text-success');
  paragraph.textContent = '';
};

const showMessage = (paragraph, message) => {
  paragraph.textContent = message;
};

const showErrorMessage = (paragraph, error, i18nextInstance) => {
  const message = i18nextInstance.t(error.message);
  clearMessage(paragraph);
  showMessage(paragraph, message);
  paragraph.classList.add('text-danger');
};

const processHandler = (entities, processStatus, i18nextInstance) => {
  console.log(processStatus);
  switch (processStatus) {
    case 'wait':
      clearMessage(entities.feedback);
      break;
    case 'added':
      clearMessage(entities.feedback);
      entities.feedback.classList.add('text-success');
      console.log(i18nextInstance.t());
      showMessage(entities.feedback, i18nextInstance.t('form.added'));
      entities.form.objectForm.reset();
      entities.form.input.focus();
      break;
    case 'loading':
      break;
    case 'failed':
      entities.feedback.classList.add('text-danger');
      showMessage(entities.feedback, 'Ссылка уже существует');
      entities.form.input.focus();
      break;
    default:
      throw new Error(`Unknown 'sendingProcess.status': ${processStatus}`);
  }
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
    case 'loading':
    case 'form.errors':
      showErrorMessage(entities.feedback, value, i18nextInstance);
      break;
    case 'feeds':
      break;
    default:
      throw new Error(`Unknown 'path': ${path}`);
  }
});