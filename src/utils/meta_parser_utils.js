const primary = ["scheduled", "live", "paused", "finished"];

export function metaDataParser(meta) {
  const metaObject = JSON.parse(meta);
  return metaObject;
}

export function getMainStatus(event, type) {
  switch (event) {
    // SCORE + ACTION events happen only when match is live
    case "score":
    case "action":
      return "live";

    // STATUS events define the real match state
    case "status":
      switch (type) {
        case "match_start":
        case "period_start":
        case "innings_start":
        case "match_resume":
          return "live";

        case "halftime":
        case "innings_break":
        case "rain_delay":
        case "timeout":
          return "paused";

        case "match_end":
          return "finished";

        default:
          return null; // no change to primary status
      }
  }
}

export function getSubStatus(event, type) {
  if (event !== "status") return null; // only status events change subStatus

  switch (type) {
    // CRICKET
    case "innings_start":
      return "innings_1"; // or innings_2 depending on match state
    case "innings_break":
      return "innings_break";
    case "super_over_start":
      return "super_over";

    // FOOTBALL
    case "first_half_start":
      return "first_half";
    case "halftime":
      return "halftime";
    case "second_half_start":
      return "second_half";
    case "extra_time_start":
      return "extra_time";
    case "penalties_start":
      return "penalties";

    // BASKETBALL
    case "Q1_start":
      return "Q1";
    case "Q2_start":
      return "Q2";
    case "Q3_start":
      return "Q3";
    case "Q4_start":
      return "Q4";
    case "timeout":
      return "timeout";

    // GENERIC
    case "period_start":
      return "period_1"; // or 2,3,4 based on match state
    case "rain_delay":
      return "rain_delay";

    default:
      return null; // no subStatus change
  }
}

function getUpdatedScore(matchTeam, metaTeam, value, current) {
  if (matchTeam !== metaTeam) return current ?? 0;
  return (current ?? 0) + value;
}

function getUpdatedWickets(matchTeam, metaTeam, currentWickets) {
  console.log(currentWickets);
  if (matchTeam !== metaTeam) return currentWickets ?? 0;
  return (currentWickets ?? 0) + 1;
}

function getUpdatedOvers(matchTeam, metaTeam, currentOvers) {
  if (matchTeam !== metaTeam) return currentOvers ?? 0;
  return (currentOvers ?? 0) + 1;
}

export function updateOvers(
  homeTeam,
  awayTeam,
  currentHomeOvers,
  currentAwayOvers,
  scoringTeam,
) {
  const updatedHomeOvers = getUpdatedOvers(
    homeTeam,
    scoringTeam,
    currentHomeOvers,
  );

  const updatedAwayOvers = getUpdatedOvers(
    awayTeam,
    scoringTeam,
    currentAwayOvers,
  );

  return {
    updatedHomeOvers,
    updatedAwayOvers,
  };
}

export function updatedWickets(
  homeTeam,
  awayTeam,
  currentHomeWickets,
  currentAwayWickets,
  scoringTeam,
) {
  const updatedHomeWickets = getUpdatedWickets(
    homeTeam,
    scoringTeam,
    currentHomeWickets,
  );

  const updatedAwayWickets = getUpdatedWickets(
    awayTeam,
    scoringTeam,
    currentAwayWickets,
  );

  return {
    updatedHomeWickets,
    updatedAwayWickets,
  };
}

export function updateMatchScore(
  homeTeam,
  awayTeam,
  currentHomeScore,
  currentAwayScore,
  scoringTeam,
  value,
) {
  const updatedHomeScore = getUpdatedScore(
    homeTeam,
    scoringTeam,
    value,
    currentHomeScore,
  );

  const updatedAwayScore = getUpdatedScore(
    awayTeam,
    scoringTeam,
    value,
    currentAwayScore,
  );

  return {
    updatedHomeScore,
    updatedAwayScore,
  };
}
