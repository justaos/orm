export function msToTime(ms: number) {
  let seconds = Math.floor((ms / 1000) % 60);
  let minutes = Math.floor((ms / (1000 * 60)) % 60);
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  let days = Math.floor(ms / (1000 * 60 * 60 * 24));
  let time = "";
  if (days > 0) {
    time += days + " Days, ";
    ms -= days * (1000 * 60 * 60 * 24);
  }
  if (hours > 0) {
    time += hours + " Hrs, ";
    ms -= hours * (1000 * 60 * 60);
  }
  if (minutes > 0) {
    time += minutes + " Min, ";
    ms -= minutes * (1000 * 60);
  }
  if (seconds > 0) {
    time += seconds + " Sec, ";
    ms -= seconds * 1000;
  }
  return (time += ms + " milliseconds.");
}
