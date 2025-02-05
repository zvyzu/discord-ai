import config from './config';

const date = new Intl.DateTimeFormat(config.locales.LANG, {
  dateStyle: 'full',
  timeStyle: 'long',
  timeZone: config.locales.TIMEZONE,
}).format(new Date());

export default date;