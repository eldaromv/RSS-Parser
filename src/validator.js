import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'url.invalid',
  },
  mixed: {
    required: 'url.required',
    notOneOf: 'url.exists',
  },
});

export default (newUrl, urls) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(urls);
  return schema
    .validate(newUrl, { abortEarly: true });
};
