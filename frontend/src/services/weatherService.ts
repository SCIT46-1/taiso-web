import axios from "axios";

export interface WeatherForecastItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

export interface WeatherResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      dataType: string;
      items: {
        item: WeatherForecastItem[];
      };
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

export interface WeatherInfo {
  temperature: string;
  skyCondition: string;
  precipitation: string;
  precipitationProbability: string;
  humidity: string;
  windSpeed: string;
}

export interface HourlyWeatherInfo {
  time: string;
  weatherInfo: WeatherInfo;
}

const weatherService = {
  async getWeatherForecast(
    date: string,
    time: string,
    nx: number,
    ny: number
  ): Promise<WeatherInfo | null> {
    try {
      const { hourlyForecasts } = await this.getHourlyWeatherForecasts(
        date,
        nx,
        ny
      );

      // Find the forecast closest to the requested time
      const targetTime = time.replace(/:/, "").substring(0, 4);
      const targetHour = parseInt(targetTime.substring(0, 2));

      let closestForecast = hourlyForecasts[0];
      let minDiff = 24;

      for (const forecast of hourlyForecasts) {
        const forecastHour = parseInt(forecast.time.substring(0, 2));
        const diff = Math.abs(forecastHour - targetHour);
        if (diff < minDiff) {
          minDiff = diff;
          closestForecast = forecast;
        }
      }

      return closestForecast ? closestForecast.weatherInfo : null;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  },

  async getHourlyWeatherForecasts(
    date: string,
    nx: number,
    ny: number
  ): Promise<{ hourlyForecasts: HourlyWeatherInfo[]; date: string }> {
    try {
      // Always use today's date and 0500 as base_date and base_time
      const today = new Date();
      const baseDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const baseTime = "0500";

      // Format target date for finding the forecast
      const targetDate = date.replace(/-/g, "");

      const response = await axios.get<WeatherResponse>(
        `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`,
        {
          params: {
            serviceKey:
              "AqpYxirA+lVgNDIECGsaGd1rywZ4Gwc5QEtSdhq5tBIZGdZK6mhGhYikFg9wM2Wwo/xmc878DWrqpRsOxQ0WjQ==",
            pageNo: 1,
            numOfRows: 1000,
            dataType: "JSON",
            base_date: baseDate,
            base_time: baseTime,
            nx,
            ny,
          },
        }
      );

      // Extract hourly forecasts for the target date
      return this.extractHourlyWeatherInfo(response.data, targetDate);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return { hourlyForecasts: [], date: date };
    }
  },

  getSkyCondition(value: string): string {
    switch (value) {
      case "1":
        return "맑음";
      case "3":
        return "구름많음";
      case "4":
        return "흐림";
      default:
        return "알 수 없음";
    }
  },

  getPrecipitationType(value: string): string {
    switch (value) {
      case "0":
        return "없음";
      case "1":
        return "비";
      case "2":
        return "비/눈";
      case "3":
        return "눈";
      case "4":
        return "소나기";
      default:
        return "알 수 없음";
    }
  },

  extractHourlyWeatherInfo(
    data: WeatherResponse,
    targetDate: string
  ): { hourlyForecasts: HourlyWeatherInfo[]; date: string } {
    const items = data.response.body.items.item;

    // Filter items for the target date
    const dateItems = items.filter((item) => item.fcstDate === targetDate);

    if (dateItems.length === 0) {
      return { hourlyForecasts: [], date: targetDate };
    }

    // Get unique forecast times for that date
    const uniqueTimes = [
      ...new Set(dateItems.map((item) => item.fcstTime)),
    ].sort();

    // Create hourly forecasts
    const hourlyForecasts: HourlyWeatherInfo[] = [];

    for (const fcstTime of uniqueTimes) {
      const timeItems = dateItems.filter((item) => item.fcstTime === fcstTime);

      // Create empty weather info object
      const weatherInfo: WeatherInfo = {
        temperature: "정보 없음",
        skyCondition: "정보 없음",
        precipitation: "정보 없음",
        precipitationProbability: "정보 없음",
        humidity: "정보 없음",
        windSpeed: "정보 없음",
      };

      // Fill with data
      timeItems.forEach((item) => {
        switch (item.category) {
          case "TMP":
            weatherInfo.temperature = item.fcstValue;
            break;
          case "SKY":
            weatherInfo.skyCondition = this.getSkyCondition(item.fcstValue);
            break;
          case "PTY":
            weatherInfo.precipitation = this.getPrecipitationType(
              item.fcstValue
            );
            break;
          case "POP":
            weatherInfo.precipitationProbability = item.fcstValue;
            break;
          case "REH":
            weatherInfo.humidity = item.fcstValue;
            break;
          case "WSD":
            weatherInfo.windSpeed = item.fcstValue;
            break;
        }
      });

      // Format time for display (e.g., 1400 -> 14:00)
      const displayTime = `${fcstTime.substring(0, 2)}:${fcstTime.substring(
        2,
        4
      )}`;

      hourlyForecasts.push({
        time: displayTime,
        weatherInfo: weatherInfo,
      });
    }

    // Format date for display
    const displayDate = `${targetDate.substring(0, 4)}-${targetDate.substring(
      4,
      6
    )}-${targetDate.substring(6, 8)}`;

    return {
      hourlyForecasts: hourlyForecasts,
      date: displayDate,
    };
  },

  extractWeatherInfo(
    data: WeatherResponse,
    targetDate: string,
    targetTime: string
  ): WeatherInfo | null {
    const items = data.response.body.items.item;

    // First try: exact match for date and time
    let relevantItems = items.filter(
      (item) => item.fcstDate === targetDate && item.fcstTime === targetTime
    );

    // If no exact match, try just matching the date and find closest time
    if (relevantItems.length === 0) {
      // Get all items for the target date
      const dateItems = items.filter((item) => item.fcstDate === targetDate);

      if (dateItems.length > 0) {
        // Get unique forecast times for that date
        const uniqueTimes = [
          ...new Set(dateItems.map((item) => item.fcstTime)),
        ].sort();

        if (uniqueTimes.length > 0) {
          // Get the closest time
          const targetTimeNum = parseInt(targetTime);
          let closestTime = uniqueTimes[0];
          let minDiff = Math.abs(parseInt(closestTime) - targetTimeNum);

          for (const time of uniqueTimes) {
            const diff = Math.abs(parseInt(time) - targetTimeNum);
            if (diff < minDiff) {
              minDiff = diff;
              closestTime = time;
            }
          }

          // Get items for that time
          relevantItems = dateItems.filter(
            (item) => item.fcstTime === closestTime
          );
        }
      }
    }

    // If still no match, fallback to any available data
    if (relevantItems.length === 0) {
      // If we need to fall back to default values, just return the basic weather info
      return {
        temperature: "정보 없음",
        skyCondition: "정보 없음",
        precipitation: "정보 없음",
        precipitationProbability: "정보 없음",
        humidity: "정보 없음",
        windSpeed: "정보 없음",
      };
    }

    // Extract specific weather information
    const weatherInfo: WeatherInfo = {
      temperature: "정보 없음",
      skyCondition: "정보 없음",
      precipitation: "정보 없음",
      precipitationProbability: "정보 없음",
      humidity: "정보 없음",
      windSpeed: "정보 없음",
    };

    // Get the forecast categories we have for this time
    const categories = relevantItems.map((item) => item.category);

    // Process the matched items
    relevantItems.forEach((item) => {
      switch (item.category) {
        case "TMP":
          weatherInfo.temperature = item.fcstValue;
          break;
        case "SKY":
          weatherInfo.skyCondition = this.getSkyCondition(item.fcstValue);
          break;
        case "PTY":
          weatherInfo.precipitation = this.getPrecipitationType(item.fcstValue);
          break;
        case "POP":
          weatherInfo.precipitationProbability = item.fcstValue;
          break;
        case "REH":
          weatherInfo.humidity = item.fcstValue;
          break;
        case "WSD":
          weatherInfo.windSpeed = item.fcstValue;
          break;
      }
    });

    return weatherInfo;
  },
};

export default weatherService;
