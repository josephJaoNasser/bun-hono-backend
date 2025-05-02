/**
 * @param {number} minutes the number of minutes to convert into hours and minutes
 * @returns an object with the minutes converted to hours and minutes.
 */
export default function getHoursMinutesJson(minutes = 0) {
  const convertedHours = Math.floor(minutes / 60);
  const convertedMinutes = minutes % 60;

  const hoursMinutesJson = {
    hours: convertedHours,
    minutes: convertedMinutes,
  };

  return hoursMinutesJson;
}
