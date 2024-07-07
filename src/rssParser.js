const isValidXML = (document) => {
  const errorElement = document.querySelector('parsererror');
  return !errorElement;
};

const getPosts = (xmlDocument) => {
  const postElements = xmlDocument.getElementsByTagName('item');

  if (!postElements.length) {
    return [];
  }

  return Array.from(postElements).map((postElement) => {
    const pubDate = postElement.querySelector('pubDate');
    const title = postElement.querySelector('title');
    const description = postElement.querySelector('description');
    const link = postElement.querySelector('link');
    const id = postElement.querySelector('guid');

    return {
      title: title ? title.textContent : null,
      description: description ? description.textContent : null,
      link: link ? link.textContent : null,
      id: id ? id.textContent.replace(/\D/g, '') : null,
      pubDate: pubDate ? Date.parse(pubDate.textContent) : null,
    };
  });
};

const getFeed = (xmlDocument) => {
  const title = xmlDocument.querySelector('title');
  const description = xmlDocument.querySelector('description');

  return {
    title: title ? title.textContent : null,
    description: description ? description.textContent : null,
  };
};

export default (xml) => {
  const xmlDocument = new DOMParser().parseFromString(xml, 'text/xml');

  if (!isValidXML(xmlDocument)) {
    throw new Error('rss.invalid');
  }
  return {
    feed: getFeed(xmlDocument),
    posts: getPosts(xmlDocument),
  };
};
