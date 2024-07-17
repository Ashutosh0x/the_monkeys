import moment from 'moment';

export const newsDateFormatter = (date?: string) => {
  const publishedDate = moment(date);

  const timeDiffHours = moment().diff(publishedDate, 'hours');
  const timeDiffDays = moment().diff(publishedDate, 'days');

  if (timeDiffDays >= 1) {
    return `${timeDiffDays} days ago`;
  } else {
    return `${timeDiffHours} hours ago`;
  }
};
