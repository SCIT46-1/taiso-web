export function getWeatherIcon(
  skyCondition: string,
  precipitation: string
): string {
  if (precipitation !== "없음") {
    if (precipitation === "비") return "🌧️";
    if (precipitation === "눈") return "❄️";
    if (precipitation === "비/눈") return "🌨️";
    if (precipitation === "소나기") return "⛈️";
  }

  if (skyCondition === "맑음") return "☀️";
  if (skyCondition === "구름많음") return "⛅";
  if (skyCondition === "흐림") return "☁️";

  return "❓";
}
